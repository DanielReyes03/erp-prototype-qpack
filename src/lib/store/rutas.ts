import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import { RUTAS_SEED, type EstadoRuta, type Ruta } from "@/lib/seed/rutas";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";

export interface CrearRutaInput {
  nombre: string;
  fecha: string;
  vehiculo: string;
  responsableId: string;
}

let rutaCounter = RUTAS_SEED.length + 100;
function nextRutaId(): string {
  rutaCounter += 1;
  return `RUTA-${String(rutaCounter).padStart(6, "0")}`;
}

interface RutasState {
  rutas: Ruta[];
  crearRuta: (input: CrearRutaInput) => Promise<Ruta>;
  agregarOrden: (rutaId: string, ordenId: string) => Promise<void>;
  quitarOrden: (rutaId: string, ordenId: string) => Promise<void>;
  setEstado: (rutaId: string, estado: EstadoRuta) => Promise<void>;
  marcarEntregada: (rutaId: string, ordenId: string, fotoNombre?: string) => Promise<void>;
}

export const useRutasStore = create<RutasState>()(
  persist(
    (set, get) => ({
      rutas: RUTAS_SEED,

      async crearRuta(input) {
        await sleep();
        const ruta: Ruta = {
          id: nextRutaId(),
          ...input,
          estado: "programada",
          ordenIds: [],
          entregas: {},
          createdAt: new Date().toISOString(),
        };
        set({ rutas: [ruta, ...get().rutas] });
        return ruta;
      },

      async agregarOrden(rutaId, ordenId) {
        await sleep();
        set({
          rutas: get().rutas.map((r) =>
            r.id === rutaId && !r.ordenIds.includes(ordenId)
              ? { ...r, ordenIds: [...r.ordenIds, ordenId] }
              : r,
          ),
        });
        // Al asignarla a una ruta, la orden facturada pasa a "programado".
        await useOrdenesVentaStore.getState().programar(ordenId);
      },

      async quitarOrden(rutaId, ordenId) {
        await sleep();
        const ruta = get().rutas.find((r) => r.id === rutaId);
        const teníaEntrega = !!ruta?.entregas[ordenId];
        set({
          rutas: get().rutas.map((r) => {
            if (r.id !== rutaId) return r;
            const entregas = { ...r.entregas };
            delete entregas[ordenId];
            return { ...r, ordenIds: r.ordenIds.filter((id) => id !== ordenId), entregas };
          }),
        });
        // Si no se había entregado, la orden vuelve de "programado" a "facturado".
        if (!teníaEntrega) await useOrdenesVentaStore.getState().desprogramar(ordenId);
      },

      async setEstado(rutaId, estado) {
        await sleep();
        set({
          rutas: get().rutas.map((r) => (r.id === rutaId ? { ...r, estado } : r)),
        });
      },

      async marcarEntregada(rutaId, ordenId, fotoNombre) {
        await sleep();
        set({
          rutas: get().rutas.map((r) =>
            r.id === rutaId
              ? {
                  ...r,
                  entregas: {
                    ...r.entregas,
                    [ordenId]: { fecha: new Date().toISOString(), fotoNombre },
                  },
                }
              : r,
          ),
        });

        // La orden (facturada / programada) pasa a "entregado".
        await useOrdenesVentaStore.getState().confirmarEntrega(ordenId);
      },
    }),
    { name: "qpack-rutas", skipHydration: true },
  ),
);
