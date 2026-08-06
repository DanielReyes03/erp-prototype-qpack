import { FACTURAS_PROVEEDOR_SEED } from "./facturas-proveedor";
import { PROVEEDORES_SEED } from "./proveedores";

export interface CxpDocumento {
  id: string;
  proveedorId: string;
  facturaId: string;
  fecha: string;
  fechaVencimiento: string;
  montoOriginal: number;
  saldoPendiente: number;
  moneda: "GTQ" | "USD";
}

export interface AplicacionPagoProveedor {
  cxpId: string;
  monto: number;
}

export interface PagoProveedor {
  id: string;
  proveedorId: string;
  fecha: string;
  montoTotal: number;
  metodoPago: "Transferencia" | "Cheque";
  aplicaciones: AplicacionPagoProveedor[];
  createdAt: string;
}

let seedState = 161803;
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const CXP_DOCUMENTOS_SEED: CxpDocumento[] = FACTURAS_PROVEEDOR_SEED.map((f, i) => {
  const proveedor = PROVEEDORES_SEED.find((p) => p.id === f.proveedorId)!;
  const fecha = new Date(f.fecha);
  const vencimiento = addDays(fecha, proveedor.diasCredito || 15);
  return {
    id: `CXP-${String(i + 1).padStart(6, "0")}`,
    proveedorId: f.proveedorId,
    facturaId: f.id,
    fecha: f.fecha,
    fechaVencimiento: vencimiento.toISOString(),
    montoOriginal: f.monto,
    saldoPendiente: f.monto,
    moneda: f.moneda,
  };
});

const pagos: PagoProveedor[] = [];
let pagoCounter = 0;
CXP_DOCUMENTOS_SEED.forEach((doc, i) => {
  const roll = rand();
  if (roll < 0.4) {
    pagoCounter += 1;
    pagos.push({
      id: `PP-${String(pagoCounter).padStart(6, "0")}`,
      proveedorId: doc.proveedorId,
      fecha: doc.fecha,
      montoTotal: doc.montoOriginal,
      metodoPago: i % 2 === 0 ? "Transferencia" : "Cheque",
      aplicaciones: [{ cxpId: doc.id, monto: doc.montoOriginal }],
      createdAt: doc.fecha,
    });
    doc.saldoPendiente = 0;
  } else if (roll < 0.55) {
    const monto = round2(doc.montoOriginal * 0.5);
    pagoCounter += 1;
    pagos.push({
      id: `PP-${String(pagoCounter).padStart(6, "0")}`,
      proveedorId: doc.proveedorId,
      fecha: doc.fecha,
      montoTotal: monto,
      metodoPago: "Transferencia",
      aplicaciones: [{ cxpId: doc.id, monto }],
      createdAt: doc.fecha,
    });
    doc.saldoPendiente = round2(doc.montoOriginal - monto);
  }
});

export const PAGOS_PROVEEDOR_SEED: PagoProveedor[] = pagos;
