"use client";

import { Modal, Button } from "@heroui/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDateTime } from "@/lib/format";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import type { CuentaBancaria } from "@/lib/seed/tesoreria";

interface CuentaDetalleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cuenta?: CuentaBancaria;
}

const TIPO_LABEL: Record<string, string> = {
  deposito: "Depósito",
  cheque: "Cheque emitido",
  "transferencia-entrada": "Transferencia recibida",
  "transferencia-salida": "Transferencia enviada",
};

function esEntrada(tipo: string) {
  return tipo === "deposito" || tipo === "transferencia-entrada";
}

export function CuentaDetalleModal({ isOpen, onOpenChange, cuenta }: CuentaDetalleModalProps) {
  const movimientos = useTesoreriaStore((s) => s.movimientos);
  const propios = cuenta
    ? movimientos.filter((m) => m.cuentaId === cuenta.id).slice(0, 30)
    : [];

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog aria-label="Detalle de cuenta bancaria" className="sm:max-w-[720px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{cuenta?.nombre}</Modal.Heading>
            <p className="text-sm text-slate-500">
              {cuenta?.banco} · {cuenta?.numeroCuenta} · Saldo actual:{" "}
              {cuenta ? <MoneyCell amount={cuenta.saldo} currency={cuenta.moneda} inline /> : "—"}
            </p>
          </Modal.Header>
          <Modal.Body>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="h-9 bg-navy-900 text-left text-[11px] font-medium tracking-wide text-white/90 uppercase">
                    <th className="px-3">Fecha</th>
                    <th className="px-3">Movimiento</th>
                    <th className="px-3">Descripción</th>
                    <th className="px-3 text-right">Monto</th>
                    <th className="px-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {propios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                        Sin movimientos registrados.
                      </td>
                    </tr>
                  ) : (
                    propios.map((m) => (
                      <tr key={m.id} className="h-10 border-b border-slate-200 last:border-0">
                        <td className="font-data px-3 text-xs">{formatDateTime(m.fecha)}</td>
                        <td className="px-3">
                          <div className="flex items-center gap-1.5">
                            {esEntrada(m.tipo) ? (
                              <ArrowDownRight className="size-3.5 text-[#059669]" />
                            ) : (
                              <ArrowUpRight className="size-3.5 text-[#DC2626]" />
                            )}
                            {TIPO_LABEL[m.tipo]}
                          </div>
                        </td>
                        <td className="px-3 text-slate-700">{m.descripcion}</td>
                        <td className="px-3 text-right">
                          <span className={esEntrada(m.tipo) ? "text-[#059669]" : "text-[#DC2626]"}>
                            <MoneyCell
                              amount={esEntrada(m.tipo) ? m.monto : -m.monto}
                              currency={cuenta?.moneda}
                              inline
                            />
                          </span>
                        </td>
                        <td className="px-3 text-right">
                          <MoneyCell amount={m.saldoResultante} currency={cuenta?.moneda} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
