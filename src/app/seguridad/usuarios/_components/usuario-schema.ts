import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  email: z.email("Correo inválido"),
  telefono: z.string().min(7, "Teléfono inválido"),
  rolId: z.string().min(1, "Seleccioná un rol"),
  activo: z.boolean(),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export const EMPTY_USUARIO_FORM: UsuarioFormValues = {
  nombre: "",
  email: "",
  telefono: "",
  rolId: "",
  activo: true,
};
