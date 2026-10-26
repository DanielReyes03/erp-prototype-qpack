import { z } from "zod";

export const rutaSchema = z.object({
  nombre: z.string().min(3, "Requerido"),
  fecha: z.string().min(1, "Selecciona una fecha"),
  vehiculo: z.string().min(2, "Requerido"),
  responsableId: z.string().min(1, "Selecciona un responsable"),
});

export type RutaFormValues = z.infer<typeof rutaSchema>;

export const EMPTY_RUTA_FORM: RutaFormValues = {
  nombre: "",
  fecha: new Date().toISOString(),
  vehiculo: "",
  responsableId: "",
};
