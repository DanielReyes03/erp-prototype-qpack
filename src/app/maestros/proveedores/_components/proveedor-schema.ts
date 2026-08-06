import { z } from "zod";
import { isValidNit } from "@/lib/nit";

export const proveedorSchema = z.object({
  nit: z
    .string()
    .min(1, "Requerido")
    .refine(isValidNit, "NIT inválido: verificá el dígito verificador. Formato 1234567-8"),
  nombreComercial: z.string().min(2, "Requerido"),
  razonSocial: z.string().min(2, "Requerido"),
  direccion: z.string().min(5, "Requerido"),
  departamentoId: z.string().min(1, "Seleccioná un departamento"),
  municipioId: z.string().min(1, "Seleccioná un municipio"),
  telefono: z.string().min(7, "Teléfono inválido"),
  email: z.email("Correo inválido"),
  contactoNombre: z.string().min(2, "Requerido"),
  diasCredito: z.number({ error: "Requerido" }).min(0),
  activo: z.boolean(),
  datosBancarios: z.object({
    banco: z.string().min(1, "Seleccioná un banco"),
    tipoCuenta: z.enum(["Monetaria", "Ahorro"]),
    numeroCuenta: z.string().min(4, "Requerido"),
    moneda: z.enum(["GTQ", "USD"]),
  }),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;

export const EMPTY_PROVEEDOR_FORM: ProveedorFormValues = {
  nit: "",
  nombreComercial: "",
  razonSocial: "",
  direccion: "",
  departamentoId: "",
  municipioId: "",
  telefono: "",
  email: "",
  contactoNombre: "",
  diasCredito: 30,
  activo: true,
  datosBancarios: {
    banco: "",
    tipoCuenta: "Monetaria",
    numeroCuenta: "",
    moneda: "GTQ",
  },
};
