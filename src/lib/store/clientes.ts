import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { CLIENTES_SEED, type Cliente, type Contacto } from "@/lib/seed/clientes";

export type ClienteInput = Omit<Cliente, "id" | "createdAt" | "contactos"> & {
  contactos: Omit<Contacto, "id">[];
};

interface ClientesState {
  clientes: Cliente[];
  createCliente: (input: ClienteInput) => Promise<Cliente>;
  updateCliente: (id: string, input: ClienteInput) => Promise<Cliente>;
  deleteCliente: (id: string) => Promise<void>;
  setActivo: (id: string, activo: boolean) => Promise<void>;
}

export const useClientesStore = create<ClientesState>()(
  persist(
    (set, get) => ({
      clientes: CLIENTES_SEED,

      async createCliente(input) {
        await sleep();
        const cliente: Cliente = {
          ...input,
          id: nextId("cli"),
          createdAt: new Date().toISOString(),
          contactos: input.contactos.map((c) => ({ ...c, id: nextId("ct") })),
        };
        set({ clientes: [cliente, ...get().clientes] });
        return cliente;
      },

      async updateCliente(id, input) {
        await sleep();
        const existing = get().clientes.find((c) => c.id === id);
        if (!existing) throw new Error("Cliente no encontrado");
        const updated: Cliente = {
          ...existing,
          ...input,
          contactos: input.contactos.map((c, i) => ({
            ...c,
            id: existing.contactos[i]?.id ?? nextId("ct"),
          })),
        };
        set({ clientes: get().clientes.map((c) => (c.id === id ? updated : c)) });
        return updated;
      },

      async deleteCliente(id) {
        await sleep();
        set({ clientes: get().clientes.filter((c) => c.id !== id) });
      },

      async setActivo(id, activo) {
        await sleep();
        set({
          clientes: get().clientes.map((c) => (c.id === id ? { ...c, activo } : c)),
        });
      },
    }),
    { name: "qpack-clientes" },
  ),
);
