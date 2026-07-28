import type { CuentaBancaria, CuentaPorCobrar, CuentaPorPagar, MovimientoBancario } from "@/types";
import { addDays, seededBool, seededFloat, seededInt, seededPick, HOY } from "./seed";
import { dtesEmitidos } from "./facturacion";
import { clientes } from "./crm";
import { proveedores } from "./catalogos";
import { ordenesCompraLocal } from "./compras";

function diasEntre(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export const cuentasPorCobrar: CuentaPorCobrar[] = dtesEmitidos
  .filter((d) => d.estado === "Certificado")
  .map((d, i) => {
    const id = `cxc-${String(i + 1).padStart(3, "0")}`;
    const cliente = clientes.find((c) => c.id === d.clienteId)!;
    const vencimiento = addDays(d.fechaEmision, cliente.diasCredito || 15);
    const diasVencido = diasEntre(vencimiento, HOY);
    const pagada = seededBool(id + "-pag", 35);
    const saldo = pagada ? 0 : seededFloat(id + "-saldo", d.total * 0.2, d.total, 2);
    return {
      id,
      folioDte: `${d.serie}-${d.numero}`,
      clienteId: d.clienteId,
      fechaEmision: d.fechaEmision,
      fechaVencimiento: vencimiento,
      moneda: "GTQ",
      montoOriginal: d.total,
      saldoPendiente: saldo,
      diasVencido: pagada ? 0 : Math.max(0, diasVencido),
      estado: pagada ? "Pagada" : diasVencido > 0 ? "Vencida" : diasVencido > -5 ? "Por vencer" : "Vigente",
    };
  });

export const cuentasPorPagar: CuentaPorPagar[] = ordenesCompraLocal
  .filter((o) => o.estado === "Recibida" || o.estado === "Recibida parcial")
  .map((o, i) => {
    const id = `cxp-${String(i + 1).padStart(3, "0")}`;
    const proveedor = proveedores.find((p) => p.id === o.proveedorId)!;
    const monto = o.lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);
    const vencimiento = addDays(o.fechaEmision, proveedor.diasCredito);
    const diasVencido = diasEntre(vencimiento, HOY);
    const pagada = seededBool(id + "-pag", 40);
    return {
      id,
      documento: `FAC-PROV-${seededInt(id + "-doc", 10000, 99999)}`,
      proveedorId: proveedor.id,
      fechaEmision: o.fechaEmision,
      fechaVencimiento: vencimiento,
      moneda: o.moneda,
      montoOriginal: Math.round(monto * 100) / 100,
      saldoPendiente: pagada ? 0 : Math.round(monto * seededFloat(id + "-pct", 0.3, 1, 2) * 100) / 100,
      diasVencido: pagada ? 0 : Math.max(0, diasVencido),
      estado: pagada ? "Pagada" : diasVencido > 0 ? "Vencida" : diasVencido > -5 ? "Por vencer" : "Vigente",
      concepto: `Compra local ${o.folio}`,
    };
  });

export const cuentasBancarias: CuentaBancaria[] = [
  { id: "cb-01", banco: "Banco Industrial", nombreCuenta: "QPack S.A. - Cuenta Monetaria", numeroCuenta: "123-456789-0", moneda: "GTQ", tipo: "Monetaria", saldoContable: 1284350.22, saldoBanco: 1291020.55 },
  { id: "cb-02", banco: "Banco G&T Continental", nombreCuenta: "QPack S.A. - Cuenta Dolares", numeroCuenta: "987-654321-1", moneda: "USD", tipo: "Monetaria", saldoContable: 96540.1, saldoBanco: 94820.6 },
  { id: "cb-03", banco: "Banco Industrial", nombreCuenta: "QPack Occidente - Cuenta Operativa", numeroCuenta: "123-889900-4", moneda: "GTQ", tipo: "Monetaria", saldoContable: 312450.0, saldoBanco: 318900.75 },
];

const descripcionesBanco = ["Transferencia recibida cliente", "Pago a proveedor", "Comision bancaria", "Deposito en efectivo", "Cargo por chequera", "Pago de servicios", "Transferencia entre cuentas"];
const descripcionesSistema = ["Cobro DTE", "Pago CxP", "Nota de debito bancaria", "Deposito ventas contado", "Pago planilla", "Pago de importacion"];

export const movimientosBancarios: MovimientoBancario[] = cuentasBancarias.flatMap((cuenta) =>
  Array.from({ length: 16 }).map((_, i) => {
    const id = `${cuenta.id}-mov-${i + 1}`;
    const origen = seededPick(id + "-origen", ["Banco", "Sistema"] as const);
    const tipo = seededPick(id + "-tipo", ["Cargo", "Abono"] as const);
    return {
      id,
      cuentaBancariaId: cuenta.id,
      fecha: addDays(HOY, -seededInt(id + "-fecha", 0, 30)),
      descripcion: seededPick(id + "-desc", origen === "Banco" ? descripcionesBanco : descripcionesSistema),
      referencia: `${origen === "Banco" ? "BCO" : "SIS"}-${seededInt(id + "-ref", 100000, 999999)}`,
      monto: seededFloat(id + "-monto", 500, 85000, 2),
      tipo,
      origen,
      conciliado: seededBool(id + "-conc", 55),
    };
  })
);
