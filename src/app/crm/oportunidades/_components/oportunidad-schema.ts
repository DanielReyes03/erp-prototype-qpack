import { z } from "zod";
import { ORIGENES_OPORTUNIDAD } from "@/lib/seed/oportunidades";

export const oportunidadSchema = z.object({
  nombre: z.string().min(3, "Requerido"),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  vendedorId: z.string().min(1, "Selecciona un vendedor"),
  etapa: z.enum(["nuevo", "calificado", "propuesta", "negociacion", "ganado", "perdido"], {
    error: "Selecciona una etapa",
  }),
  valorEstimado: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
  moneda: z.enum(["GTQ", "USD"], { error: "Requerido" }),
  probabilidad: z.number({ error: "Requerido" }).min(0).max(100),
  fechaCierreEstimada: z.string().min(1, "Requerido"),
  origen: z.enum(ORIGENES_OPORTUNIDAD, { error: "Selecciona un origen" }),
  notas: z.string().optional(),
});

export type OportunidadFormValues = z.infer<typeof oportunidadSchema>;

export const EMPTY_OPORTUNIDAD_FORM: OportunidadFormValues = {
  nombre: "",
  clienteId: "",
  vendedorId: "",
  etapa: "nuevo",
  valorEstimado: 0,
  moneda: "GTQ",
  probabilidad: 10,
  fechaCierreEstimada: new Date(2026, 7, 5).toISOString(),
  origen: "Referido",
  notas: "",
};
