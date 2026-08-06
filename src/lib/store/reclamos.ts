import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { RECLAMOS_SEED, PRIORIDADES_RECLAMO, type Reclamo, type EstadoReclamo } from "@/lib/seed/reclamos";

export type ReclamoInput = Omit<Reclamo, "id" | "createdAt" | "estado" | "fechaLimiteSla" | "fechaResolucion">;

interface ReclamosState {
  reclamos: Reclamo[];
  crearReclamo: (input: ReclamoInput) => Promise<Reclamo>;
  cambiarEstado: (id: string, estado: EstadoReclamo) => Promise<void>;
  eliminarReclamo: (id: string) => Promise<void>;
}

export const useReclamosStore = create<ReclamosState>()(
  persist(
    (set, get) => ({
      reclamos: RECLAMOS_SEED,

      async crearReclamo(input) {
        await sleep();
        const now = new Date();
        const slaDias = PRIORIDADES_RECLAMO.find((p) => p.key === input.prioridad)!.slaDias;
        const fechaLimiteSla = new Date(now);
        fechaLimiteSla.setDate(fechaLimiteSla.getDate() + slaDias);
        const reclamo: Reclamo = {
          ...input,
          id: nextId("recl"),
          estado: "abierto",
          fechaLimiteSla: fechaLimiteSla.toISOString(),
          createdAt: now.toISOString(),
        };
        set({ reclamos: [reclamo, ...get().reclamos] });
        return reclamo;
      },

      async cambiarEstado(id, estado) {
        await sleep(150, 300);
        set({
          reclamos: get().reclamos.map((r) =>
            r.id === id
              ? {
                  ...r,
                  estado,
                  fechaResolucion:
                    estado === "resuelto" || estado === "cerrado"
                      ? (r.fechaResolucion ?? new Date().toISOString())
                      : undefined,
                }
              : r,
          ),
        });
      },

      async eliminarReclamo(id) {
        await sleep();
        set({ reclamos: get().reclamos.filter((r) => r.id !== id) });
      },
    }),
    { name: "qpack-reclamos", skipHydration: true },
  ),
);
