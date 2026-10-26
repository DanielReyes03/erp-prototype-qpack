import { CLIENTES_SEED } from "./clientes";
import { PRODUCTOS_SEED } from "./productos";
import { LOCACIONES_SEED } from "./locaciones";
import { LISTAS_PRECIOS_SEED } from "./listas-precios";

export type EstadoOV =
  | "recibido"
  | "facturado"
  | "programado"
  | "entregado"
  | "anulado";

/** Estado del compromiso de inventario asociado a la orden. */
export type InvEstadoOV = "reservado" | "descargado" | "devuelto" | "ninguno";

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
  invEstado: InvEstadoOV;
  moneda: "GTQ" | "USD";
  lineas: OrdenVentaLinea[];
  notas?: string;
  fechaRecepcion: string;
  fechaFacturacion?: string;
  fechaProgramacion?: string;
  fechaEntrega?: string;
  fechaAnulacion?: string;
  motivoAnulacion?: string;
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
  ...Array(20).fill("recibido"),
  ...Array(25).fill("facturado"),
  ...Array(12).fill("programado"),
  ...Array(25).fill("entregado"),
  ...Array(8).fill("anulado"),
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

const HISTORICO: EstadoOV[] = ["facturado", "programado", "entregado"];

export const ORDENES_VENTA_SEED: OrdenVenta[] = ESTADOS_PLAN.map((estado, i) => {
  const id = `OV-${String(100 + i).padStart(6, "0")}`;
  const cliente = CLIENTES_SEED[i % CLIENTES_SEED.length];
  const diasAtras = randInt(3, 175);
  const fecha = daysAgo(diasAtras);

  let fechaFacturacion: Date | undefined;
  let fechaProgramacion: Date | undefined;
  let fechaEntrega: Date | undefined;
  let fechaAnulacion: Date | undefined;
  let motivoAnulacion: string | undefined;

  if (HISTORICO.includes(estado)) {
    fechaFacturacion = addDays(fecha, randInt(1, 3));
  }
  if (estado === "programado" || estado === "entregado") {
    fechaProgramacion = addDays(fechaFacturacion!, randInt(0, 2));
  }
  if (estado === "entregado") {
    fechaEntrega = addDays(fechaProgramacion!, randInt(1, 3));
  }
  if (estado === "anulado") {
    fechaAnulacion = addDays(fecha, randInt(1, 4));
    motivoAnulacion = pick(MOTIVOS_ANULACION);
  }

  // Las órdenes semilla "recibido" reservan inventario (se reconstruye en el seed de
  // kardex); el resto no toca el inventario en tiempo de ejecución (invEstado: "ninguno").
  const invEstado: OrdenVenta["invEstado"] = estado === "recibido" ? "reservado" : "ninguno";

  return {
    id,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    locacionId: BODEGA_PRINCIPAL,
    fecha: fecha.toISOString(),
    estado,
    invEstado,
    moneda: monedaDeCliente(cliente.id),
    lineas: buildLineas(i),
    fechaRecepcion: fecha.toISOString(),
    fechaFacturacion: fechaFacturacion?.toISOString(),
    fechaProgramacion: fechaProgramacion?.toISOString(),
    fechaEntrega: fechaEntrega?.toISOString(),
    fechaAnulacion: fechaAnulacion?.toISOString(),
    motivoAnulacion,
    createdAt: fecha.toISOString(),
  };
}).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

export const LOCACION_DESPACHO_DEFAULT = LOCACIONES_SEED[0].id;
