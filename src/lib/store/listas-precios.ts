import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { LISTAS_PRECIOS_SEED, type ListaPrecio } from "@/lib/seed/listas-precios";
import { PRECIOS_DETALLE_SEED, type PrecioDetalle } from "@/lib/seed/lista-precio-detalle";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";

export type ListaPrecioInput = Omit<ListaPrecio, "id">;

interface ListasPreciosState {
  listas: ListaPrecio[];
  precios: PrecioDetalle[];
  createLista: (input: ListaPrecioInput) => Promise<ListaPrecio>;
  updateLista: (id: string, input: ListaPrecioInput) => Promise<ListaPrecio>;
  deleteLista: (id: string) => Promise<void>;
  setPrecio: (listaId: string, productoId: string, precio: number) => Promise<void>;
  getPrecio: (listaId: string, productoId: string) => number;
}

export const useListasPreciosStore = create<ListasPreciosState>()(
  persist(
    (set, get) => ({
      listas: LISTAS_PRECIOS_SEED,
      precios: PRECIOS_DETALLE_SEED,

      async createLista(input) {
        await sleep();
        const lista: ListaPrecio = { ...input, id: nextId("lp") };
        const nuevosPrecios = PRODUCTOS_SEED.map((p) => ({
          listaId: lista.id,
          productoId: p.id,
          precio: p.precioBase,
        }));
        set({ listas: [lista, ...get().listas], precios: [...get().precios, ...nuevosPrecios] });
        return lista;
      },

      async updateLista(id, input) {
        await sleep();
        const updated: ListaPrecio = { ...input, id };
        set({ listas: get().listas.map((l) => (l.id === id ? updated : l)) });
        return updated;
      },

      async deleteLista(id) {
        await sleep();
        set({
          listas: get().listas.filter((l) => l.id !== id),
          precios: get().precios.filter((p) => p.listaId !== id),
        });
      },

      async setPrecio(listaId, productoId, precio) {
        await sleep();
        const exists = get().precios.some(
          (p) => p.listaId === listaId && p.productoId === productoId,
        );
        set({
          precios: exists
            ? get().precios.map((p) =>
                p.listaId === listaId && p.productoId === productoId ? { ...p, precio } : p,
              )
            : [...get().precios, { listaId, productoId, precio }],
        });
      },

      getPrecio(listaId, productoId) {
        return (
          get().precios.find((p) => p.listaId === listaId && p.productoId === productoId)
            ?.precio ?? 0
        );
      },
    }),
    { name: "qpack-listas-precios", skipHydration: true },
  ),
);
