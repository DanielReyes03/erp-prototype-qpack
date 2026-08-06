import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import {
  CXP_DOCUMENTOS_SEED,
  PAGOS_PROVEEDOR_SEED,
  type CxpDocumento,
  type PagoProveedor,
  type AplicacionPagoProveedor,
} from "@/lib/seed/cxp";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface AplicarPagoInput {
  proveedorId: string;
  metodoPago: PagoProveedor["metodoPago"];
  aplicaciones: AplicacionPagoProveedor[];
}

interface CxpState {
  documentos: CxpDocumento[];
  pagos: PagoProveedor[];
  crearDocumento: (doc: Omit<CxpDocumento, "id">) => CxpDocumento;
  aplicarPago: (input: AplicarPagoInput) => Promise<PagoProveedor>;
}

export const useCxpStore = create<CxpState>()(
  persist(
    (set, get) => ({
      documentos: CXP_DOCUMENTOS_SEED,
      pagos: PAGOS_PROVEEDOR_SEED,

      crearDocumento(doc) {
        const nuevo: CxpDocumento = { ...doc, id: nextId("CXP") };
        set({ documentos: [nuevo, ...get().documentos] });
        return nuevo;
      },

      async aplicarPago(input) {
        await sleep();
        const montoTotal = round2(input.aplicaciones.reduce((s, a) => s + a.monto, 0));
        const pago: PagoProveedor = {
          id: nextId("PP"),
          proveedorId: input.proveedorId,
          fecha: new Date().toISOString(),
          montoTotal,
          metodoPago: input.metodoPago,
          aplicaciones: input.aplicaciones,
          createdAt: new Date().toISOString(),
        };

        const documentos = get().documentos.map((doc) => {
          const aplicacion = input.aplicaciones.find((a) => a.cxpId === doc.id);
          if (!aplicacion) return doc;
          return { ...doc, saldoPendiente: round2(doc.saldoPendiente - aplicacion.monto) };
        });

        set({ documentos, pagos: [pago, ...get().pagos] });
        return pago;
      },
    }),
    { name: "qpack-cxp" },
  ),
);
