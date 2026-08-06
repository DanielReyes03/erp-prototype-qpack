import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import { DTE_SEED_ALL, fakeUuid, type Dte, type TipoDte } from "@/lib/seed/dte";
import type { OrdenVentaLinea } from "@/lib/seed/ordenes-venta";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useCxcStore } from "@/lib/store/cxc";

export interface EmitirDteInput {
  tipo: TipoDte;
  clienteId: string;
  lineas: OrdenVentaLinea[];
  ordenVentaId?: string;
  dteRelacionadoId?: string;
  moneda: "GTQ" | "USD";
}

let numeroCounter = DTE_SEED_ALL.reduce((max, d) => Math.max(max, Number(d.numero)), 1000);
function nextNumero(): string {
  numeroCounter += 1;
  return String(numeroCounter).padStart(8, "0");
}
let dteCounter = DTE_SEED_ALL.length;
function nextDteId(): string {
  dteCounter += 1;
  return `DTE-${String(dteCounter).padStart(6, "0")}`;
}

interface DteState {
  documentos: Dte[];
  emitir: (input: EmitirDteInput) => Promise<Dte>;
  anular: (id: string, motivo: string) => Promise<void>;
}

export const useDteStore = create<DteState>()(
  persist(
    (set, get) => ({
      documentos: DTE_SEED_ALL,

      async emitir(input) {
        await sleep(400, 900);

        const dte: Dte = {
          id: nextDteId(),
          tipo: input.tipo,
          serie: "A",
          numero: nextNumero(),
          uuid: fakeUuid(),
          fechaCertificacion: new Date().toISOString(),
          estado: "certificado",
          clienteId: input.clienteId,
          ordenVentaId: input.ordenVentaId,
          dteRelacionadoId: input.dteRelacionadoId,
          lineas: input.lineas,
          moneda: input.moneda,
          createdAt: new Date().toISOString(),
        };

        set({ documentos: [dte, ...get().documentos] });

        if (input.ordenVentaId) {
          useOrdenesVentaStore.getState().marcarFacturado(input.ordenVentaId, dte.id);
        }

        if (input.tipo === "FACT") {
          const cliente = CLIENTES_SEED.find((c) => c.id === input.clienteId);
          const total = computeTotals(input.lineas).total;
          const fecha = new Date();
          const venc = new Date(fecha);
          venc.setDate(venc.getDate() + (cliente?.diasCredito ?? 15));
          useCxcStore.getState().crearDocumento({
            clienteId: input.clienteId,
            dteId: dte.id,
            fecha: fecha.toISOString(),
            fechaVencimiento: venc.toISOString(),
            montoOriginal: total,
            saldoPendiente: total,
            moneda: input.moneda,
          });
        } else if (input.tipo === "NCRE" && input.dteRelacionadoId) {
          // La nota de crédito reduce el saldo pendiente del documento de CxC original.
          const monto = computeTotals(input.lineas).total;
          const docs = useCxcStore.getState().documentos;
          const original = docs.find((d) => d.dteId === input.dteRelacionadoId);
          if (original) {
            useCxcStore.setState({
              documentos: docs.map((d) =>
                d.dteId === input.dteRelacionadoId
                  ? { ...d, saldoPendiente: Math.max(0, d.saldoPendiente - monto) }
                  : d,
              ),
            });
          }
        }

        return dte;
      },

      async anular(id, motivo) {
        await sleep();
        const dte = get().documentos.find((d) => d.id === id);
        set({
          documentos: get().documentos.map((d) =>
            d.id === id
              ? { ...d, estado: "anulado", motivoAnulacion: motivo, fechaAnulacion: new Date().toISOString() }
              : d,
          ),
        });
        if (dte?.tipo === "FACT") {
          useCxcStore.getState().anularDocumento(id);
        }
      },
    }),
    { name: "qpack-dte" },
  ),
);
