import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sleep, nextId } from "@/lib/async";
import {
  FACTURAS_PROVEEDOR_SEED,
  NOTAS_CREDITO_PROVEEDOR_SEED,
  type FacturaProveedor,
  type NotaCreditoProveedor,
} from "@/lib/seed/facturas-proveedor";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { useCxpStore } from "@/lib/store/cxp";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface FacturaProveedorInput {
  proveedorId: string;
  ordenCompraId?: string;
  numeroFactura: string;
  monto: number;
  moneda: "GTQ" | "USD";
}

export interface NotaCreditoInput {
  facturaId: string;
  motivo: string;
  monto: number;
}

interface FacturasProveedorState {
  facturas: FacturaProveedor[];
  notasCredito: NotaCreditoProveedor[];
  crearFactura: (input: FacturaProveedorInput) => Promise<FacturaProveedor>;
  crearNotaCredito: (input: NotaCreditoInput) => Promise<NotaCreditoProveedor>;
}

export const useFacturasProveedorStore = create<FacturasProveedorState>()(
  persist(
    (set, get) => ({
      facturas: FACTURAS_PROVEEDOR_SEED,
      notasCredito: NOTAS_CREDITO_PROVEEDOR_SEED,

      async crearFactura(input) {
        await sleep();
        const factura: FacturaProveedor = {
          id: nextId("FP"),
          ...input,
          fecha: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set({ facturas: [factura, ...get().facturas] });
        if (input.ordenCompraId) {
          await useOrdenesCompraStore.getState().marcarFacturada(input.ordenCompraId);
        }

        const proveedor = PROVEEDORES_SEED.find((p) => p.id === input.proveedorId);
        const fecha = new Date();
        const venc = new Date(fecha);
        venc.setDate(venc.getDate() + (proveedor?.diasCredito ?? 15));
        useCxpStore.getState().crearDocumento({
          proveedorId: input.proveedorId,
          facturaId: factura.id,
          fecha: fecha.toISOString(),
          fechaVencimiento: venc.toISOString(),
          montoOriginal: input.monto,
          saldoPendiente: input.monto,
          moneda: input.moneda,
        });

        const base = round2(input.monto / 1.12);
        const iva = round2(input.monto - base);
        useContabilidadStore.getState().registrarPoliza({
          tipo: "compra",
          concepto: `Compra según factura ${input.numeroFactura}`,
          origen: factura.id,
          lineas: [
            { cuentaCodigo: "1.1.06", descripcion: "Inventario de Mercadería", debe: base, haber: 0 },
            { cuentaCodigo: "1.1.07", descripcion: "IVA Crédito Fiscal", debe: iva, haber: 0 },
            { cuentaCodigo: "2.1.01", descripcion: "Proveedores Locales", debe: 0, haber: input.monto },
          ],
        });

        return factura;
      },

      async crearNotaCredito(input) {
        await sleep();
        const factura = get().facturas.find((f) => f.id === input.facturaId);
        if (!factura) throw new Error("Factura no encontrada");
        const nota: NotaCreditoProveedor = {
          id: nextId("NCP"),
          facturaId: input.facturaId,
          proveedorId: factura.proveedorId,
          fecha: new Date().toISOString(),
          motivo: input.motivo,
          monto: input.monto,
          createdAt: new Date().toISOString(),
        };
        set({ notasCredito: [nota, ...get().notasCredito] });
        return nota;
      },
    }),
    { name: "qpack-facturas-proveedor", skipHydration: true },
  ),
);
