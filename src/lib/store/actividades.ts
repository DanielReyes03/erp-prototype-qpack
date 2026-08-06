import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { ACTIVIDADES_SEED, type Actividad } from "@/lib/seed/actividades";

export type ActividadInput = Omit<Actividad, "id" | "createdAt" | "completada">;

interface ActividadesState {
  actividades: Actividad[];
  crearActividad: (input: ActividadInput) => Promise<Actividad>;
  completarActividad: (id: string, completada: boolean) => Promise<void>;
  eliminarActividad: (id: string) => Promise<void>;
}

export const useActividadesStore = create<ActividadesState>()(
  persist(
    (set, get) => ({
      actividades: ACTIVIDADES_SEED,

      async crearActividad(input) {
        await sleep();
        const actividad: Actividad = {
          ...input,
          id: nextId("act"),
          completada: false,
          createdAt: new Date().toISOString(),
        };
        set({ actividades: [actividad, ...get().actividades] });
        return actividad;
      },

      async completarActividad(id, completada) {
        await sleep(150, 300);
        set({ actividades: get().actividades.map((a) => (a.id === id ? { ...a, completada } : a)) });
      },

      async eliminarActividad(id) {
        await sleep();
        set({ actividades: get().actividades.filter((a) => a.id !== id) });
      },
    }),
    { name: "qpack-actividades", skipHydration: true },
  ),
);
