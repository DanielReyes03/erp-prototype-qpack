import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import { COTIZACIONES_SEED, type Cotizacion, type CotizacionLinea } from "@/lib/seed/cotizaciones";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";

export interface CotizacionInput {
  clienteId: string;
  vendedorId: string;
  moneda: "GTQ" | "USD";
  lineas: CotizacionLinea[];
  notas?: string;
  fechaValidez: string;
}

let cotCounter = COTIZACIONES_SEED.length + 100;
function nextCotId(): string {
  cotCounter += 1;
  return `COT-${String(cotCounter).padStart(6, "0")}`;
}

interface CotizacionesState {
  cotizaciones: Cotizacion[];
  crearCotizacion: (input: CotizacionInput) => Promise<Cotizacion>;
  actualizarLineas: (id: string, lineas: CotizacionLinea[]) => Promise<void>;
  enviar: (id: string) => Promise<void>;
  marcarAceptada: (id: string) => Promise<void>;
  marcarRechazada: (id: string) => Promise<void>;
  convertirAPedido: (id: string) => Promise<string>;
}

export const useCotizacionesStore = create<CotizacionesState>()(
  persist(
    (set, get) => ({
      cotizaciones: COTIZACIONES_SEED,

      async crearCotizacion(input) {
        await sleep();
        const cot: Cotizacion = {
          id: nextCotId(),
          ...input,
          estado: "borrador",
          fecha: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set({ cotizaciones: [cot, ...get().cotizaciones] });
        return cot;
      },

      async actualizarLineas(id, lineas) {
        await sleep();
        set({
          cotizaciones: get().cotizaciones.map((c) => (c.id === id ? { ...c, lineas } : c)),
        });
      },

      async enviar(id) {
        await sleep();
        set({
          cotizaciones: get().cotizaciones.map((c) =>
            c.id === id ? { ...c, estado: "enviada" } : c,
          ),
        });
      },

      async marcarAceptada(id) {
        await sleep();
        set({
          cotizaciones: get().cotizaciones.map((c) =>
            c.id === id ? { ...c, estado: "aceptada" } : c,
          ),
        });
      },

      async marcarRechazada(id) {
        await sleep();
        set({
          cotizaciones: get().cotizaciones.map((c) =>
            c.id === id ? { ...c, estado: "rechazada" } : c,
          ),
        });
      },

      async convertirAPedido(id) {
        await sleep();
        const cot = get().cotizaciones.find((c) => c.id === id);
        if (!cot) throw new Error("Cotización no encontrada");

        const orden = await useOrdenesVentaStore.getState().crearOrden({
          clienteId: cot.clienteId,
          vendedorId: cot.vendedorId,
          locacionId: LOCACIONES_SEED[0].id,
          moneda: cot.moneda,
          lineas: cot.lineas,
          notas: `Generado desde cotización ${cot.id}`,
        });

        set({
          cotizaciones: get().cotizaciones.map((c) =>
            c.id === id ? { ...c, estado: "convertida", ordenVentaId: orden.id } : c,
          ),
        });
        return orden.id;
      },
    }),
    { name: "qpack-cotizaciones", skipHydration: true },
  ),
);
