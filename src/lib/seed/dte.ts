import { ORDENES_VENTA_SEED, type OrdenVentaLinea } from "./ordenes-venta";
import { CLIENTES_SEED } from "./clientes";
import { PRODUCTOS_SEED } from "./productos";

export type TipoDte = "FACT" | "NCRE" | "NDEB";
export type EstadoDte = "certificado" | "rechazado" | "anulado";

export interface Dte {
  id: string;
  tipo: TipoDte;
  serie: string;
  numero: string;
  uuid: string;
  fechaCertificacion: string;
  estado: EstadoDte;
  clienteId: string;
  ordenVentaId?: string;
  dteRelacionadoId?: string;
  lineas: OrdenVentaLinea[];
  moneda: "GTQ" | "USD";
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  createdAt: string;
}

let seedState = 314159;
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
}
function hex(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(rand() * 16).toString(16);
  return s;
}
export function fakeUuid(): string {
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + Math.floor(rand() * 4)).toString(16)}${hex(3)}-${hex(12)}`;
}

const facturadas = ORDENES_VENTA_SEED.filter((o) => o.estado === "facturado");

let numeroCounter = 1000;
function nextNumero(): string {
  numeroCounter += 1;
  return String(numeroCounter).padStart(8, "0");
}

export const DTE_SEED: Dte[] = facturadas.map((orden, i) => {
  const fecha = orden.fechaFacturacion ?? orden.fecha;
  return {
    id: `DTE-${String(i + 1).padStart(6, "0")}`,
    tipo: "FACT" as TipoDte,
    serie: "A",
    numero: nextNumero(),
    uuid: fakeUuid(),
    fechaCertificacion: fecha,
    estado: "certificado" as EstadoDte,
    clienteId: orden.clienteId,
    ordenVentaId: orden.id,
    lineas: orden.lineas,
    moneda: orden.moneda,
    createdAt: fecha,
  };
});

// Un par de notas de crédito sobre las primeras facturas, y un DTE rechazado/anulado para variedad.
const extra: Dte[] = [];
if (DTE_SEED[0]) {
  const original = DTE_SEED[0];
  const lineaCredito: OrdenVentaLinea = {
    ...original.lineas[0],
    id: `${original.lineas[0].id}-ncre`,
    cantidad: Math.max(1, Math.round(original.lineas[0].cantidad * 0.2)),
  };
  extra.push({
    id: `DTE-${String(DTE_SEED.length + 1).padStart(6, "0")}`,
    tipo: "NCRE",
    serie: "A",
    numero: nextNumero(),
    uuid: fakeUuid(),
    fechaCertificacion: original.fechaCertificacion,
    estado: "certificado",
    clienteId: original.clienteId,
    dteRelacionadoId: original.id,
    lineas: [lineaCredito],
    moneda: original.moneda,
    createdAt: original.fechaCertificacion,
  });
}

if (DTE_SEED[1]) {
  const original = DTE_SEED[1];
  extra.push({
    id: `DTE-${String(DTE_SEED.length + 2).padStart(6, "0")}`,
    tipo: "FACT",
    serie: "A",
    numero: nextNumero(),
    uuid: fakeUuid(),
    fechaCertificacion: original.fechaCertificacion,
    estado: "rechazado",
    clienteId: original.clienteId,
    lineas: original.lineas.slice(0, 1),
    moneda: "GTQ",
    createdAt: original.fechaCertificacion,
  });
}

if (DTE_SEED[2]) {
  const original = DTE_SEED[2];
  extra.push({
    id: `DTE-${String(DTE_SEED.length + 3).padStart(6, "0")}`,
    tipo: "FACT",
    serie: "A",
    numero: nextNumero(),
    uuid: fakeUuid(),
    fechaCertificacion: original.fechaCertificacion,
    estado: "anulado",
    clienteId: original.clienteId,
    lineas: original.lineas.slice(0, 1),
    moneda: "GTQ",
    motivoAnulacion: "Error en los datos fiscales del cliente",
    fechaAnulacion: original.fechaCertificacion,
    createdAt: original.fechaCertificacion,
  });
}

// Un par de facturas directas (venta de mostrador, sin orden de venta asociada).
const clientesMostrador = CLIENTES_SEED.slice(0, 3);
clientesMostrador.forEach((cliente, i) => {
  const producto = PRODUCTOS_SEED[(i * 7) % PRODUCTOS_SEED.length];
  extra.push({
    id: `DTE-${String(DTE_SEED.length + 4 + i).padStart(6, "0")}`,
    tipo: "FACT",
    serie: "B",
    numero: nextNumero(),
    uuid: fakeUuid(),
    fechaCertificacion: new Date(2026, 6, 15 + i).toISOString(),
    estado: "certificado",
    clienteId: cliente.id,
    lineas: [
      {
        id: `dte-directo-${i}`,
        productoId: producto.id,
        sku: producto.sku,
        nombre: producto.nombre,
        unidadMedida: producto.unidadMedida,
        cantidad: 5 + i,
        precioUnitario: producto.precioBase,
        descuentoPorcentaje: 0,
      },
    ],
    moneda: "GTQ",
    createdAt: new Date(2026, 6, 15 + i).toISOString(),
  });
});

export const DTE_SEED_ALL: Dte[] = [...DTE_SEED, ...extra].sort(
  (a, b) => new Date(b.fechaCertificacion).getTime() - new Date(a.fechaCertificacion).getTime(),
);
