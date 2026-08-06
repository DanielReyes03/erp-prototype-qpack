import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import {
  ORDENES_VENTA_SEED,
  type OrdenVenta,
  type OrdenVentaLinea,
} from "@/lib/seed/ordenes-venta";
import { useInventarioStore } from "@/lib/store/inventario";

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

interface OrdenesVentaState {
  ordenes: OrdenVenta[];
  crearOrden: (input: OrdenVentaInput) => Promise<OrdenVenta>;
  actualizarLineas: (id: string, lineas: OrdenVentaLinea[]) => Promise<void>;
  confirmarPedido: (id: string) => Promise<void>;
  generarDespacho: (id: string) => Promise<void>;
  confirmarEntrega: (id: string) => Promise<void>;
  anular: (id: string, motivo: string) => Promise<void>;
  marcarFacturado: (id: string, dteId: string) => void;
  asignarVehiculo: (id: string, vehiculo: string) => Promise<void>;
}

export const useOrdenesVentaStore = create<OrdenesVentaState>()(
  persist(
    (set, get) => ({
      ordenes: ORDENES_VENTA_SEED,

      async crearOrden(input) {
        await sleep();
        const orden: OrdenVenta = {
          id: nextOvId(),
          ...input,
          estado: "borrador",
          fecha: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set({ ordenes: [orden, ...get().ordenes] });
        return orden;
      },

      async actualizarLineas(id, lineas) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) => (o.id === id ? { ...o, lineas } : o)),
        });
      },

      async confirmarPedido(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, estado: "confirmado", fechaConfirmacion: new Date().toISOString() }
              : o,
          ),
        });
      },

      async generarDespacho(id) {
        await sleep();
        const orden = get().ordenes.find((o) => o.id === id);
        if (!orden) throw new Error("Orden no encontrada");

        // Generar la salida de kardex por cada línea del pedido.
        const { registrarSalida, getExistencia } = useInventarioStore.getState();
        for (const linea of orden.lineas) {
          const disponible = getExistencia(linea.productoId, orden.locacionId)?.cantidad ?? 0;
          if (disponible < linea.cantidad) {
            throw new Error(`Existencia insuficiente para ${linea.nombre}`);
          }
        }
        for (const linea of orden.lineas) {
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
            o.id === id
              ? { ...o, estado: "despachado", fechaDespacho: new Date().toISOString() }
              : o,
          ),
        });
      },

      async confirmarEntrega(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, estado: "entregado", fechaEntrega: new Date().toISOString() }
              : o,
          ),
        });
      },

      async anular(id, motivo) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? {
                  ...o,
                  estado: "anulado",
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

      async asignarVehiculo(id, vehiculo) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id ? { ...o, vehiculoAsignado: vehiculo } : o,
          ),
        });
      },
    }),
    { name: "qpack-ordenes-venta" },
  ),
);
