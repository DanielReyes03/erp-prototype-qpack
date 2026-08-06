import { z } from "zod";

export const listaPrecioSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  moneda: z.enum(["GTQ", "USD"]),
  descripcion: z.string().min(3, "Requerido"),
});

export type ListaPrecioFormValues = z.infer<typeof listaPrecioSchema>;

export const EMPTY_LISTA_PRECIO_FORM: ListaPrecioFormValues = {
  nombre: "",
  moneda: "GTQ",
  descripcion: "",
};
