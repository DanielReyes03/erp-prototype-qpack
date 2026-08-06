import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { PROVEEDORES_SEED, type Proveedor } from "@/lib/seed/proveedores";

export type ProveedorInput = Omit<Proveedor, "id" | "createdAt">;

interface ProveedoresState {
  proveedores: Proveedor[];
  createProveedor: (input: ProveedorInput) => Promise<Proveedor>;
  updateProveedor: (id: string, input: ProveedorInput) => Promise<Proveedor>;
  deleteProveedor: (id: string) => Promise<void>;
  setActivo: (id: string, activo: boolean) => Promise<void>;
}

export const useProveedoresStore = create<ProveedoresState>()(
  persist(
    (set, get) => ({
      proveedores: PROVEEDORES_SEED,

      async createProveedor(input) {
        await sleep();
        const proveedor: Proveedor = { ...input, id: nextId("prov"), createdAt: new Date().toISOString() };
        set({ proveedores: [proveedor, ...get().proveedores] });
        return proveedor;
      },

      async updateProveedor(id, input) {
        await sleep();
        const existing = get().proveedores.find((p) => p.id === id);
        if (!existing) throw new Error("Proveedor no encontrado");
        const updated: Proveedor = { ...existing, ...input };
        set({ proveedores: get().proveedores.map((p) => (p.id === id ? updated : p)) });
        return updated;
      },

      async deleteProveedor(id) {
        await sleep();
        set({ proveedores: get().proveedores.filter((p) => p.id !== id) });
      },

      async setActivo(id, activo) {
        await sleep();
        set({ proveedores: get().proveedores.map((p) => (p.id === id ? { ...p, activo } : p)) });
      },
    }),
    { name: "qpack-proveedores", skipHydration: true },
  ),
);
