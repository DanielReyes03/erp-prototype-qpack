import { z } from "zod";

export const TIPOS_MOVIMIENTO = [
  { id: "entrada", label: "Entrada" },
  { id: "salida", label: "Salida" },
  { id: "ajuste-positivo", label: "Ajuste positivo" },
  { id: "ajuste-negativo", label: "Ajuste negativo" },
] as const;

export const lineaMovimientoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  cantidad: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
  costoUnitario: z.number().min(0).optional(),
});

export const movimientoSchema = z.object({
  tipo: z.enum(["entrada", "salida", "ajuste-positivo", "ajuste-negativo"]),
  locacionId: z.string().min(1, "Selecciona una locación"),
  ordenCompraId: z.string().optional(),
  motivo: z.string().min(3, "Requerido"),
  documentoReferencia: z.string().optional(),
  lineas: z.array(lineaMovimientoSchema).min(1, "Agrega al menos una línea"),
});

export type MovimientoFormValues = z.infer<typeof movimientoSchema>;

export const EMPTY_MOVIMIENTO_FORM: MovimientoFormValues = {
  tipo: "entrada",
  locacionId: "",
  ordenCompraId: "",
  motivo: "",
  documentoReferencia: "",
  lineas: [{ productoId: "", cantidad: 1, costoUnitario: 0 }],
};
