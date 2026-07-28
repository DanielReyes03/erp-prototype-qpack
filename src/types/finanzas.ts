import type { Moneda } from "./common";

export interface CuentaPorCobrar {
  id: string;
  folioDte: string;
  clienteId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  moneda: Moneda;
  montoOriginal: number;
  saldoPendiente: number;
  diasVencido: number;
  estado: "Vigente" | "Por vencer" | "Vencida" | "Pagada";
}

export interface CuentaPorPagar {
  id: string;
  documento: string;
  proveedorId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  moneda: Moneda;
  montoOriginal: number;
  saldoPendiente: number;
  diasVencido: number;
  estado: "Vigente" | "Por vencer" | "Vencida" | "Pagada";
  concepto: string;
}

export interface CuentaBancaria {
  id: string;
  banco: string;
  nombreCuenta: string;
  numeroCuenta: string;
  moneda: Moneda;
  tipo: "Monetaria" | "Ahorro";
  saldoContable: number;
  saldoBanco: number;
}

export interface MovimientoBancario {
  id: string;
  cuentaBancariaId: string;
  fecha: string;
  descripcion: string;
  referencia: string;
  monto: number;
  tipo: "Cargo" | "Abono";
  origen: "Banco" | "Sistema";
  conciliado: boolean;
}
