"use client";

import { useState } from "react";
import { Modal, Button } from "@heroui/react";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDate } from "@/lib/format";
import { useCxpStore } from "@/lib/store/cxp";
import { bucketDe } from "@/lib/store/cxc";
import { AplicarPagoProveedorModal } from "./AplicarPagoProveedorModal";
import type { Proveedor } from "@/lib/seed/proveedores";

interface EstadoCuentaProveedorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor?: Proveedor;
}

export function EstadoCuentaProveedorModal({
  isOpen,
  onOpenChange,
  proveedor,
}: EstadoCuentaProveedorModalProps) {
  const documentos = useCxpStore((s) => s.documentos);
  const [pagoOpen, setPagoOpen] = useState(false);

  const docs = proveedor
    ? documentos.filter((d) => d.proveedorId === proveedor.id).sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];
  const saldoTotal = docs.reduce((s, d) => s + d.saldoPendiente, 0);

  return (
    <>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog aria-label="Estado de cuenta de proveedor" className="sm:max-w-[720px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Estado de cuenta — {proveedor?.nombreComercial}</Modal.Heading>
              <p className="text-sm text-slate-500">{proveedor?.diasCredito} días de crédito</p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="h-9 bg-navy-900 text-left text-[11px] font-medium tracking-wide text-white/90 uppercase">
                      <th className="px-3">Factura</th>
                      <th className="px-3">Fecha</th>
                      <th className="px-3">Vencimiento</th>
                      <th className="px-3">Estado</th>
                      <th className="px-3 text-right">Original</th>
                      <th className="px-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                          Sin documentos de cuentas por pagar.
                        </td>
                      </tr>
                    ) : (
                      docs.map((d) => (
                        <tr key={d.id} className="h-10 border-b border-slate-200 last:border-0">
                          <td className="font-data px-3">{d.facturaId}</td>
                          <td className="font-data px-3 text-xs">{formatDate(d.fecha)}</td>
                          <td className="font-data px-3 text-xs">{formatDate(d.fechaVencimiento)}</td>
                          <td className="px-3">
                            {d.saldoPendiente > 0 ? (
                              <StatusChip
                                status={
                                  bucketDe(d.fechaVencimiento) === "corriente" ? "cxc:corriente" : "cxc:vencida"
                                }
                              />
                            ) : (
                              <StatusChip status="cxc:pagada" />
                            )}
                          </td>
                          <td className="px-3 text-right">
                            <MoneyCell amount={d.montoOriginal} currency={d.moneda} />
                          </td>
                          <td className="px-3 text-right">
                            <MoneyCell amount={d.saldoPendiente} currency={d.moneda} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Saldo pendiente total</p>
                  <p className="font-data text-lg font-semibold text-blue-700">
                    <MoneyCell amount={saldoTotal} inline />
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button isDisabled={saldoTotal <= 0} onPress={() => setPagoOpen(true)}>
                Programar pago
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {proveedor ? (
        <AplicarPagoProveedorModal
          isOpen={pagoOpen}
          onOpenChange={setPagoOpen}
          proveedorId={proveedor.id}
          documentos={docs}
        />
      ) : null}
    </>
  );
}
