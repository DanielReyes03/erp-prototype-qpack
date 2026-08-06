import { CLIENTES_SEED } from "./clientes";
import { PRODUCTOS_SEED } from "./productos";
import { LISTAS_PRECIOS_SEED } from "./listas-precios";

export type EstadoCotizacion =
  | "borrador"
  | "enviada"
  | "aceptada"
  | "rechazada"
  | "vencida"
  | "convertida";

export interface CotizacionLinea {
  id: string;
  productoId: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
}

export interface Cotizacion {
  id: string;
  clienteId: string;
  vendedorId: string;
  fecha: string;
  fechaValidez: string;
  estado: EstadoCotizacion;
  moneda: "GTQ" | "USD";
  lineas: CotizacionLinea[];
  notas?: string;
  ordenVentaId?: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);

let seedState = 7;
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

function monedaDeCliente(clienteId: string): "GTQ" | "USD" {
  const cliente = CLIENTES_SEED.find((c) => c.id === clienteId);
  const lista = LISTAS_PRECIOS_SEED.find((l) => l.id === cliente?.listaPrecioId);
  return lista?.moneda ?? "GTQ";
}

const ESTADOS_PLAN: EstadoCotizacion[] = [
  ...Array(5).fill("borrador"),
  ...Array(6).fill("enviada"),
  ...Array(5).fill("aceptada"),
  ...Array(3).fill("rechazada"),
  ...Array(3).fill("vencida"),
  ...Array(3).fill("convertida"),
] as EstadoCotizacion[];

function buildLineas(index: number): CotizacionLinea[] {
  const numLineas = 1 + (index % 3);
  const lineas: CotizacionLinea[] = [];
  const usados = new Set<string>();
  for (let i = 0; i < numLineas; i++) {
    let producto = pick(PRODUCTOS_SEED);
    let attempts = 0;
    while (usados.has(producto.id) && attempts < 10) {
      producto = pick(PRODUCTOS_SEED);
      attempts++;
    }
    usados.add(producto.id);
    lineas.push({
      id: `cotl-${index}-${i}`,
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      unidadMedida: producto.unidadMedida,
      cantidad: randInt(2, 25),
      precioUnitario: producto.precioBase,
      descuentoPorcentaje: 0,
    });
  }
  return lineas;
}

export const COTIZACIONES_SEED: Cotizacion[] = ESTADOS_PLAN.map((estado, i) => {
  const id = `COT-${String(100 + i).padStart(6, "0")}`;
  const cliente = CLIENTES_SEED[(i * 3 + 5) % CLIENTES_SEED.length];
  const diasAtras = randInt(2, 90);
  const fecha = daysAgo(diasAtras);
  const fechaValidez = addDays(fecha, 15);

  return {
    id,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    fecha: fecha.toISOString(),
    fechaValidez: fechaValidez.toISOString(),
    estado,
    moneda: monedaDeCliente(cliente.id),
    lineas: buildLineas(i),
    createdAt: fecha.toISOString(),
  };
}).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
