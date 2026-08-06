import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import {
  CXC_DOCUMENTOS_SEED,
  PAGOS_CLIENTE_SEED,
  type CxcDocumento,
  type PagoCliente,
  type AplicacionPagoCliente,
} from "@/lib/seed/cxc";

const HOY = new Date(2026, 7, 5);

export type BucketAntiguedad = "corriente" | "1-30" | "31-60" | "61-90" | "+90";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function diasVencido(fechaVencimiento: string): number {
  const venc = new Date(fechaVencimiento);
  const diffMs = HOY.getTime() - venc.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function bucketDe(fechaVencimiento: string): BucketAntiguedad {
  const dias = diasVencido(fechaVencimiento);
  if (dias <= 0) return "corriente";
  if (dias <= 30) return "1-30";
  if (dias <= 60) return "31-60";
  if (dias <= 90) return "61-90";
  return "+90";
}

interface AplicarPagoInput {
  clienteId: string;
  metodoPago: PagoCliente["metodoPago"];
  aplicaciones: AplicacionPagoCliente[];
}

interface CxcState {
  documentos: CxcDocumento[];
  pagos: PagoCliente[];
  crearDocumento: (doc: Omit<CxcDocumento, "id">) => CxcDocumento;
  anularDocumento: (dteId: string) => void;
  aplicarPago: (input: AplicarPagoInput) => Promise<PagoCliente>;
}

export const useCxcStore = create<CxcState>()(
  persist(
    (set, get) => ({
      documentos: CXC_DOCUMENTOS_SEED,
      pagos: PAGOS_CLIENTE_SEED,

      crearDocumento(doc) {
        const nuevo: CxcDocumento = { ...doc, id: nextId("CXC") };
        set({ documentos: [nuevo, ...get().documentos] });
        return nuevo;
      },

      anularDocumento(dteId) {
        set({
          documentos: get().documentos.map((d) =>
            d.dteId === dteId ? { ...d, saldoPendiente: 0 } : d,
          ),
        });
      },

      async aplicarPago(input) {
        await sleep();
        const montoTotal = round2(input.aplicaciones.reduce((s, a) => s + a.monto, 0));
        const pago: PagoCliente = {
          id: nextId("PC"),
          clienteId: input.clienteId,
          fecha: new Date().toISOString(),
          montoTotal,
          metodoPago: input.metodoPago,
          aplicaciones: input.aplicaciones,
          createdAt: new Date().toISOString(),
        };

        const documentos = get().documentos.map((doc) => {
          const aplicacion = input.aplicaciones.find((a) => a.cxcId === doc.id);
          if (!aplicacion) return doc;
          return { ...doc, saldoPendiente: round2(doc.saldoPendiente - aplicacion.monto) };
        });

        set({ documentos, pagos: [pago, ...get().pagos] });
        return pago;
      },
    }),
    { name: "qpack-cxc" },
  ),
);
