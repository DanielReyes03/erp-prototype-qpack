import { LISTAS_PRECIOS_SEED } from "./listas-precios";
import { PRODUCTOS_SEED } from "./productos";

export interface PrecioDetalle {
  listaId: string;
  productoId: string;
  precio: number;
}

const MULTIPLIER_BY_LISTA: Record<string, number> = {
  "lp-general": 1,
  "lp-mayoreo": 0.9,
  "lp-vip": 0.83,
  "lp-export": 1, // se convierte a USD abajo
};

const GTQ_PER_USD = 7.75;

export const PRECIOS_DETALLE_SEED: PrecioDetalle[] = LISTAS_PRECIOS_SEED.flatMap((lista) =>
  PRODUCTOS_SEED.map((producto) => {
    const base = producto.precioBase * (MULTIPLIER_BY_LISTA[lista.id] ?? 1);
    const precio = lista.moneda === "USD" ? base / GTQ_PER_USD : base;
    return {
      listaId: lista.id,
      productoId: producto.id,
      precio: Math.round(precio * 100) / 100,
    };
  }),
);
