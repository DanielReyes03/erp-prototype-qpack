import { DTE_SEED_ALL } from "./dte";
import { CLIENTES_SEED } from "./clientes";
import { computeTotals } from "@/components/patterns/LineItemsEditor";

export interface CxcDocumento {
  id: string;
  clienteId: string;
  dteId: string;
  fecha: string;
  fechaVencimiento: string;
  montoOriginal: number;
  saldoPendiente: number;
  moneda: "GTQ" | "USD";
}

export interface AplicacionPagoCliente {
  cxcId: string;
  monto: number;
}

export interface PagoCliente {
  id: string;
  clienteId: string;
  fecha: string;
  montoTotal: number;
  metodoPago: "Efectivo" | "Transferencia" | "Cheque" | "Tarjeta";
  aplicaciones: AplicacionPagoCliente[];
  createdAt: string;
}

let seedState = 271828;
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

const facturasValidas = DTE_SEED_ALL.filter((d) => d.tipo === "FACT" && d.estado === "certificado");

export const CXC_DOCUMENTOS_SEED: CxcDocumento[] = facturasValidas.map((dte, i) => {
  const cliente = CLIENTES_SEED.find((c) => c.id === dte.clienteId)!;
  const total = round2(computeTotals(dte.lineas).total);
  const fecha = new Date(dte.fechaCertificacion);
  const vencimiento = addDays(fecha, cliente.diasCredito || 15);

  return {
    id: `CXC-${String(i + 1).padStart(6, "0")}`,
    clienteId: dte.clienteId,
    dteId: dte.id,
    fecha: dte.fechaCertificacion,
    fechaVencimiento: vencimiento.toISOString(),
    montoOriginal: total,
    saldoPendiente: total,
    moneda: dte.moneda,
  };
});

// Semilla de pagos históricos: ~45% de los documentos reciben abono total o parcial.
const pagos: PagoCliente[] = [];
let pagoCounter = 0;

CXC_DOCUMENTOS_SEED.forEach((doc, i) => {
  const roll = rand();
  if (roll < 0.3) {
    // Pago total
    pagoCounter += 1;
    pagos.push({
      id: `PC-${String(pagoCounter).padStart(6, "0")}`,
      clienteId: doc.clienteId,
      fecha: doc.fecha,
      montoTotal: doc.montoOriginal,
      metodoPago: i % 3 === 0 ? "Transferencia" : i % 3 === 1 ? "Cheque" : "Efectivo",
      aplicaciones: [{ cxcId: doc.id, monto: doc.montoOriginal }],
      createdAt: doc.fecha,
    });
    doc.saldoPendiente = 0;
  } else if (roll < 0.45) {
    // Pago parcial
    const monto = round2(doc.montoOriginal * (0.3 + rand() * 0.4));
    pagoCounter += 1;
    pagos.push({
      id: `PC-${String(pagoCounter).padStart(6, "0")}`,
      clienteId: doc.clienteId,
      fecha: doc.fecha,
      montoTotal: monto,
      metodoPago: i % 2 === 0 ? "Transferencia" : "Efectivo",
      aplicaciones: [{ cxcId: doc.id, monto }],
      createdAt: doc.fecha,
    });
    doc.saldoPendiente = round2(doc.montoOriginal - monto);
  }
});

export const PAGOS_CLIENTE_SEED: PagoCliente[] = pagos;
