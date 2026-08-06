import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import {
  CUENTAS_BANCARIAS_SEED,
  MOVIMIENTOS_BANCARIOS_SEED,
  CAJAS_CHICAS_SEED,
  MOVIMIENTOS_CAJA_CHICA_SEED,
  type CuentaBancaria,
  type MovimientoBancario,
  type TipoMovimientoBancario,
  type CajaChica,
  type MovimientoCajaChica,
} from "@/lib/seed/tesoreria";
import { useContabilidadStore } from "@/lib/store/contabilidad";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface RegistrarMovimientoInput {
  cuentaId: string;
  tipo: TipoMovimientoBancario;
  monto: number;
  descripcion: string;
  referencia?: string;
}

export interface TransferenciaInput {
  cuentaOrigenId: string;
  cuentaDestinoId: string;
  monto: number;
  descripcion: string;
}

export interface LiquidacionCajaInput {
  cajaId: string;
  concepto: string;
  monto: number;
}

interface TesoreriaState {
  cuentas: CuentaBancaria[];
  movimientos: MovimientoBancario[];
  cajas: CajaChica[];
  movimientosCaja: MovimientoCajaChica[];
  registrarMovimiento: (input: RegistrarMovimientoInput) => Promise<void>;
  registrarTransferencia: (input: TransferenciaInput) => Promise<void>;
  depositarEnCuenta: (cuentaId: string, monto: number, descripcion: string, referencia?: string) => void;
  registrarGastoCaja: (input: LiquidacionCajaInput) => Promise<void>;
  reponerCaja: (cajaId: string, monto: number) => Promise<void>;
}

export const useTesoreriaStore = create<TesoreriaState>()(
  persist(
    (set, get) => ({
      cuentas: CUENTAS_BANCARIAS_SEED,
      movimientos: MOVIMIENTOS_BANCARIOS_SEED,
      cajas: CAJAS_CHICAS_SEED,
      movimientosCaja: MOVIMIENTOS_CAJA_CHICA_SEED,

      async registrarMovimiento(input) {
        await sleep();
        const cuenta = get().cuentas.find((c) => c.id === input.cuentaId);
        if (!cuenta) throw new Error("Cuenta no encontrada");
        const esEntrada = input.tipo === "deposito" || input.tipo === "transferencia-entrada";
        const nuevoSaldo = round2(esEntrada ? cuenta.saldo + input.monto : cuenta.saldo - input.monto);
        if (!esEntrada && nuevoSaldo < 0) throw new Error("Saldo insuficiente en la cuenta");

        const movimiento: MovimientoBancario = {
          id: nextId("mb"),
          cuentaId: input.cuentaId,
          tipo: input.tipo,
          fecha: new Date().toISOString(),
          monto: input.monto,
          descripcion: input.descripcion,
          referencia: input.referencia,
          saldoResultante: nuevoSaldo,
        };

        set({
          cuentas: get().cuentas.map((c) => (c.id === input.cuentaId ? { ...c, saldo: nuevoSaldo } : c)),
          movimientos: [movimiento, ...get().movimientos],
        });
      },

      async registrarTransferencia(input) {
        await sleep();
        const origen = get().cuentas.find((c) => c.id === input.cuentaOrigenId);
        const destino = get().cuentas.find((c) => c.id === input.cuentaDestinoId);
        if (!origen || !destino) throw new Error("Cuenta no encontrada");
        if (origen.saldo < input.monto) throw new Error("Saldo insuficiente en la cuenta de origen");

        const saldoOrigen = round2(origen.saldo - input.monto);
        const saldoDestino = round2(destino.saldo + input.monto);
        const fecha = new Date().toISOString();
        const refId = nextId("TRF");

        const movSalida: MovimientoBancario = {
          id: nextId("mb"),
          cuentaId: origen.id,
          tipo: "transferencia-salida",
          fecha,
          monto: input.monto,
          descripcion: input.descripcion,
          referencia: refId,
          saldoResultante: saldoOrigen,
        };
        const movEntrada: MovimientoBancario = {
          id: nextId("mb"),
          cuentaId: destino.id,
          tipo: "transferencia-entrada",
          fecha,
          monto: input.monto,
          descripcion: input.descripcion,
          referencia: refId,
          saldoResultante: saldoDestino,
        };

        set({
          cuentas: get().cuentas.map((c) =>
            c.id === origen.id ? { ...c, saldo: saldoOrigen } : c.id === destino.id ? { ...c, saldo: saldoDestino } : c,
          ),
          movimientos: [movEntrada, movSalida, ...get().movimientos],
        });
      },

      depositarEnCuenta(cuentaId, monto, descripcion, referencia) {
        const cuenta = get().cuentas.find((c) => c.id === cuentaId);
        if (!cuenta) return;
        const nuevoSaldo = round2(cuenta.saldo + monto);
        const movimiento: MovimientoBancario = {
          id: nextId("mb"),
          cuentaId,
          tipo: "deposito",
          fecha: new Date().toISOString(),
          monto,
          descripcion,
          referencia,
          saldoResultante: nuevoSaldo,
        };
        set({
          cuentas: get().cuentas.map((c) => (c.id === cuentaId ? { ...c, saldo: nuevoSaldo } : c)),
          movimientos: [movimiento, ...get().movimientos],
        });
      },

      async registrarGastoCaja(input) {
        await sleep();
        const caja = get().cajas.find((c) => c.id === input.cajaId);
        if (!caja) throw new Error("Caja chica no encontrada");
        if (caja.saldoActual < input.monto) throw new Error("Saldo insuficiente en la caja chica");
        const nuevoSaldo = round2(caja.saldoActual - input.monto);

        const movimiento: MovimientoCajaChica = {
          id: nextId("mcc"),
          cajaId: input.cajaId,
          tipo: "gasto",
          fecha: new Date().toISOString(),
          concepto: input.concepto,
          monto: input.monto,
          saldoResultante: nuevoSaldo,
        };

        set({
          cajas: get().cajas.map((c) => (c.id === input.cajaId ? { ...c, saldoActual: nuevoSaldo } : c)),
          movimientosCaja: [movimiento, ...get().movimientosCaja],
        });

        useContabilidadStore.getState().registrarPoliza({
          tipo: "gasto",
          concepto: `Gasto de caja chica — ${input.concepto}`,
          origen: input.cajaId,
          lineas: [
            { cuentaCodigo: "6.2.04", descripcion: "Gastos de Caja Chica", debe: input.monto, haber: 0 },
            { cuentaCodigo: "1.1.01", descripcion: "Caja General", debe: 0, haber: input.monto },
          ],
        });
      },

      async reponerCaja(cajaId, monto) {
        await sleep();
        const caja = get().cajas.find((c) => c.id === cajaId);
        if (!caja) throw new Error("Caja chica no encontrada");
        const nuevoSaldo = round2(caja.saldoActual + monto);

        const movimiento: MovimientoCajaChica = {
          id: nextId("mcc"),
          cajaId,
          tipo: "reposicion",
          fecha: new Date().toISOString(),
          concepto: "Reposición de fondo",
          monto,
          saldoResultante: nuevoSaldo,
        };

        set({
          cajas: get().cajas.map((c) => (c.id === cajaId ? { ...c, saldoActual: nuevoSaldo } : c)),
          movimientosCaja: [movimiento, ...get().movimientosCaja],
        });
      },
    }),
    { name: "qpack-tesoreria", skipHydration: true },
  ),
);
