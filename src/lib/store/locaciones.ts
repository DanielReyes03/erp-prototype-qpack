import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { LOCACIONES_SEED, type Locacion } from "@/lib/seed/locaciones";

export type LocacionInput = Omit<Locacion, "id">;

interface LocacionesState {
  locaciones: Locacion[];
  createLocacion: (input: LocacionInput) => Promise<Locacion>;
  updateLocacion: (id: string, input: LocacionInput) => Promise<Locacion>;
  deleteLocacion: (id: string) => Promise<void>;
}

export const useLocacionesStore = create<LocacionesState>()(
  persist(
    (set, get) => ({
      locaciones: LOCACIONES_SEED,

      async createLocacion(input) {
        await sleep();
        const locacion: Locacion = { ...input, id: nextId("loc") };
        set({ locaciones: [locacion, ...get().locaciones] });
        return locacion;
      },

      async updateLocacion(id, input) {
        await sleep();
        const updated: Locacion = { ...input, id };
        set({ locaciones: get().locaciones.map((l) => (l.id === id ? updated : l)) });
        return updated;
      },

      async deleteLocacion(id) {
        await sleep();
        set({ locaciones: get().locaciones.filter((l) => l.id !== id) });
      },
    }),
    { name: "qpack-locaciones", skipHydration: true },
  ),
);
