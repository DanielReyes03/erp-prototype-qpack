import { z } from "zod";

export const facturaSchema = z.object({
  proveedorId: z.string().min(1, "Selecciona un proveedor"),
  ordenCompraId: z.string().min(1, "Selecciona una orden de compra"),
  serie: z.string().min(1, "Requerido"),
  numeroFactura: z.string().min(3, "Requerido"),
  monto: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
  moneda: z.enum(["GTQ", "USD"]),
});
export type FacturaFormValues = z.infer<typeof facturaSchema>;
export const EMPTY_FACTURA_FORM: FacturaFormValues = {
  proveedorId: "",
  ordenCompraId: "",
  serie: "A",
  numeroFactura: "",
  monto: 0,
  moneda: "GTQ",
};

export const notaCreditoSchema = z.object({
  facturaId: z.string().min(1, "Selecciona una factura"),
  motivo: z.string().min(5, "Requerido"),
  monto: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
});
export type NotaCreditoFormValues = z.infer<typeof notaCreditoSchema>;
export const EMPTY_NOTA_CREDITO_FORM: NotaCreditoFormValues = {
  facturaId: "",
  motivo: "",
  monto: 0,
};
