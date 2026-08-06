"use client";

import { useState } from "react";
import { Modal, Button } from "@heroui/react";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDate } from "@/lib/format";
import { useCxcStore, bucketDe } from "@/lib/store/cxc";
import { AplicarPagoModal } from "./AplicarPagoModal";
import type { Cliente } from "@/lib/seed/clientes";

interface EstadoCuentaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
}

export function EstadoCuentaModal({ isOpen, onOpenChange, cliente }: EstadoCuentaModalProps) {
  const documentos = useCxcStore((s) => s.documentos);
  const [pagoOpen, setPagoOpen] = useState(false);

  const docsCliente = cliente
    ? documentos.filter((d) => d.clienteId === cliente.id).sort((a, b) => a.fecha.localeCompare(b.fecha))
    : [];
  const saldoTotal = docsCliente.reduce((s, d) => s + d.saldoPendiente, 0);

  return (
    <>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog aria-label="Estado de cuenta" className="sm:max-w-[720px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Estado de cuenta — {cliente?.nombreComercial}</Modal.Heading>
              <p className="text-sm text-slate-500">
                Límite de crédito: {cliente ? <MoneyCell amount={cliente.limiteCredito} inline /> : "—"} ·{" "}
                {cliente?.diasCredito} días de crédito
              </p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="h-9 border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                      <th className="px-3">Documento</th>
                      <th className="px-3">Fecha</th>
                      <th className="px-3">Vencimiento</th>
                      <th className="px-3">Antigüedad</th>
                      <th className="px-3 text-right">Original</th>
                      <th className="px-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsCliente.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                          Sin documentos de cuentas por cobrar.
                        </td>
                      </tr>
                    ) : (
                      docsCliente.map((d) => (
                        <tr key={d.id} className="h-10 border-b border-slate-200 last:border-0">
                          <td className="font-data px-3">{d.dteId}</td>
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
                            <MoneyCell amount={d.saldoPendiente} currency={d.moneda} colorizeNegative={false} />
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
                Aplicar pago
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {cliente ? (
        <AplicarPagoModal
          isOpen={pagoOpen}
          onOpenChange={setPagoOpen}
          clienteId={cliente.id}
          documentos={docsCliente}
        />
      ) : null}
    </>
  );
}
