import { PROVEEDORES_SEED } from "./proveedores";
import { PRODUCTOS_SEED } from "./productos";
import { LOCACIONES_SEED } from "./locaciones";

export type EstadoOC =
  | "borrador"
  | "confirmada"
  | "recibida-parcial"
  | "recibida-total"
  | "facturada"
  | "anulada";

export interface OrdenCompraLinea {
  id: string;
  productoId: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  costoUnitario: number;
  cantidadRecibida: number;
}

export interface OrdenCompra {
  id: string;
  proveedorId: string;
  locacionId: string;
  fecha: string;
  estado: EstadoOC;
  moneda: "GTQ" | "USD";
  lineas: OrdenCompraLinea[];
  notas?: string;
  fechaConfirmacion?: string;
  fechaRecepcionCompleta?: string;
  fechaFacturacion?: string;
  fechaAnulacion?: string;
  motivoAnulacion?: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);
const BODEGA_PRINCIPAL = "loc-central";

let seedState = 99;
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function daysAgo(n: number): Date {
  const d = new Date(HOY);
  d.setDate(d.getDate() - n);
  return d;
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

const MOTIVOS_ANULACION = [
  "Proveedor sin disponibilidad",
  "Error en la captura de la orden",
  "Se encontró mejor precio con otro proveedor",
];

const ESTADOS_PLAN: EstadoOC[] = [
  ...Array(5).fill("borrador"),
  ...Array(5).fill("confirmada"),
  ...Array(4).fill("recibida-parcial"),
  ...Array(6).fill("recibida-total"),
  ...Array(8).fill("facturada"),
  ...Array(2).fill("anulada"),
] as EstadoOC[];

function buildLineas(index: number, estado: EstadoOC): OrdenCompraLinea[] {
  const numLineas = 1 + (index % 4);
  const lineas: OrdenCompraLinea[] = [];
  const usados = new Set<string>();
  for (let i = 0; i < numLineas; i++) {
    let producto = pick(PRODUCTOS_SEED);
    let attempts = 0;
    while (usados.has(producto.id) && attempts < 10) {
      producto = pick(PRODUCTOS_SEED);
      attempts++;
    }
    usados.add(producto.id);
    const cantidad = randInt(20, 200);
    let cantidadRecibida = 0;
    if (estado === "recibida-total" || estado === "facturada") cantidadRecibida = cantidad;
    else if (estado === "recibida-parcial") cantidadRecibida = Math.round(cantidad * 0.4);

    lineas.push({
      id: `ocl-${index}-${i}`,
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      unidadMedida: producto.unidadMedida,
      cantidad,
      costoUnitario: producto.costo,
      cantidadRecibida,
    });
  }
  return lineas;
}

export const ORDENES_COMPRA_SEED: OrdenCompra[] = ESTADOS_PLAN.map((estado, i) => {
  const id = `OC-${String(2000 + i).padStart(6, "0")}`;
  const proveedor = PROVEEDORES_SEED[i % PROVEEDORES_SEED.length];
  const diasAtras = randInt(3, 150);
  const fecha = daysAgo(diasAtras);

  let fechaConfirmacion: Date | undefined;
  let fechaRecepcionCompleta: Date | undefined;
  let fechaFacturacion: Date | undefined;
  let fechaAnulacion: Date | undefined;
  let motivoAnulacion: string | undefined;

  if (estado !== "borrador") fechaConfirmacion = addDays(fecha, randInt(1, 3));
  if (estado === "anulada") {
    fechaAnulacion = addDays(fechaConfirmacion ?? fecha, randInt(1, 3));
    motivoAnulacion = pick(MOTIVOS_ANULACION);
  }
  if (estado === "recibida-total" || estado === "facturada") {
    fechaRecepcionCompleta = addDays(fechaConfirmacion!, randInt(3, 10));
  }
  if (estado === "facturada") {
    fechaFacturacion = addDays(fechaRecepcionCompleta!, randInt(0, 3));
  }

  return {
    id,
    proveedorId: proveedor.id,
    locacionId: BODEGA_PRINCIPAL,
    fecha: fecha.toISOString(),
    estado,
    moneda: (i % 4 === 0 ? "USD" : "GTQ") as "GTQ" | "USD",
    lineas: buildLineas(i, estado),
    fechaConfirmacion: fechaConfirmacion?.toISOString(),
    fechaRecepcionCompleta: fechaRecepcionCompleta?.toISOString(),
    fechaFacturacion: fechaFacturacion?.toISOString(),
    fechaAnulacion: fechaAnulacion?.toISOString(),
    motivoAnulacion,
    createdAt: fecha.toISOString(),
  };
}).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

export const LOCACION_RECEPCION_DEFAULT = LOCACIONES_SEED[0].id;
