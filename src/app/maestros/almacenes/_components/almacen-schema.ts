import { z } from "zod";

export const almacenSchema = z.object({
  codigo: z
    .string()
    .min(2, "Requerido")
    .regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones"),
  nombre: z.string().min(2, "Requerido"),
  tipo: z.enum(["Bodega", "Sucursal", "Tránsito"]),
  responsable: z.string().min(3, "Requerido"),
  departamentoId: z.string().min(1, "Selecciona un departamento"),
  municipioId: z.string().min(1, "Selecciona un municipio"),
  direccion: z.string().min(5, "Requerido"),
  activo: z.boolean(),
});

export type AlmacenFormValues = z.infer<typeof almacenSchema>;

export const EMPTY_ALMACEN_FORM: AlmacenFormValues = {
  codigo: "",
  nombre: "",
  tipo: "Bodega",
  responsable: "",
  departamentoId: "",
  municipioId: "",
  direccion: "",
  activo: true,
};
