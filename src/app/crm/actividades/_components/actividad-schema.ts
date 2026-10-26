import { z } from "zod";

export const actividadSchema = z.object({
  tipo: z.enum(["llamada", "reunion", "tarea", "email"], { error: "Selecciona un tipo" }),
  asunto: z.string().min(3, "Requerido"),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  oportunidadId: z.string().optional(),
  vendedorId: z.string().min(1, "Selecciona un vendedor"),
  fecha: z.string().min(1, "Requerido"),
  notas: z.string().optional(),
});

export type ActividadFormValues = z.infer<typeof actividadSchema>;

export const EMPTY_ACTIVIDAD_FORM: ActividadFormValues = {
  tipo: "llamada",
  asunto: "",
  clienteId: "",
  oportunidadId: "",
  vendedorId: "",
  fecha: new Date(2026, 7, 5).toISOString(),
  notas: "",
};
