import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import { CATALOGO_CUENTAS, type CuentaContable } from "@/lib/seed/catalogo-cuentas";
import { POLIZAS_SEED, type Poliza, type PartidaLinea, type TipoPoliza } from "@/lib/seed/polizas";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface RegistrarPolizaInput {
  tipo: TipoPoliza;
  fecha?: string;
  concepto: string;
  origen?: string;
  lineas: Omit<PartidaLinea, "id">[];
}

interface ContabilidadState {
  cuentas: CuentaContable[];
  polizas: Poliza[];
  registrarPoliza: (input: RegistrarPolizaInput) => Poliza;
  crearAsientoManual: (input: RegistrarPolizaInput) => Promise<Poliza>;
  getPolizasPorOrigen: (origen: string) => Poliza[];
}

let numeroCounter = POLIZAS_SEED.length;
function nextNumero(): string {
  numeroCounter += 1;
  return String(numeroCounter).padStart(6, "0");
}

export const useContabilidadStore = create<ContabilidadState>()(
  persist(
    (set, get) => ({
      cuentas: CATALOGO_CUENTAS,
      polizas: POLIZAS_SEED,

      registrarPoliza(input) {
        const debe = round2(input.lineas.reduce((s, l) => s + l.debe, 0));
        const haber = round2(input.lineas.reduce((s, l) => s + l.haber, 0));
        if (Math.abs(debe - haber) > 0.01) {
          throw new Error(
            `La póliza no cuadra: Debe Q${debe.toFixed(2)} vs. Haber Q${haber.toFixed(2)}`,
          );
        }
        const poliza: Poliza = {
          id: nextId("POL"),
          numero: nextNumero(),
          tipo: input.tipo,
          fecha: input.fecha ?? new Date().toISOString(),
          concepto: input.concepto,
          origen: input.origen,
          createdAt: new Date().toISOString(),
          lineas: input.lineas.map((l, i) => ({ ...l, id: `l${i}` })),
        };
        set({ polizas: [...get().polizas, poliza] });
        return poliza;
      },

      async crearAsientoManual(input) {
        await sleep();
        return get().registrarPoliza({ ...input, tipo: "manual" });
      },

      getPolizasPorOrigen(origen) {
        return get().polizas.filter((p) => p.origen === origen);
      },
    }),
    { name: "qpack-contabilidad", skipHydration: true },
  ),
);
