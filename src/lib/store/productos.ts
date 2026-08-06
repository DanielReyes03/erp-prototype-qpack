import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { PRODUCTOS_SEED, type Producto } from "@/lib/seed/productos";

export type ProductoInput = Omit<Producto, "id" | "createdAt" | "existenciaTotal">;

interface ProductosState {
  productos: Producto[];
  createProducto: (input: ProductoInput) => Promise<Producto>;
  updateProducto: (id: string, input: ProductoInput) => Promise<Producto>;
  deleteProducto: (id: string) => Promise<void>;
  setActivo: (id: string, activo: boolean) => Promise<void>;
}

export const useProductosStore = create<ProductosState>()(
  persist(
    (set, get) => ({
      productos: PRODUCTOS_SEED,

      async createProducto(input) {
        await sleep();
        const producto: Producto = {
          ...input,
          id: nextId("prod"),
          existenciaTotal: 0,
          createdAt: new Date().toISOString(),
        };
        set({ productos: [producto, ...get().productos] });
        return producto;
      },

      async updateProducto(id, input) {
        await sleep();
        const existing = get().productos.find((p) => p.id === id);
        if (!existing) throw new Error("Producto no encontrado");
        const updated: Producto = { ...existing, ...input };
        set({ productos: get().productos.map((p) => (p.id === id ? updated : p)) });
        return updated;
      },

      async deleteProducto(id) {
        await sleep();
        set({ productos: get().productos.filter((p) => p.id !== id) });
      },

      async setActivo(id, activo) {
        await sleep();
        set({ productos: get().productos.map((p) => (p.id === id ? { ...p, activo } : p)) });
      },
    }),
    { name: "qpack-productos", skipHydration: true },
  ),
);
