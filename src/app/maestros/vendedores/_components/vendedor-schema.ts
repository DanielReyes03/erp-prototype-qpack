import { z } from "zod";

export const vendedorSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  email: z.email("Correo inválido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  zonaAsignada: z.string().min(1, "Selecciona una zona"),
  porcentajeComision: z.number({ error: "Requerido" }).min(0).max(100),
  activo: z.boolean(),
});

export type VendedorFormValues = z.infer<typeof vendedorSchema>;

export const EMPTY_VENDEDOR_FORM: VendedorFormValues = {
  nombre: "",
  email: "",
  telefono: "",
  zonaAsignada: "",
  porcentajeComision: 2.5,
  activo: true,
};
