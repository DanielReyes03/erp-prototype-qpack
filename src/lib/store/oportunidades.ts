import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { OPORTUNIDADES_SEED, type Oportunidad, type EtapaOportunidad } from "@/lib/seed/oportunidades";

export type OportunidadInput = Omit<Oportunidad, "id" | "createdAt">;

interface OportunidadesState {
  oportunidades: Oportunidad[];
  crearOportunidad: (input: OportunidadInput) => Promise<Oportunidad>;
  actualizarOportunidad: (id: string, input: OportunidadInput) => Promise<Oportunidad>;
  moverEtapa: (id: string, etapa: EtapaOportunidad) => Promise<void>;
  eliminarOportunidad: (id: string) => Promise<void>;
}

export const useOportunidadesStore = create<OportunidadesState>()(
  persist(
    (set, get) => ({
      oportunidades: OPORTUNIDADES_SEED,

      async crearOportunidad(input) {
        await sleep();
        const oportunidad: Oportunidad = { ...input, id: nextId("opp"), createdAt: new Date().toISOString() };
        set({ oportunidades: [oportunidad, ...get().oportunidades] });
        return oportunidad;
      },

      async actualizarOportunidad(id, input) {
        await sleep();
        const existing = get().oportunidades.find((o) => o.id === id);
        const updated: Oportunidad = { ...input, id, createdAt: existing?.createdAt ?? new Date().toISOString() };
        set({ oportunidades: get().oportunidades.map((o) => (o.id === id ? updated : o)) });
        return updated;
      },

      async moverEtapa(id, etapa) {
        await sleep(150, 300);
        const probabilidadPorEtapa: Record<EtapaOportunidad, number> = {
          nuevo: 10,
          calificado: 30,
          propuesta: 55,
          negociacion: 75,
          ganado: 100,
          perdido: 0,
        };
        set({
          oportunidades: get().oportunidades.map((o) =>
            o.id === id ? { ...o, etapa, probabilidad: probabilidadPorEtapa[etapa] } : o,
          ),
        });
      },

      async eliminarOportunidad(id) {
        await sleep();
        set({ oportunidades: get().oportunidades.filter((o) => o.id !== id) });
      },
    }),
    { name: "qpack-oportunidades", skipHydration: true },
  ),
);
