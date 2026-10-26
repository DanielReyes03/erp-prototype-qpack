import type { DocumentStep } from "@/components/patterns/DocumentStepper";
import type { OrdenVenta } from "@/lib/seed/ordenes-venta";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import { useLocacionesStore } from "@/lib/store/locaciones";

export function clienteDe(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id);
}
export function vendedorDe(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id);
}
export function locacionDe(id: string) {
  return (
    useLocacionesStore.getState().locaciones.find((l) => l.id === id) ??
    LOCACIONES_SEED.find((l) => l.id === id)
  );
}

export const OV_STEPS: DocumentStep[] = [
  { key: "recibido", label: "Recibido" },
  { key: "facturado", label: "Facturado" },
  { key: "programado", label: "Programado" },
  { key: "entregado", label: "Entregado" },
];

export function ovStepperProps(orden: OrdenVenta): {
  currentKey: string;
  cancelled: boolean;
  steps: DocumentStep[];
} {
  const steps: DocumentStep[] = [
    { key: "recibido", label: "Recibido", date: orden.fechaRecepcion },
    { key: "facturado", label: "Facturado", date: orden.fechaFacturacion },
    { key: "programado", label: "Programado", date: orden.fechaProgramacion },
    { key: "entregado", label: "Entregado", date: orden.fechaEntrega },
  ];

  let currentKey = "recibido";
  if (orden.estado === "recibido") currentKey = "recibido";
  else if (orden.estado === "facturado") currentKey = "facturado";
  else if (orden.estado === "programado") currentKey = "programado";
  else if (orden.estado === "entregado") currentKey = "completado";

  return { steps, currentKey, cancelled: orden.estado === "anulado" };
}
