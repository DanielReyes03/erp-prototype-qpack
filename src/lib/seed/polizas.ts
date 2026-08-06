import { DTE_SEED_ALL } from "./dte";
import { FACTURAS_PROVEEDOR_SEED } from "./facturas-proveedor";
import { PAGOS_CLIENTE_SEED, CXC_DOCUMENTOS_SEED } from "./cxc";
import { PAGOS_PROVEEDOR_SEED, CXP_DOCUMENTOS_SEED } from "./cxp";
import { MOVIMIENTOS_CAJA_CHICA_SEED } from "./tesoreria";
import { PRODUCTOS_SEED } from "./productos";
import { computeTotals } from "@/components/patterns/LineItemsEditor";

export type TipoPoliza = "venta" | "compra" | "cobro" | "pago" | "gasto" | "manual";

export interface PartidaLinea {
  id: string;
  cuentaCodigo: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export interface Poliza {
  id: string;
  numero: string;
  tipo: TipoPoliza;
  fecha: string;
  concepto: string;
  lineas: PartidaLinea[];
  origen?: string;
  createdAt: string;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function costoDeLineas(lineas: { productoId: string; cantidad: number }[]): number {
  return round2(
    lineas.reduce((sum, l) => {
      const producto = PRODUCTOS_SEED.find((p) => p.id === l.productoId);
      return sum + (producto?.costo ?? 0) * l.cantidad;
    }, 0),
  );
}

let polizaCounter = 0;
function nextNumero(): string {
  polizaCounter += 1;
  return String(polizaCounter).padStart(6, "0");
}

const polizas: Poliza[] = [];

// 1. Ventas: por cada FACT certificado se generan dos partidas (venta + costo de venta).
DTE_SEED_ALL.filter((d) => d.tipo === "FACT" && d.estado === "certificado").forEach((dte) => {
  const totales = computeTotals(dte.lineas);
  const costo = costoDeLineas(dte.lineas);

  polizas.push({
    id: `POL-${nextNumero()}`,
    numero: dte.numero,
    tipo: "venta",
    fecha: dte.fechaCertificacion,
    concepto: `Venta según factura ${dte.serie}-${dte.numero}`,
    origen: dte.id,
    createdAt: dte.fechaCertificacion,
    lineas: [
      { id: "l1", cuentaCodigo: "1.1.04", descripcion: "Clientes Nacionales", debe: totales.total, haber: 0 },
      { id: "l2", cuentaCodigo: "4.1.01", descripcion: "Ventas Locales", debe: 0, haber: totales.baseGravable },
      { id: "l3", cuentaCodigo: "2.1.03", descripcion: "IVA Débito Fiscal", debe: 0, haber: totales.iva },
    ],
  });

  if (costo > 0) {
    polizas.push({
      id: `POL-${nextNumero()}`,
      numero: dte.numero,
      tipo: "venta",
      fecha: dte.fechaCertificacion,
      concepto: `Costo de venta según factura ${dte.serie}-${dte.numero}`,
      origen: dte.id,
      createdAt: dte.fechaCertificacion,
      lineas: [
        { id: "l1", cuentaCodigo: "5.1.01", descripcion: "Costo de Mercadería Vendida", debe: costo, haber: 0 },
        { id: "l2", cuentaCodigo: "1.1.06", descripcion: "Inventario de Mercadería", debe: 0, haber: costo },
      ],
    });
  }
});

// 2. Compras: por cada factura de proveedor.
FACTURAS_PROVEEDOR_SEED.forEach((f) => {
  const base = round2(f.monto / 1.12);
  const iva = round2(f.monto - base);
  const cuentaProveedor = "2.1.01";

  polizas.push({
    id: `POL-${nextNumero()}`,
    numero: f.numeroFactura,
    tipo: "compra",
    fecha: f.fecha,
    concepto: `Compra según factura ${f.numeroFactura}`,
    origen: f.id,
    createdAt: f.fecha,
    lineas: [
      { id: "l1", cuentaCodigo: "1.1.06", descripcion: "Inventario de Mercadería", debe: base, haber: 0 },
      { id: "l2", cuentaCodigo: "1.1.07", descripcion: "IVA Crédito Fiscal", debe: iva, haber: 0 },
      { id: "l3", cuentaCodigo: cuentaProveedor, descripcion: "Proveedores Locales", debe: 0, haber: f.monto },
    ],
  });
});

// 3. Cobros a clientes.
PAGOS_CLIENTE_SEED.forEach((pago) => {
  const doc = CXC_DOCUMENTOS_SEED.find((d) => d.id === pago.aplicaciones[0]?.cxcId);
  const cuentaDestino = pago.metodoPago === "Efectivo" ? "1.1.01" : "1.1.02";
  polizas.push({
    id: `POL-${nextNumero()}`,
    numero: pago.id,
    tipo: "cobro",
    fecha: pago.fecha,
    concepto: `Cobro a cliente — ${pago.metodoPago}`,
    origen: doc?.dteId,
    createdAt: pago.fecha,
    lineas: [
      { id: "l1", cuentaCodigo: cuentaDestino, descripcion: "Caja / Bancos", debe: pago.montoTotal, haber: 0 },
      { id: "l2", cuentaCodigo: "1.1.04", descripcion: "Clientes Nacionales", debe: 0, haber: pago.montoTotal },
    ],
  });
});

// 4. Pagos a proveedores.
PAGOS_PROVEEDOR_SEED.forEach((pago) => {
  const doc = CXP_DOCUMENTOS_SEED.find((d) => d.id === pago.aplicaciones[0]?.cxpId);
  polizas.push({
    id: `POL-${nextNumero()}`,
    numero: pago.id,
    tipo: "pago",
    fecha: pago.fecha,
    concepto: `Pago a proveedor — ${pago.metodoPago}`,
    origen: doc?.facturaId,
    createdAt: pago.fecha,
    lineas: [
      { id: "l1", cuentaCodigo: "2.1.01", descripcion: "Proveedores Locales", debe: pago.montoTotal, haber: 0 },
      { id: "l2", cuentaCodigo: "1.1.02", descripcion: "Bancos Quetzales", debe: 0, haber: pago.montoTotal },
    ],
  });
});

// 5. Gastos de caja chica.
MOVIMIENTOS_CAJA_CHICA_SEED.filter((m) => m.tipo === "gasto").forEach((m) => {
  polizas.push({
    id: `POL-${nextNumero()}`,
    numero: m.id,
    tipo: "gasto",
    fecha: m.fecha,
    concepto: `Gasto de caja chica — ${m.concepto}`,
    origen: m.cajaId,
    createdAt: m.fecha,
    lineas: [
      { id: "l1", cuentaCodigo: "6.2.04", descripcion: "Gastos de Caja Chica", debe: m.monto, haber: 0 },
      { id: "l2", cuentaCodigo: "1.1.01", descripcion: "Caja General", debe: 0, haber: m.monto },
    ],
  });
});

export const POLIZAS_SEED: Poliza[] = polizas.sort(
  (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
);
