import { z } from "zod";
import { isValidNit } from "@/lib/nit";

export const contactoSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  cargo: z.string().min(2, "Requerido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  email: z.string().email("Correo inválido"),
});

export const clienteSchema = z.object({
  nit: z
    .string()
    .min(1, "Requerido")
    .refine(isValidNit, "NIT inválido: verificá el dígito verificador. Formato 1234567-8"),
  nombreComercial: z.string().min(2, "Requerido"),
  razonSocial: z.string().min(2, "Requerido"),
  direccion: z.string().min(5, "Requerido"),
  departamentoId: z.string().min(1, "Seleccioná un departamento"),
  municipioId: z.string().min(1, "Seleccioná un municipio"),
  zona: z.string().min(1, "Requerido"),
  vendedorId: z.string().min(1, "Seleccioná un vendedor"),
  listaPrecioId: z.string().min(1, "Seleccioná una lista de precios"),
  limiteCredito: z.number({ error: "Requerido" }).min(0, "Debe ser mayor o igual a 0"),
  diasCredito: z.number({ error: "Requerido" }).min(0, "Debe ser mayor o igual a 0"),
  activo: z.boolean(),
  contactos: z.array(contactoSchema).min(1, "Agregá al menos un contacto"),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;

export const EMPTY_CLIENTE_FORM: ClienteFormValues = {
  nit: "",
  nombreComercial: "",
  razonSocial: "",
  direccion: "",
  departamentoId: "",
  municipioId: "",
  zona: "",
  vendedorId: "",
  listaPrecioId: "",
  limiteCredito: 0,
  diasCredito: 0,
  activo: true,
  contactos: [{ nombre: "", cargo: "", telefono: "", email: "" }],
};
