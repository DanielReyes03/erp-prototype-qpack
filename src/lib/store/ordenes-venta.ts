import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import {
  ORDENES_VENTA_SEED,
  type OrdenVenta,
  type OrdenVentaLinea,
} from "@/lib/seed/ordenes-venta";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useInventarioStore } from "@/lib/store/inventario";
import { useDteStore } from "@/lib/store/dte";
import { useContabilidadStore } from "@/lib/store/contabilidad";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface OrdenVentaInput {
  clienteId: string;
  vendedorId: string;
  locacionId: string;
  moneda: "GTQ" | "USD";
  lineas: OrdenVentaLinea[];
  notas?: string;
}

let ovCounter = ORDENES_VENTA_SEED.length + 100;
function nextOvId(): string {
  ovCounter += 1;
  return `OV-${String(ovCounter).padStart(6, "0")}`;
}

/** Costo de mercadería de una orden, a costo de catálogo. */
function costoDeLineas(lineas: OrdenVentaLinea[]): number {
  return round2(
    lineas.reduce((sum, l) => {
      const producto = PRODUCTOS_SEED.find((p) => p.id === l.productoId);
      return sum + (producto?.costo ?? 0) * l.cantidad;
    }, 0),
  );
}

interface OrdenesVentaState {
  ordenes: OrdenVenta[];
  crearOrden: (input: OrdenVentaInput) => Promise<OrdenVenta>;
  actualizarLineas: (id: string, lineas: OrdenVentaLinea[]) => Promise<void>;
  /** recibido → facturado: emite el DTE y descarga el inventario reservado. */
  facturar: (id: string) => Promise<void>;
  /** facturado → programado (se llama al agregar la orden a una ruta). */
  programar: (id: string) => Promise<void>;
  /** programado → facturado (se llama al quitar la orden de una ruta). */
  desprogramar: (id: string) => Promise<void>;
  confirmarEntrega: (id: string) => Promise<void>;
  anular: (id: string, motivo: string) => Promise<void>;
  marcarFacturado: (id: string, dteId: string) => void;
}

export const useOrdenesVentaStore = create<OrdenesVentaState>()(
  persist(
    (set, get) => ({
      ordenes: ORDENES_VENTA_SEED,

      async crearOrden(input) {
        await sleep();
        const now = new Date().toISOString();
        const orden: OrdenVenta = {
          id: nextOvId(),
          ...input,
          estado: "recibido",
          invEstado: "reservado",
          fecha: now,
          fechaRecepcion: now,
          createdAt: now,
        };
        // Reservar la mercadería del pedido (informativo, no bloquea).
        const { reservar } = useInventarioStore.getState();
        for (const linea of orden.lineas) {
          reservar(linea.productoId, orden.locacionId, linea.cantidad);
        }
        set({ ordenes: [orden, ...get().ordenes] });
        return orden;
      },

      async actualizarLineas(id, lineas) {
        await sleep();
        const orden = get().ordenes.find((o) => o.id === id);
        if (!orden) throw new Error("Orden no encontrada");
        // Solo se editan líneas en "recibido"; reajustar la reserva.
        if (orden.estado === "recibido" && orden.invEstado === "reservado") {
          const { reservar, liberarReserva } = useInventarioStore.getState();
          for (const l of orden.lineas) liberarReserva(l.productoId, orden.locacionId, l.cantidad);
          for (const l of lineas) reservar(l.productoId, orden.locacionId, l.cantidad);
        }
        set({ ordenes: get().ordenes.map((o) => (o.id === id ? { ...o, lineas } : o)) });
      },

      async facturar(id) {
        await sleep(1200, 1800); // latencia simulada de certificación SAT
        const orden = get().ordenes.find((o) => o.id === id);
        if (!orden) throw new Error("Orden no encontrada");
        if (orden.estado !== "recibido") throw new Error("Solo se factura un pedido recibido");

        // 1. Emitir el DTE (crea DTE + CxC + póliza de venta y de costo, y llama marcarFacturado).
        await useDteStore.getState().emitir({
          tipo: "FACT",
          clienteId: orden.clienteId,
          lineas: orden.lineas,
          ordenVentaId: orden.id,
          moneda: orden.moneda,
        });

        // 2. Descargar el inventario: la reserva se convierte en salida real.
        const { registrarSalida, liberarReserva } = useInventarioStore.getState();
        for (const linea of orden.lineas) {
          if (orden.invEstado === "reservado") {
            liberarReserva(linea.productoId, orden.locacionId, linea.cantidad);
          }
          await registrarSalida({
            productoId: linea.productoId,
            locacionId: orden.locacionId,
            cantidad: linea.cantidad,
            motivo: "Venta a cliente",
            documentoReferencia: orden.id,
          });
        }

        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id ? { ...o, invEstado: "descargado" } : o,
          ),
        });
      },

      async programar(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id && o.estado === "facturado"
              ? { ...o, estado: "programado", fechaProgramacion: new Date().toISOString() }
              : o,
          ),
        });
      },

      async desprogramar(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id && o.estado === "programado"
              ? { ...o, estado: "facturado", fechaProgramacion: undefined }
              : o,
          ),
        });
      },

      async confirmarEntrega(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id && (o.estado === "programado" || o.estado === "facturado")
              ? { ...o, estado: "entregado", fechaEntrega: new Date().toISOString() }
              : o,
          ),
        });
      },

      async anular(id, motivo) {
        await sleep();
        const orden = get().ordenes.find((o) => o.id === id);
        if (!orden) throw new Error("Orden no encontrada");
        if (orden.estado === "anulado") return;

        const { liberarReserva, registrarEntrada } = useInventarioStore.getState();
        let invEstado = orden.invEstado;

        if (orden.invEstado === "reservado") {
          // Aún no facturada: solo se libera la reserva.
          for (const l of orden.lineas) {
            liberarReserva(l.productoId, orden.locacionId, l.cantidad);
          }
          invEstado = "ninguno";
        } else if (orden.invEstado === "descargado") {
          // Reversa completa: devolución de mercadería + anular DTE + póliza de reversa.
          for (const l of orden.lineas) {
            const producto = PRODUCTOS_SEED.find((p) => p.id === l.productoId);
            await registrarEntrada({
              productoId: l.productoId,
              locacionId: orden.locacionId,
              cantidad: l.cantidad,
              costoUnitario: producto?.costo ?? 0,
              motivo: `Devolución por anulación ${orden.id}`,
              documentoReferencia: orden.id,
            });
          }
          invEstado = "devuelto";

          if (orden.dteId) {
            await useDteStore.getState().anular(orden.dteId, `Anulación de ${orden.id}: ${motivo}`);
          }

          const totales = computeTotals(orden.lineas);
          const costo = costoDeLineas(orden.lineas);
          const { registrarPoliza } = useContabilidadStore.getState();
          registrarPoliza({
            tipo: "venta",
            concepto: `Reversa por anulación de ${orden.id}`,
            origen: orden.id,
            lineas: [
              { cuentaCodigo: "4.1.01", descripcion: "Ventas Locales", debe: totales.baseGravable, haber: 0 },
              { cuentaCodigo: "2.1.03", descripcion: "IVA Débito Fiscal", debe: totales.iva, haber: 0 },
              { cuentaCodigo: "1.1.04", descripcion: "Clientes Nacionales", debe: 0, haber: totales.total },
            ],
          });
          if (costo > 0) {
            registrarPoliza({
              tipo: "venta",
              concepto: `Reversa de costo por anulación de ${orden.id}`,
              origen: orden.id,
              lineas: [
                { cuentaCodigo: "1.1.06", descripcion: "Inventario de Mercadería", debe: costo, haber: 0 },
                { cuentaCodigo: "5.1.01", descripcion: "Costo de Mercadería Vendida", debe: 0, haber: costo },
              ],
            });
          }
        }
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? {
                  ...o,
                  estado: "anulado",
                  invEstado,
                  motivoAnulacion: motivo,
                  fechaAnulacion: new Date().toISOString(),
                }
              : o,
          ),
        });
      },

      marcarFacturado(id, dteId) {
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, estado: "facturado", fechaFacturacion: new Date().toISOString(), dteId }
              : o,
          ),
        });
      },
    }),
    { name: "qpack-ordenes-venta", skipHydration: true },
  ),
);
