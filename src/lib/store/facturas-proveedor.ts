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
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";

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
    { name: "qpack-facturas-proveedor" },
  ),
);
