import { z } from "zod";

export const locacionSchema = z.object({
  nombre: z.string().min(2, "Requerido"),
  tipo: z.enum(["Bodega", "Sucursal", "Tránsito"]),
  departamentoId: z.string().min(1, "Seleccioná un departamento"),
  municipioId: z.string().min(1, "Seleccioná un municipio"),
  direccion: z.string().min(5, "Requerido"),
  activo: z.boolean(),
});

export type LocacionFormValues = z.infer<typeof locacionSchema>;

export const EMPTY_LOCACION_FORM: LocacionFormValues = {
  nombre: "",
  tipo: "Bodega",
  departamentoId: "",
  municipioId: "",
  direccion: "",
  activo: true,
};
