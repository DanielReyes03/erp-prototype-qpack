import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep } from "@/lib/async";
import { DTE_SEED_ALL, fakeUuid, type Dte, type TipoDte } from "@/lib/seed/dte";
import type { OrdenVentaLinea } from "@/lib/seed/ordenes-venta";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useCxcStore } from "@/lib/store/cxc";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

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
          const totales = computeTotals(input.lineas);
          const fecha = new Date();
          const venc = new Date(fecha);
          venc.setDate(venc.getDate() + (cliente?.diasCredito ?? 15));
          useCxcStore.getState().crearDocumento({
            clienteId: input.clienteId,
            dteId: dte.id,
            fecha: fecha.toISOString(),
            fechaVencimiento: venc.toISOString(),
            montoOriginal: totales.total,
            saldoPendiente: totales.total,
            moneda: input.moneda,
          });

          const { registrarPoliza } = useContabilidadStore.getState();
          registrarPoliza({
            tipo: "venta",
            fecha: dte.fechaCertificacion,
            concepto: `Venta según factura ${dte.serie}-${dte.numero}`,
            origen: dte.id,
            lineas: [
              { cuentaCodigo: "1.1.04", descripcion: "Clientes Nacionales", debe: totales.total, haber: 0 },
              { cuentaCodigo: "4.1.01", descripcion: "Ventas Locales", debe: 0, haber: totales.baseGravable },
              { cuentaCodigo: "2.1.03", descripcion: "IVA Débito Fiscal", debe: 0, haber: totales.iva },
            ],
          });

          const costo = round2(
            input.lineas.reduce((sum, l) => {
              const producto = PRODUCTOS_SEED.find((p) => p.id === l.productoId);
              return sum + (producto?.costo ?? 0) * l.cantidad;
            }, 0),
          );
          if (costo > 0) {
            registrarPoliza({
              tipo: "venta",
              fecha: dte.fechaCertificacion,
              concepto: `Costo de venta según factura ${dte.serie}-${dte.numero}`,
              origen: dte.id,
              lineas: [
                { cuentaCodigo: "5.1.01", descripcion: "Costo de Mercadería Vendida", debe: costo, haber: 0 },
                { cuentaCodigo: "1.1.06", descripcion: "Inventario de Mercadería", debe: 0, haber: costo },
              ],
            });
          }
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
    { name: "qpack-dte", skipHydration: true },
  ),
);
