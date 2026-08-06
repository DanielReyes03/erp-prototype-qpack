import { z } from "zod";

export const gastoCajaSchema = z.object({
  cajaId: z.string().min(1, "Requerido"),
  concepto: z.string().min(3, "Requerido"),
  monto: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
});
export type GastoCajaFormValues = z.infer<typeof gastoCajaSchema>;
export const EMPTY_GASTO_FORM: GastoCajaFormValues = { cajaId: "", concepto: "", monto: 0 };
