import { PRODUCTOS_SEED } from "./productos";
import { LOCACIONES_SEED } from "./locaciones";

export type TipoMovimiento =
  | "entrada"
  | "salida"
  | "ajuste-positivo"
  | "ajuste-negativo"
  | "traslado-salida"
  | "traslado-entrada";

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  productoId: string;
  locacionId: string;
  cantidad: number;
  costoUnitario: number;
  motivo: string;
  documentoReferencia?: string;
  locacionRelacionadaId?: string;
  saldoCantidad: number;
  saldoCostoPromedio: number;
}

export interface ExistenciaLocacion {
  productoId: string;
  locacionId: string;
  cantidad: number;
  costoPromedio: number;
}

const BODEGA_PRINCIPAL = "loc-central";
const LOCACIONES_SECUNDARIAS = LOCACIONES_SEED.filter((l) => l.id !== BODEGA_PRINCIPAL).map(
  (l) => l.id,
);

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function addMonths(base: Date, months: number, day: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  d.setDate(Math.min(day, 28));
  return d;
}

const HOY = new Date(2026, 7, 5); // 2026-08-05, fecha de referencia de la demo
const INICIO = addMonths(HOY, -6, 1);

let counter = 0;
function nextMovId(): string {
  counter += 1;
  return `mov-${String(counter).padStart(6, "0")}`;
}

const state = new Map<string, { cantidad: number; costoPromedio: number }>();
function key(productoId: string, locacionId: string) {
  return `${productoId}::${locacionId}`;
}
function getState(productoId: string, locacionId: string) {
  return state.get(key(productoId, locacionId)) ?? { cantidad: 0, costoPromedio: 0 };
}
function setState(productoId: string, locacionId: string, cantidad: number, costoPromedio: number) {
  state.set(key(productoId, locacionId), { cantidad: round2(cantidad), costoPromedio: round2(costoPromedio) });
}

const movimientos: MovimientoInventario[] = [];

function registrar(
  fecha: Date,
  tipo: TipoMovimiento,
  productoId: string,
  locacionId: string,
  cantidad: number,
  costoUnitarioEntrada: number | null,
  motivo: string,
  documentoReferencia?: string,
  locacionRelacionadaId?: string,
) {
  const prev = getState(productoId, locacionId);
  let nuevaCantidad = prev.cantidad;
  let nuevoCosto = prev.costoPromedio;

  const esEntrada = tipo === "entrada" || tipo === "ajuste-positivo" || tipo === "traslado-entrada";

  if (esEntrada) {
    const costo = costoUnitarioEntrada ?? prev.costoPromedio;
    const valorAnterior = prev.cantidad * prev.costoPromedio;
    const valorEntrante = cantidad * costo;
    nuevaCantidad = prev.cantidad + cantidad;
    nuevoCosto = nuevaCantidad > 0 ? (valorAnterior + valorEntrante) / nuevaCantidad : costo;
  } else {
    nuevaCantidad = Math.max(0, prev.cantidad - cantidad);
    // El costo promedio no cambia en una salida.
  }

  setState(productoId, locacionId, nuevaCantidad, nuevoCosto);

  movimientos.push({
    id: nextMovId(),
    fecha: fecha.toISOString(),
    tipo,
    productoId,
    locacionId,
    cantidad: round2(cantidad),
    costoUnitario: round2(esEntrada ? (costoUnitarioEntrada ?? prev.costoPromedio) : prev.costoPromedio),
    motivo,
    documentoReferencia,
    locacionRelacionadaId,
    saldoCantidad: round2(nuevaCantidad),
    saldoCostoPromedio: round2(nuevoCosto),
  });
}

// Se generan movimientos solo para un subconjunto de productos (los de mayor rotación)
// para mantener ~200 movimientos totales, distribuidos en 6 meses.
const PRODUCTOS_CON_MOVIMIENTO = PRODUCTOS_SEED.slice(0, 40);

let ocCounter = 1200;
let ovCounter = 3100;
let ajCounter = 500;
let trCounter = 80;

PRODUCTOS_CON_MOVIMIENTO.forEach((producto, idx) => {
  const locacionSecundaria = LOCACIONES_SECUNDARIAS[idx % LOCACIONES_SECUNDARIAS.length];

  // 1. Entrada inicial (apertura de saldo) en la bodega principal.
  const cantidadApertura = round2(producto.existenciaTotal * 0.55);
  registrar(
    INICIO,
    "entrada",
    producto.id,
    BODEGA_PRINCIPAL,
    cantidadApertura,
    producto.costo * 0.96,
    "Compra a proveedor",
    `OC-${String(ocCounter++).padStart(6, "0")}`,
  );

  // 2. Un par de compras adicionales durante el período.
  const numCompras = 1 + (idx % 2);
  for (let c = 0; c < numCompras; c++) {
    const mes = 1 + c * 2 + (idx % 2);
    const fecha = addMonths(INICIO, mes, 5 + (idx % 20));
    const cantidad = round2(producto.existenciaTotal * (0.18 + (idx % 3) * 0.03));
    registrar(
      fecha,
      "entrada",
      producto.id,
      BODEGA_PRINCIPAL,
      cantidad,
      producto.costo * (0.97 + (idx % 5) * 0.01),
      "Compra a proveedor",
      `OC-${String(ocCounter++).padStart(6, "0")}`,
    );
  }

  // 3. Varias salidas por venta a lo largo del período.
  const numVentas = 3 + (idx % 3);
  for (let v = 0; v < numVentas; v++) {
    const mes = v * 1 + (idx % 2);
    const fecha = addMonths(INICIO, Math.min(mes, 5), 10 + (v % 15));
    const disponible = getState(producto.id, BODEGA_PRINCIPAL).cantidad;
    const cantidad = round2(Math.min(disponible * 0.12, disponible));
    if (cantidad > 0) {
      registrar(
        fecha,
        "salida",
        producto.id,
        BODEGA_PRINCIPAL,
        cantidad,
        null,
        "Venta a cliente",
        `OV-${String(ovCounter++).padStart(6, "0")}`,
      );
    }
  }

  // 4. Traslado a una locación secundaria.
  if (idx % 2 === 0) {
    const fecha = addMonths(INICIO, 3, 12);
    const disponible = getState(producto.id, BODEGA_PRINCIPAL).cantidad;
    const cantidad = round2(Math.min(disponible * 0.2, disponible));
    if (cantidad > 0) {
      const costoActual = getState(producto.id, BODEGA_PRINCIPAL).costoPromedio;
      const doc = `TR-${String(trCounter++).padStart(6, "0")}`;
      registrar(
        fecha,
        "traslado-salida",
        producto.id,
        BODEGA_PRINCIPAL,
        cantidad,
        null,
        "Traslado entre bodegas",
        doc,
        locacionSecundaria,
      );
      registrar(
        fecha,
        "traslado-entrada",
        producto.id,
        locacionSecundaria,
        cantidad,
        costoActual,
        "Traslado entre bodegas",
        doc,
        BODEGA_PRINCIPAL,
      );
    }
  }

  // 5. Un ajuste de inventario ocasional (conteo físico).
  if (idx % 4 === 0) {
    const fecha = addMonths(INICIO, 5, 20);
    const disponible = getState(producto.id, BODEGA_PRINCIPAL).cantidad;
    const esPositivo = idx % 8 === 0;
    const cantidad = round2(Math.max(1, disponible * 0.03));
    registrar(
      fecha,
      esPositivo ? "ajuste-positivo" : "ajuste-negativo",
      producto.id,
      BODEGA_PRINCIPAL,
      cantidad,
      esPositivo ? getState(producto.id, BODEGA_PRINCIPAL).costoPromedio : null,
      "Ajuste por conteo físico",
      `AJ-${String(ajCounter++).padStart(6, "0")}`,
    );
  }
});

// Para el resto de productos (sin movimientos generados), se deja una existencia
// base directamente en la bodega principal, al costo de catálogo.
PRODUCTOS_SEED.slice(40).forEach((producto) => {
  setState(producto.id, BODEGA_PRINCIPAL, producto.existenciaTotal, producto.costo);
});

movimientos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

export const KARDEX_MOVIMIENTOS_SEED: MovimientoInventario[] = movimientos;

export const EXISTENCIAS_SEED: ExistenciaLocacion[] = Array.from(state.entries())
  .filter(([, v]) => v.cantidad > 0)
  .map(([k, v]) => {
    const [productoId, locacionId] = k.split("::");
    return { productoId, locacionId, cantidad: v.cantidad, costoPromedio: v.costoPromedio };
  });
