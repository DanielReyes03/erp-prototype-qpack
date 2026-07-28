import type { CuentaContable, EstadoFinancieroLinea, LibroLegal, LineaPoliza, MovimientoMayor, Poliza, TipoPoliza } from "@/types";
import { addDays, seededFloat, seededInt, seededPick, HOY } from "./seed";

export const cuentasContables: CuentaContable[] = [
  { id: "cc-1101", codigo: "1101", nombre: "Caja y Bancos", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-1102", codigo: "1102", nombre: "Cuentas por Cobrar Clientes", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-1103", codigo: "1103", nombre: "Inventario de Mercaderias", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-1104", codigo: "1104", nombre: "IVA por Cobrar", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-1201", codigo: "1201", nombre: "Mobiliario y Equipo", tipo: "Activo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-2101", codigo: "2101", nombre: "Cuentas por Pagar Proveedores", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-2102", codigo: "2102", nombre: "IVA por Pagar", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-2103", codigo: "2103", nombre: "Prestamos Bancarios", tipo: "Pasivo", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-3101", codigo: "3101", nombre: "Capital Social", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-3102", codigo: "3102", nombre: "Utilidades Retenidas", tipo: "Patrimonio", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-4101", codigo: "4101", nombre: "Ventas Nacionales", tipo: "Ingreso", naturaleza: "Acreedora", nivel: 1 },
  { id: "cc-5101", codigo: "5101", nombre: "Costo de Ventas", tipo: "Costo", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-6101", codigo: "6101", nombre: "Gastos de Venta", tipo: "Gasto", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-6102", codigo: "6102", nombre: "Gastos de Administracion", tipo: "Gasto", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-6103", codigo: "6103", nombre: "Gastos Financieros", tipo: "Gasto", naturaleza: "Deudora", nivel: 1 },
  { id: "cc-6104", codigo: "6104", nombre: "Fletes y Gastos de Importacion", tipo: "Gasto", naturaleza: "Deudora", nivel: 1 },
];

const conceptosPoliza = [
  "Registro de venta al credito",
  "Registro de compra de mercaderia",
  "Pago a proveedor del exterior",
  "Cobro de cartera de clientes",
  "Registro de gastos de importacion",
  "Depreciacion de mobiliario y equipo",
  "Provision de gastos de administracion",
  "Ajuste de inventario por conteo fisico",
];

const tiposPoliza: TipoPoliza[] = ["Ingreso", "Egreso", "Diario"];
const modulosOrigen = ["Ventas", "Compras", "Bancos", "Inventario", "Facturacion", "Manual"];

export const polizas: Poliza[] = Array.from({ length: 24 }).map((_, i) => {
  const id = `pol-${String(i + 1).padStart(3, "0")}`;
  const monto = seededFloat(id + "-monto", 3500, 180000, 2);
  const cuentaDebe = seededPick(id + "-cd", cuentasContables);
  let cuentaHaber = seededPick(id + "-ch", cuentasContables);
  if (cuentaHaber.id === cuentaDebe.id) cuentaHaber = cuentasContables[(cuentasContables.indexOf(cuentaDebe) + 3) % cuentasContables.length];
  const lineas: LineaPoliza[] = [
    { id: `${id}-l1`, cuentaId: cuentaDebe.id, descripcion: "Registro segun documento soporte", debe: monto, haber: 0 },
    { id: `${id}-l2`, cuentaId: cuentaHaber.id, descripcion: "Registro segun documento soporte", debe: 0, haber: monto },
  ];
  return {
    id,
    folio: `POL-2026-${String(i + 1).padStart(4, "0")}`,
    tipo: seededPick(id + "-tipo", tiposPoliza),
    fecha: addDays(HOY, -seededInt(id + "-fecha", 0, 60)),
    concepto: seededPick(id + "-concepto", conceptosPoliza),
    estado: seededPick(id + "-estado", ["Borrador", "Contabilizada", "Anulada"] as const),
    lineas,
    elaboradoPor: seededPick(id + "-user", ["Karen Ivonne Xitumul", "Estuardo Salguero", "Sistema automatico"] as const),
    origenModulo: seededPick(id + "-origen", modulosOrigen),
  };
});

export const movimientosMayor: MovimientoMayor[] = polizas
  .filter((p) => p.estado === "Contabilizada")
  .flatMap((p) =>
    p.lineas.map((l, i) => ({
      id: `${p.id}-mayor-${i + 1}`,
      cuentaId: l.cuentaId,
      fecha: p.fecha,
      polizaFolio: p.folio,
      concepto: p.concepto,
      debe: l.debe,
      haber: l.haber,
      saldo: l.debe - l.haber,
    }))
  );

export const estadoResultadosActual: EstadoFinancieroLinea[] = [
  { concepto: "Ventas Netas", nivel: 0, montoActual: 4820500, montoAnterior: 4310200, esTotal: false },
  { concepto: "Costo de Ventas", nivel: 0, montoActual: -3184300, montoAnterior: -2895100 },
  { concepto: "Utilidad Bruta", nivel: 0, montoActual: 1636200, montoAnterior: 1415100, esTotal: true },
  { concepto: "Gastos de Venta", nivel: 1, montoActual: -486200, montoAnterior: -441300 },
  { concepto: "Gastos de Administracion", nivel: 1, montoActual: -312400, montoAnterior: -298700 },
  { concepto: "Fletes y Gastos de Importacion", nivel: 1, montoActual: -158900, montoAnterior: -172400 },
  { concepto: "Utilidad de Operacion", nivel: 0, montoActual: 678700, montoAnterior: 502700, esTotal: true },
  { concepto: "Gastos Financieros", nivel: 1, montoActual: -84200, montoAnterior: -76900 },
  { concepto: "Utilidad Neta", nivel: 0, montoActual: 594500, montoAnterior: 425800, esTotal: true },
];

export const balanceGeneralActual: EstadoFinancieroLinea[] = [
  { concepto: "Caja y Bancos", nivel: 1, montoActual: 1693340, montoAnterior: 1420500 },
  { concepto: "Cuentas por Cobrar", nivel: 1, montoActual: 2140800, montoAnterior: 1980200 },
  { concepto: "Inventario", nivel: 1, montoActual: 3852100, montoAnterior: 3610400 },
  { concepto: "Activo Circulante", nivel: 0, montoActual: 7686240, montoAnterior: 7011100, esTotal: true },
  { concepto: "Mobiliario y Equipo Neto", nivel: 1, montoActual: 984200, montoAnterior: 1042300 },
  { concepto: "Total Activo", nivel: 0, montoActual: 8670440, montoAnterior: 8053400, esTotal: true },
  { concepto: "Cuentas por Pagar", nivel: 1, montoActual: 1854200, montoAnterior: 1712600 },
  { concepto: "Prestamos Bancarios", nivel: 1, montoActual: 1200000, montoAnterior: 1400000 },
  { concepto: "Total Pasivo", nivel: 0, montoActual: 3054200, montoAnterior: 3112600, esTotal: true },
  { concepto: "Capital y Utilidades Retenidas", nivel: 1, montoActual: 5616240, montoAnterior: 4940800 },
  { concepto: "Total Patrimonio", nivel: 0, montoActual: 5616240, montoAnterior: 4940800, esTotal: true },
];

export const librosLegales: LibroLegal[] = [
  { id: "lib-compras", nombre: "Libro de Compras", periodo: "Julio 2026", estado: "Al dia", fechaLimite: "2026-08-15" },
  { id: "lib-ventas", nombre: "Libro de Ventas", periodo: "Julio 2026", estado: "Al dia", fechaLimite: "2026-08-15" },
  { id: "lib-inventarios", nombre: "Inventarios", periodo: "Segundo Semestre 2026", estado: "Pendiente de impresion", fechaLimite: "2027-01-31" },
  { id: "lib-eeff", nombre: "Estados Financieros", periodo: "Junio 2026", estado: "Presentado", fechaLimite: "2026-07-31" },
];
