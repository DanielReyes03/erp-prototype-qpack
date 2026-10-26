import { z } from "zod";
import { CATEGORIAS_PRODUCTO } from "@/lib/seed/productos";

export const productoSchema = z
  .object({
    sku: z
      .string()
      .min(3, "Requerido")
      .regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones"),
    nombre: z.string().min(3, "Requerido"),
    categoria: z.enum(CATEGORIAS_PRODUCTO, { error: "Selecciona una categoría" }),
    unidadMedida: z.string().min(1, "Requerido"),
    proveedorId: z.string().min(1, "Selecciona un proveedor"),
    costo: z.number({ error: "Requerido" }).min(0),
    precioBase: z.number({ error: "Requerido" }).min(0),
    puntoReorden: z.number({ error: "Requerido" }).min(0),
    stockMinimo: z.number({ error: "Requerido" }).min(0),
    stockMaximo: z.number({ error: "Requerido" }).min(0),
    activo: z.boolean(),
  })
  .refine((v) => v.stockMaximo >= v.stockMinimo, {
    message: "El stock máximo debe ser mayor o igual que el mínimo",
    path: ["stockMaximo"],
  });

export type ProductoFormValues = z.infer<typeof productoSchema>;

export const EMPTY_PRODUCTO_FORM: ProductoFormValues = {
  sku: "",
  nombre: "",
  categoria: CATEGORIAS_PRODUCTO[0],
  unidadMedida: "unidad",
  proveedorId: "",
  costo: 0,
  precioBase: 0,
  puntoReorden: 0,
  stockMinimo: 0,
  stockMaximo: 0,
  activo: true,
};

export const UNIDADES_MEDIDA = [
  "unidad",
  "saco",
  "fardo",
  "paquete",
  "millar",
  "rollo",
  "caja",
];
