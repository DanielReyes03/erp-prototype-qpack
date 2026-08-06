import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import {
  EXISTENCIAS_SEED,
  KARDEX_MOVIMIENTOS_SEED,
  type ExistenciaLocacion,
  type MovimientoInventario,
  type TipoMovimiento,
} from "@/lib/seed/kardex";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface EntradaInput {
  productoId: string;
  locacionId: string;
  cantidad: number;
  costoUnitario: number;
  motivo: string;
  documentoReferencia?: string;
}

interface SalidaInput {
  productoId: string;
  locacionId: string;
  cantidad: number;
  motivo: string;
  documentoReferencia?: string;
}

interface AjusteInput {
  productoId: string;
  locacionId: string;
  cantidad: number;
  tipo: "positivo" | "negativo";
  motivo: string;
  documentoReferencia?: string;
}

interface TrasladoInput {
  productoId: string;
  locacionOrigenId: string;
  locacionDestinoId: string;
  cantidad: number;
  motivo: string;
  documentoReferencia?: string;
}

interface InventarioState {
  existencias: ExistenciaLocacion[];
  movimientos: MovimientoInventario[];
  getExistencia: (productoId: string, locacionId: string) => ExistenciaLocacion | undefined;
  getExistenciaTotal: (productoId: string) => number;
  getCostoPromedio: (productoId: string, locacionId: string) => number;
  registrarEntrada: (input: EntradaInput) => Promise<void>;
  registrarSalida: (input: SalidaInput) => Promise<void>;
  registrarAjuste: (input: AjusteInput) => Promise<void>;
  registrarTraslado: (input: TrasladoInput) => Promise<void>;
}

function applyMovimiento(
  existencias: ExistenciaLocacion[],
  tipo: TipoMovimiento,
  productoId: string,
  locacionId: string,
  cantidad: number,
  costoUnitarioEntrada: number | null,
): { existencias: ExistenciaLocacion[]; saldoCantidad: number; saldoCostoPromedio: number; costoUnitarioUsado: number } {
  const idx = existencias.findIndex(
    (e) => e.productoId === productoId && e.locacionId === locacionId,
  );
  const prev = idx >= 0 ? existencias[idx] : { productoId, locacionId, cantidad: 0, costoPromedio: 0 };

  const esEntrada = tipo === "entrada" || tipo === "ajuste-positivo" || tipo === "traslado-entrada";
  let nuevaCantidad: number;
  let nuevoCosto: number;
  let costoUnitarioUsado: number;

  if (esEntrada) {
    const costo = costoUnitarioEntrada ?? prev.costoPromedio;
    const valorAnterior = prev.cantidad * prev.costoPromedio;
    const valorEntrante = cantidad * costo;
    nuevaCantidad = prev.cantidad + cantidad;
    nuevoCosto = nuevaCantidad > 0 ? (valorAnterior + valorEntrante) / nuevaCantidad : costo;
    costoUnitarioUsado = costo;
  } else {
    nuevaCantidad = Math.max(0, prev.cantidad - cantidad);
    nuevoCosto = prev.costoPromedio;
    costoUnitarioUsado = prev.costoPromedio;
  }

  const nuevaEntrada: ExistenciaLocacion = {
    productoId,
    locacionId,
    cantidad: round2(nuevaCantidad),
    costoPromedio: round2(nuevoCosto),
  };

  const next = [...existencias];
  if (idx >= 0) next[idx] = nuevaEntrada;
  else next.push(nuevaEntrada);

  return {
    existencias: next,
    saldoCantidad: nuevaEntrada.cantidad,
    saldoCostoPromedio: nuevaEntrada.costoPromedio,
    costoUnitarioUsado: round2(costoUnitarioUsado),
  };
}

export const useInventarioStore = create<InventarioState>()(
  persist(
    (set, get) => ({
      existencias: EXISTENCIAS_SEED,
      movimientos: KARDEX_MOVIMIENTOS_SEED,

      getExistencia(productoId, locacionId) {
        return get().existencias.find(
          (e) => e.productoId === productoId && e.locacionId === locacionId,
        );
      },

      getExistenciaTotal(productoId) {
        return round2(
          get()
            .existencias.filter((e) => e.productoId === productoId)
            .reduce((sum, e) => sum + e.cantidad, 0),
        );
      },

      getCostoPromedio(productoId, locacionId) {
        return get().getExistencia(productoId, locacionId)?.costoPromedio ?? 0;
      },

      async registrarEntrada(input) {
        await sleep();
        const { existencias, movimientos } = get();
        const result = applyMovimiento(
          existencias,
          "entrada",
          input.productoId,
          input.locacionId,
          input.cantidad,
          input.costoUnitario,
        );
        const movimiento: MovimientoInventario = {
          id: nextId("mov"),
          fecha: new Date().toISOString(),
          tipo: "entrada",
          productoId: input.productoId,
          locacionId: input.locacionId,
          cantidad: round2(input.cantidad),
          costoUnitario: result.costoUnitarioUsado,
          motivo: input.motivo,
          documentoReferencia: input.documentoReferencia,
          saldoCantidad: result.saldoCantidad,
          saldoCostoPromedio: result.saldoCostoPromedio,
        };
        set({ existencias: result.existencias, movimientos: [...movimientos, movimiento] });
      },

      async registrarSalida(input) {
        await sleep();
        const { existencias, movimientos, getExistencia } = get();
        const actual = getExistencia(input.productoId, input.locacionId);
        if (!actual || actual.cantidad < input.cantidad) {
          throw new Error("Existencia insuficiente en la locación seleccionada");
        }
        const result = applyMovimiento(
          existencias,
          "salida",
          input.productoId,
          input.locacionId,
          input.cantidad,
          null,
        );
        const movimiento: MovimientoInventario = {
          id: nextId("mov"),
          fecha: new Date().toISOString(),
          tipo: "salida",
          productoId: input.productoId,
          locacionId: input.locacionId,
          cantidad: round2(input.cantidad),
          costoUnitario: result.costoUnitarioUsado,
          motivo: input.motivo,
          documentoReferencia: input.documentoReferencia,
          saldoCantidad: result.saldoCantidad,
          saldoCostoPromedio: result.saldoCostoPromedio,
        };
        set({ existencias: result.existencias, movimientos: [...movimientos, movimiento] });
      },

      async registrarAjuste(input) {
        await sleep();
        const { existencias, movimientos, getExistencia } = get();
        const tipo: TipoMovimiento = input.tipo === "positivo" ? "ajuste-positivo" : "ajuste-negativo";
        if (tipo === "ajuste-negativo") {
          const actual = getExistencia(input.productoId, input.locacionId);
          if (!actual || actual.cantidad < input.cantidad) {
            throw new Error("Existencia insuficiente para el ajuste negativo");
          }
        }
        const result = applyMovimiento(
          existencias,
          tipo,
          input.productoId,
          input.locacionId,
          input.cantidad,
          tipo === "ajuste-positivo" ? get().getCostoPromedio(input.productoId, input.locacionId) : null,
        );
        const movimiento: MovimientoInventario = {
          id: nextId("mov"),
          fecha: new Date().toISOString(),
          tipo,
          productoId: input.productoId,
          locacionId: input.locacionId,
          cantidad: round2(input.cantidad),
          costoUnitario: result.costoUnitarioUsado,
          motivo: input.motivo,
          documentoReferencia: input.documentoReferencia,
          saldoCantidad: result.saldoCantidad,
          saldoCostoPromedio: result.saldoCostoPromedio,
        };
        set({ existencias: result.existencias, movimientos: [...movimientos, movimiento] });
      },

      async registrarTraslado(input) {
        await sleep();
        const { getExistencia } = get();
        const actual = getExistencia(input.productoId, input.locacionOrigenId);
        if (!actual || actual.cantidad < input.cantidad) {
          throw new Error("Existencia insuficiente en la locación de origen");
        }
        const costoActual = actual.costoPromedio;
        const docId = input.documentoReferencia ?? nextId("TR");

        const salida = applyMovimiento(
          get().existencias,
          "traslado-salida",
          input.productoId,
          input.locacionOrigenId,
          input.cantidad,
          null,
        );
        const entrada = applyMovimiento(
          salida.existencias,
          "traslado-entrada",
          input.productoId,
          input.locacionDestinoId,
          input.cantidad,
          costoActual,
        );

        const fecha = new Date().toISOString();
        const movSalida: MovimientoInventario = {
          id: nextId("mov"),
          fecha,
          tipo: "traslado-salida",
          productoId: input.productoId,
          locacionId: input.locacionOrigenId,
          cantidad: round2(input.cantidad),
          costoUnitario: salida.costoUnitarioUsado,
          motivo: input.motivo,
          documentoReferencia: docId,
          locacionRelacionadaId: input.locacionDestinoId,
          saldoCantidad: salida.saldoCantidad,
          saldoCostoPromedio: salida.saldoCostoPromedio,
        };
        const movEntrada: MovimientoInventario = {
          id: nextId("mov"),
          fecha,
          tipo: "traslado-entrada",
          productoId: input.productoId,
          locacionId: input.locacionDestinoId,
          cantidad: round2(input.cantidad),
          costoUnitario: entrada.costoUnitarioUsado,
          motivo: input.motivo,
          documentoReferencia: docId,
          locacionRelacionadaId: input.locacionOrigenId,
          saldoCantidad: entrada.saldoCantidad,
          saldoCostoPromedio: entrada.saldoCostoPromedio,
        };

        set({
          existencias: entrada.existencias,
          movimientos: [...get().movimientos, movSalida, movEntrada],
        });
      },
    }),
    { name: "qpack-inventario", skipHydration: true },
  ),
);
