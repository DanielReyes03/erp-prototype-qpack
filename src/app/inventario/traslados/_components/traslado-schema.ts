import { z } from "zod";

export const trasladoSchema = z
  .object({
    productoId: z.string().min(1, "Selecciona un producto"),
    locacionOrigenId: z.string().min(1, "Selecciona la locación de origen"),
    locacionDestinoId: z.string().min(1, "Selecciona la locación de destino"),
    cantidad: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
    motivo: z.string().min(3, "Requerido"),
    documentoReferencia: z.string().optional(),
  })
  .refine((v) => v.locacionOrigenId !== v.locacionDestinoId, {
    message: "El origen y el destino deben ser distintos",
    path: ["locacionDestinoId"],
  });

export type TrasladoFormValues = z.infer<typeof trasladoSchema>;

export const EMPTY_TRASLADO_FORM: TrasladoFormValues = {
  productoId: "",
  locacionOrigenId: "",
  locacionDestinoId: "",
  cantidad: 1,
  motivo: "",
  documentoReferencia: "",
};
