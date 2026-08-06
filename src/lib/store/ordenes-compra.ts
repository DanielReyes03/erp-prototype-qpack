import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import {
  ORDENES_COMPRA_SEED,
  type OrdenCompra,
  type OrdenCompraLinea,
} from "@/lib/seed/ordenes-compra";
import { useInventarioStore } from "@/lib/store/inventario";

export interface OrdenCompraInput {
  proveedorId: string;
  locacionId: string;
  moneda: "GTQ" | "USD";
  lineas: Omit<OrdenCompraLinea, "cantidadRecibida">[];
  notas?: string;
}

export interface RecepcionLinea {
  lineaId: string;
  cantidad: number;
}

let ocCounter = ORDENES_COMPRA_SEED.length + 2000;
function nextOcId(): string {
  ocCounter += 1;
  return `OC-${String(ocCounter).padStart(6, "0")}`;
}

interface OrdenesCompraState {
  ordenes: OrdenCompra[];
  crearOrden: (input: OrdenCompraInput) => Promise<OrdenCompra>;
  actualizarLineas: (id: string, lineas: Omit<OrdenCompraLinea, "cantidadRecibida">[]) => Promise<void>;
  confirmar: (id: string) => Promise<void>;
  registrarRecepcion: (id: string, recepciones: RecepcionLinea[]) => Promise<void>;
  anular: (id: string, motivo: string) => Promise<void>;
  marcarFacturada: (id: string) => Promise<void>;
}

export const useOrdenesCompraStore = create<OrdenesCompraState>()(
  persist(
    (set, get) => ({
      ordenes: ORDENES_COMPRA_SEED,

      async crearOrden(input) {
        await sleep();
        const orden: OrdenCompra = {
          id: nextOcId(),
          ...input,
          lineas: input.lineas.map((l) => ({ ...l, cantidadRecibida: 0 })),
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
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, lineas: lineas.map((l) => ({ ...l, cantidadRecibida: 0 })) }
              : o,
          ),
        });
      },

      async confirmar(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, estado: "confirmada", fechaConfirmacion: new Date().toISOString() }
              : o,
          ),
        });
      },

      async registrarRecepcion(id, recepciones) {
        await sleep();
        const orden = get().ordenes.find((o) => o.id === id);
        if (!orden) throw new Error("Orden de compra no encontrada");

        const { registrarEntrada } = useInventarioStore.getState();
        const lineasActualizadas = orden.lineas.map((linea) => {
          const recepcion = recepciones.find((r) => r.lineaId === linea.id);
          if (!recepcion || recepcion.cantidad <= 0) return linea;
          return { ...linea, cantidadRecibida: linea.cantidadRecibida + recepcion.cantidad };
        });

        for (const recepcion of recepciones) {
          if (recepcion.cantidad <= 0) continue;
          const linea = orden.lineas.find((l) => l.id === recepcion.lineaId);
          if (!linea) continue;
          await registrarEntrada({
            productoId: linea.productoId,
            locacionId: orden.locacionId,
            cantidad: recepcion.cantidad,
            costoUnitario: linea.costoUnitario,
            motivo: "Recepción de mercadería",
            documentoReferencia: orden.id,
          });
        }

        const completa = lineasActualizadas.every((l) => l.cantidadRecibida >= l.cantidad);
        const algunaRecibida = lineasActualizadas.some((l) => l.cantidadRecibida > 0);

        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? {
                  ...o,
                  lineas: lineasActualizadas,
                  estado: completa ? "recibida-total" : algunaRecibida ? "recibida-parcial" : o.estado,
                  fechaRecepcionCompleta: completa ? new Date().toISOString() : o.fechaRecepcionCompleta,
                }
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
                  estado: "anulada",
                  motivoAnulacion: motivo,
                  fechaAnulacion: new Date().toISOString(),
                }
              : o,
          ),
        });
      },

      async marcarFacturada(id) {
        await sleep();
        set({
          ordenes: get().ordenes.map((o) =>
            o.id === id
              ? { ...o, estado: "facturada", fechaFacturacion: new Date().toISOString() }
              : o,
          ),
        });
      },
    }),
    { name: "qpack-ordenes-compra", skipHydration: true },
  ),
);
