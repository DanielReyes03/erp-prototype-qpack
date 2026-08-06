import { z } from "zod";
import { CATEGORIAS_RECLAMO } from "@/lib/seed/reclamos";

export const reclamoSchema = z.object({
  clienteId: z.string().min(1, "Seleccioná un cliente"),
  categoria: z.enum(CATEGORIAS_RECLAMO, { error: "Seleccioná una categoría" }),
  prioridad: z.enum(["baja", "media", "alta", "urgente"], { error: "Seleccioná una prioridad" }),
  asunto: z.string().min(3, "Requerido"),
  descripcion: z.string().min(5, "Requerido"),
  asignadoAId: z.string().min(1, "Seleccioná un responsable"),
});

export type ReclamoFormValues = z.infer<typeof reclamoSchema>;

export const EMPTY_RECLAMO_FORM: ReclamoFormValues = {
  clienteId: "",
  categoria: CATEGORIAS_RECLAMO[0],
  prioridad: "media",
  asunto: "",
  descripcion: "",
  asignadoAId: "",
};
