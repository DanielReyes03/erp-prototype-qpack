import type { DocumentStep } from "@/components/patterns/DocumentStepper";
import type { OrdenCompra } from "@/lib/seed/ordenes-compra";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";

export function proveedorDe(id: string) {
  return PROVEEDORES_SEED.find((p) => p.id === id);
}
export function locacionDe(id: string) {
  return LOCACIONES_SEED.find((l) => l.id === id);
}

export function ocStepperProps(orden: OrdenCompra): {
  currentKey: string;
  cancelled: boolean;
  steps: DocumentStep[];
} {
  const steps: DocumentStep[] = [
    { key: "pedido", label: "Pedido", date: orden.fechaConfirmacion },
    { key: "recepcion", label: "Recepción", date: orden.fechaRecepcionCompleta },
    { key: "factura", label: "Factura", date: orden.fechaFacturacion },
  ];

  let currentKey = "pedido";
  if (orden.estado === "borrador") currentKey = "pedido";
  else if (orden.estado === "confirmada") currentKey = "recepcion";
  else if (orden.estado === "recibida-parcial") currentKey = "recepcion";
  else if (orden.estado === "recibida-total") currentKey = "factura";
  else if (orden.estado === "facturada") currentKey = "completado";

  return { steps, currentKey, cancelled: orden.estado === "anulada" };
}

export function totalLinea(l: { cantidad: number; costoUnitario: number }): number {
  return l.cantidad * l.costoUnitario;
}

export function totalOrden(orden: OrdenCompra): number {
  return orden.lineas.reduce((sum, l) => sum + totalLinea(l), 0) * 1.12;
}
