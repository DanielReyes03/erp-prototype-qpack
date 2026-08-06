export interface CuentaBancaria {
  id: string;
  banco: string;
  nombre: string;
  numeroCuenta: string;
  tipoCuenta: "Monetaria" | "Ahorro";
  moneda: "GTQ" | "USD";
  saldo: number;
  activa: boolean;
}

export type TipoMovimientoBancario =
  | "deposito"
  | "cheque"
  | "transferencia-entrada"
  | "transferencia-salida";

export interface MovimientoBancario {
  id: string;
  cuentaId: string;
  tipo: TipoMovimientoBancario;
  fecha: string;
  monto: number;
  descripcion: string;
  referencia?: string;
  saldoResultante: number;
}

export interface CajaChica {
  id: string;
  nombre: string;
  responsable: string;
  montoAsignado: number;
  saldoActual: number;
}

export type TipoGastoCaja = "gasto" | "reposicion";

export interface MovimientoCajaChica {
  id: string;
  cajaId: string;
  tipo: TipoGastoCaja;
  fecha: string;
  concepto: string;
  monto: number;
  saldoResultante: number;
}

export const CUENTAS_BANCARIAS_SEED: CuentaBancaria[] = [
  {
    id: "cta-001",
    banco: "Banco Industrial",
    nombre: "Cuenta Monetaria Operaciones",
    numeroCuenta: "301-0045678-9",
    tipoCuenta: "Monetaria",
    moneda: "GTQ",
    saldo: 486_320.5,
    activa: true,
  },
  {
    id: "cta-002",
    banco: "Banco G&T Continental",
    nombre: "Cuenta Ahorro Reserva",
    numeroCuenta: "112-8834021-4",
    tipoCuenta: "Ahorro",
    moneda: "GTQ",
    saldo: 214_600.0,
    activa: true,
  },
  {
    id: "cta-003",
    banco: "Banco Industrial",
    nombre: "Cuenta Monetaria USD Importaciones",
    numeroCuenta: "301-0091234-2",
    tipoCuenta: "Monetaria",
    moneda: "USD",
    saldo: 58_940.75,
    activa: true,
  },
  {
    id: "cta-004",
    banco: "Banrural",
    nombre: "Cuenta Monetaria Sucursales",
    numeroCuenta: "3-041-00223344-1",
    tipoCuenta: "Monetaria",
    moneda: "GTQ",
    saldo: 92_150.25,
    activa: true,
  },
];

let seedState = 555;
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
  return seedState / 0x7fffffff;
}
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const DESCRIPCIONES_DEPOSITO = [
  "Depósito por cobro a clientes",
  "Depósito de caja del día",
  "Abono de cliente mostrador",
];
const DESCRIPCIONES_CHEQUE = [
  "Pago a proveedor",
  "Pago de servicios",
  "Pago de planilla quincenal",
];

function buildMovimientosCuenta(cuenta: CuentaBancaria, count: number, idxBase: number): MovimientoBancario[] {
  const movimientos: MovimientoBancario[] = [];
  let saldo = round2(cuenta.saldo - cuenta.saldo * 0.35);
  const inicio = new Date(2026, 2, 1);

  for (let i = 0; i < count; i++) {
    const esDeposito = rand() > 0.45;
    const monto = round2(2000 + rand() * 25000);
    saldo = round2(esDeposito ? saldo + monto : saldo - monto);
    const fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + i * 5 + Math.floor(rand() * 4));

    movimientos.push({
      id: `mb-${idxBase}-${i}`,
      cuentaId: cuenta.id,
      tipo: esDeposito ? "deposito" : "cheque",
      fecha: fecha.toISOString(),
      monto,
      descripcion: esDeposito
        ? DESCRIPCIONES_DEPOSITO[i % DESCRIPCIONES_DEPOSITO.length]
        : DESCRIPCIONES_CHEQUE[i % DESCRIPCIONES_CHEQUE.length],
      referencia: esDeposito ? `DEP-${1000 + idxBase * 50 + i}` : `CHQ-${2000 + idxBase * 50 + i}`,
      saldoResultante: saldo,
    });
  }
  return movimientos;
}

export const MOVIMIENTOS_BANCARIOS_SEED: MovimientoBancario[] = CUENTAS_BANCARIAS_SEED.flatMap(
  (cuenta, i) => buildMovimientosCuenta(cuenta, 6, i),
).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

export const CAJAS_CHICAS_SEED: CajaChica[] = [
  {
    id: "caja-001",
    nombre: "Caja Chica Bodega Central",
    responsable: "María Fernanda González",
    montoAsignado: 5000,
    saldoActual: 1840.5,
  },
  {
    id: "caja-002",
    nombre: "Caja Chica Administración",
    responsable: "Silvia Patricia López",
    montoAsignado: 3000,
    saldoActual: 2185.0,
  },
];

const CONCEPTOS_GASTO = [
  "Combustible para reparto",
  "Papelería y útiles de oficina",
  "Mantenimiento de montacargas",
  "Correo y mensajería",
  "Refacción para reunión con proveedor",
];

export const MOVIMIENTOS_CAJA_CHICA_SEED: MovimientoCajaChica[] = CAJAS_CHICAS_SEED.flatMap(
  (caja, ci) => {
    const movimientos: MovimientoCajaChica[] = [];
    let saldo = caja.montoAsignado;
    const inicio = new Date(2026, 5, 1);
    for (let i = 0; i < 5; i++) {
      const monto = round2(80 + rand() * 320);
      saldo = round2(saldo - monto);
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i * 6);
      movimientos.push({
        id: `mcc-${ci}-${i}`,
        cajaId: caja.id,
        tipo: "gasto",
        fecha: fecha.toISOString(),
        concepto: CONCEPTOS_GASTO[(ci + i) % CONCEPTOS_GASTO.length],
        monto,
        saldoResultante: saldo,
      });
    }
    return movimientos;
  },
).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
