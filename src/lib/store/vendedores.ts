import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { VENDEDORES_SEED, type Vendedor } from "@/lib/seed/vendedores";

export type VendedorInput = Omit<Vendedor, "id">;

interface VendedoresState {
  vendedores: Vendedor[];
  createVendedor: (input: VendedorInput) => Promise<Vendedor>;
  updateVendedor: (id: string, input: VendedorInput) => Promise<Vendedor>;
  deleteVendedor: (id: string) => Promise<void>;
  setActivo: (id: string, activo: boolean) => Promise<void>;
}

export const useVendedoresStore = create<VendedoresState>()(
  persist(
    (set, get) => ({
      vendedores: VENDEDORES_SEED,

      async createVendedor(input) {
        await sleep();
        const vendedor: Vendedor = { ...input, id: nextId("vend") };
        set({ vendedores: [vendedor, ...get().vendedores] });
        return vendedor;
      },

      async updateVendedor(id, input) {
        await sleep();
        const updated: Vendedor = { ...input, id };
        set({ vendedores: get().vendedores.map((v) => (v.id === id ? updated : v)) });
        return updated;
      },

      async deleteVendedor(id) {
        await sleep();
        set({ vendedores: get().vendedores.filter((v) => v.id !== id) });
      },

      async setActivo(id, activo) {
        await sleep();
        set({ vendedores: get().vendedores.map((v) => (v.id === id ? { ...v, activo } : v)) });
      },
    }),
    { name: "qpack-vendedores" },
  ),
);
