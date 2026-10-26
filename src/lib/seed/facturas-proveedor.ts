import { ORDENES_COMPRA_SEED } from "./ordenes-compra";

export interface FacturaProveedor {
  id: string;
  proveedorId: string;
  ordenCompraId?: string;
  fecha: string;
  serie: string;
  numeroFactura: string;
  monto: number;
  moneda: "GTQ" | "USD";
  createdAt: string;
}

export interface NotaCreditoProveedor {
  id: string;
  facturaId: string;
  proveedorId: string;
  fecha: string;
  motivo: string;
  monto: number;
  createdAt: string;
}

function totalOrden(orden: (typeof ORDENES_COMPRA_SEED)[number]): number {
  return orden.lineas.reduce((sum, l) => sum + l.cantidad * l.costoUnitario, 0) * 1.12;
}

const ordenesFacturadas = ORDENES_COMPRA_SEED.filter((o) => o.estado === "facturada");

export const FACTURAS_PROVEEDOR_SEED: FacturaProveedor[] = ordenesFacturadas.map((orden, i) => ({
  id: `FP-${String(400 + i).padStart(6, "0")}`,
  proveedorId: orden.proveedorId,
  ordenCompraId: orden.id,
  fecha: orden.fechaFacturacion ?? orden.fecha,
  serie: i % 3 === 0 ? "B" : "A",
  numeroFactura: String(9000 + i * 7),
  monto: Math.round(totalOrden(orden) * 100) / 100,
  moneda: orden.moneda,
  createdAt: orden.fechaFacturacion ?? orden.fecha,
}));

export const NOTAS_CREDITO_PROVEEDOR_SEED: NotaCreditoProveedor[] = FACTURAS_PROVEEDOR_SEED.slice(
  0,
  2,
).map((factura, i) => ({
  id: `NCP-${String(50 + i).padStart(6, "0")}`,
  facturaId: factura.id,
  proveedorId: factura.proveedorId,
  fecha: factura.fecha,
  motivo: i === 0 ? "Producto dañado en tránsito" : "Diferencia de precio negociada",
  monto: Math.round(factura.monto * 0.08 * 100) / 100,
  createdAt: factura.fecha,
}));
