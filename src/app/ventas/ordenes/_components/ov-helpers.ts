import type { DocumentStep } from "@/components/patterns/DocumentStepper";
import type { OrdenVenta } from "@/lib/seed/ordenes-venta";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";

export function clienteDe(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id);
}
export function vendedorDe(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id);
}
export function locacionDe(id: string) {
  return LOCACIONES_SEED.find((l) => l.id === id);
}

export const OV_STEPS: DocumentStep[] = [
  { key: "pedido", label: "Pedido" },
  { key: "despacho", label: "Despacho" },
  { key: "entrega", label: "Entrega" },
];

export function ovStepperProps(orden: OrdenVenta): {
  currentKey: string;
  cancelled: boolean;
  steps: DocumentStep[];
} {
  const steps: DocumentStep[] = [
    { key: "pedido", label: "Pedido", date: orden.fechaConfirmacion },
    { key: "despacho", label: "Despacho", date: orden.fechaDespacho },
    { key: "entrega", label: "Entrega", date: orden.fechaEntrega },
  ];

  let currentKey = "pedido";
  if (orden.estado === "borrador") currentKey = "pedido";
  else if (orden.estado === "confirmado") currentKey = "despacho";
  else if (orden.estado === "despachado") currentKey = "entrega";
  else if (orden.estado === "entregado" || orden.estado === "facturado") currentKey = "completado";

  return { steps, currentKey, cancelled: orden.estado === "anulado" };
}
