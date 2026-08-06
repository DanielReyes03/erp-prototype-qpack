import { CLIENTES_SEED } from "./clientes";
import { PRODUCTOS_SEED } from "./productos";
import { LOCACIONES_SEED } from "./locaciones";
import { LISTAS_PRECIOS_SEED } from "./listas-precios";

export type EstadoOV =
  | "borrador"
  | "confirmado"
  | "despachado"
  | "entregado"
  | "facturado"
  | "anulado";

export interface OrdenVentaLinea {
  id: string;
  productoId: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
}

export interface OrdenVenta {
  id: string;
  clienteId: string;
  vendedorId: string;
  locacionId: string;
  fecha: string;
  estado: EstadoOV;
  moneda: "GTQ" | "USD";
  lineas: OrdenVentaLinea[];
  notas?: string;
  fechaConfirmacion?: string;
  fechaDespacho?: string;
  fechaEntrega?: string;
  fechaFacturacion?: string;
  fechaAnulacion?: string;
  motivoAnulacion?: string;
  vehiculoAsignado?: string;
  dteId?: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);
const BODEGA_PRINCIPAL = "loc-central";

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

// Generador determinístico simple (LCG) para que la semilla sea estable entre builds.
let seedState = 42;
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

const MOTIVOS_ANULACION = [
  "Cliente canceló el pedido",
  "Error en la captura del pedido",
  "Producto sin disponibilidad confirmada",
  "Duplicado de otro pedido",
];

const ESTADOS_PLAN: EstadoOV[] = [
  ...Array(12).fill("borrador"),
  ...Array(13).fill("confirmado"),
  ...Array(10).fill("despachado"),
  ...Array(15).fill("entregado"),
  ...Array(25).fill("facturado"),
  ...Array(5).fill("anulado"),
] as EstadoOV[];

function monedaDeCliente(clienteId: string): "GTQ" | "USD" {
  const cliente = CLIENTES_SEED.find((c) => c.id === clienteId);
  const lista = LISTAS_PRECIOS_SEED.find((l) => l.id === cliente?.listaPrecioId);
  return lista?.moneda ?? "GTQ";
}

function buildLineas(index: number): OrdenVentaLinea[] {
  const numLineas = 1 + (index % 4);
  const lineas: OrdenVentaLinea[] = [];
  const usados = new Set<string>();
  for (let i = 0; i < numLineas; i++) {
    let producto = pick(PRODUCTOS_SEED);
    let attempts = 0;
    while (usados.has(producto.id) && attempts < 10) {
      producto = pick(PRODUCTOS_SEED);
      attempts++;
    }
    usados.add(producto.id);
    const cantidad = randInt(2, 40);
    const descuento = index % 5 === 0 ? randInt(2, 8) : 0;
    lineas.push({
      id: `ovl-${index}-${i}`,
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      unidadMedida: producto.unidadMedida,
      cantidad,
      precioUnitario: producto.precioBase,
      descuentoPorcentaje: descuento,
    });
  }
  return lineas;
}

export const ORDENES_VENTA_SEED: OrdenVenta[] = ESTADOS_PLAN.map((estado, i) => {
  const id = `OV-${String(100 + i).padStart(6, "0")}`;
  const cliente = CLIENTES_SEED[i % CLIENTES_SEED.length];
  const diasAtras = randInt(3, 175);
  const fecha = daysAgo(diasAtras);

  let fechaConfirmacion: Date | undefined;
  let fechaDespacho: Date | undefined;
  let fechaEntrega: Date | undefined;
  let fechaFacturacion: Date | undefined;
  let fechaAnulacion: Date | undefined;
  let motivoAnulacion: string | undefined;

  if (estado !== "borrador") {
    fechaConfirmacion = addDays(fecha, randInt(1, 2));
  }
  if (estado === "anulado") {
    fechaAnulacion = addDays(fechaConfirmacion ?? fecha, randInt(1, 3));
    motivoAnulacion = pick(MOTIVOS_ANULACION);
  }
  if (["despachado", "entregado", "facturado"].includes(estado)) {
    fechaDespacho = addDays(fechaConfirmacion!, randInt(1, 3));
  }
  if (["entregado", "facturado"].includes(estado)) {
    fechaEntrega = addDays(fechaDespacho!, randInt(1, 3));
  }
  if (estado === "facturado") {
    fechaFacturacion = addDays(fechaEntrega!, randInt(0, 2));
  }

  return {
    id,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    locacionId: BODEGA_PRINCIPAL,
    fecha: fecha.toISOString(),
    estado,
    moneda: monedaDeCliente(cliente.id),
    lineas: buildLineas(i),
    fechaConfirmacion: fechaConfirmacion?.toISOString(),
    fechaDespacho: fechaDespacho?.toISOString(),
    fechaEntrega: fechaEntrega?.toISOString(),
    fechaFacturacion: fechaFacturacion?.toISOString(),
    fechaAnulacion: fechaAnulacion?.toISOString(),
    motivoAnulacion,
    createdAt: fecha.toISOString(),
  };
}).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

export const LOCACION_DESPACHO_DEFAULT = LOCACIONES_SEED[0].id;
