import { z } from "zod";

export const movimientoSchema = z.object({
  cuentaId: z.string().min(1, "Seleccioná una cuenta"),
  tipo: z.enum(["deposito", "cheque"]),
  monto: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
  descripcion: z.string().min(3, "Requerido"),
  referencia: z.string().optional(),
});
export type MovimientoFormValues = z.infer<typeof movimientoSchema>;
export const EMPTY_MOVIMIENTO_FORM: MovimientoFormValues = {
  cuentaId: "",
  tipo: "deposito",
  monto: 0,
  descripcion: "",
  referencia: "",
};

export const transferenciaSchema = z
  .object({
    cuentaOrigenId: z.string().min(1, "Seleccioná la cuenta de origen"),
    cuentaDestinoId: z.string().min(1, "Seleccioná la cuenta de destino"),
    monto: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
    descripcion: z.string().min(3, "Requerido"),
  })
  .refine((v) => v.cuentaOrigenId !== v.cuentaDestinoId, {
    message: "El origen y el destino deben ser distintos",
    path: ["cuentaDestinoId"],
  });
export type TransferenciaFormValues = z.infer<typeof transferenciaSchema>;
export const EMPTY_TRANSFERENCIA_FORM: TransferenciaFormValues = {
  cuentaOrigenId: "",
  cuentaDestinoId: "",
  monto: 0,
  descripcion: "",
};
