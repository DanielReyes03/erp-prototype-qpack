"use client";

import { useMemo, useState } from "react";
import { Modal, Button, NumberField, Select, ListBox, Label, Spinner, toast } from "@heroui/react";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { useCxcStore } from "@/lib/store/cxc";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import type { CxcDocumento } from "@/lib/seed/cxc";

interface AplicarPagoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  documentos: CxcDocumento[];
}

const METODOS = ["Efectivo", "Transferencia", "Cheque", "Tarjeta"] as const;

export function AplicarPagoModal({ isOpen, onOpenChange, clienteId, documentos }: AplicarPagoModalProps) {
  const aplicarPago = useCxcStore((s) => s.aplicarPago);
  const cuentas = useTesoreriaStore((s) => s.cuentas);
  const depositarEnCuenta = useTesoreriaStore((s) => s.depositarEnCuenta);
  const [montos, setMontos] = useState<Record<string, number>>({});
  const [metodo, setMetodo] = useState<(typeof METODOS)[number]>("Transferencia");
  const [cuentaId, setCuentaId] = useState<string | null>(cuentas[0]?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendientes = documentos.filter((d) => d.saldoPendiente > 0);
  const totalAplicado = useMemo(
    () => Object.values(montos).reduce((s, v) => s + (v || 0), 0),
    [montos],
  );
  const requiereCuenta = metodo === "Transferencia" || metodo === "Cheque";

  async function handleSubmit() {
    const aplicaciones = pendientes
      .map((d) => ({ cxcId: d.id, monto: montos[d.id] ?? 0 }))
      .filter((a) => a.monto > 0);

    if (aplicaciones.length === 0) {
      toast.danger("Ingresá al menos un monto a aplicar");
      return;
    }

    setIsSubmitting(true);
    try {
      const pago = await aplicarPago({ clienteId, metodoPago: metodo, aplicaciones });
      if (requiereCuenta && cuentaId) {
        depositarEnCuenta(cuentaId, pago.montoTotal, "Cobro a cliente (CxC)", pago.id);
      }
      toast.success("Pago aplicado", { description: `Total ${aplicaciones.length} documento(s)` });
      setMontos({});
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="md">
        <Modal.Dialog aria-label="Aplicar pago">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Aplicar pago</Modal.Heading>
            <p className="text-sm text-slate-500">
              Distribuí el pago entre uno o varios documentos pendientes. Se permiten abonos parciales.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <Select
              className="flex flex-col gap-1"
              value={metodo}
              onChange={(k) => k && setMetodo(String(k) as (typeof METODOS)[number])}
            >
              <Label>Método de pago</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {METODOS.map((m) => (
                    <ListBox.Item key={m} id={m} textValue={m}>
                      {m}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            {requiereCuenta ? (
              <Select
                className="flex flex-col gap-1"
                placeholder="Seleccionar cuenta"
                value={cuentaId}
                onChange={(k) => setCuentaId(k ? String(k) : null)}
              >
                <Label>Depositar en cuenta</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {cuentas.map((c) => (
                      <ListBox.Item key={c.id} id={c.id} textValue={c.nombre}>
                        {c.nombre} · {c.moneda}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            ) : null}

            {pendientes.length === 0 ? (
              <p className="text-sm text-slate-500">Este cliente no tiene documentos pendientes.</p>
            ) : (
              pendientes.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3"
                >
                  <div>
                    <p className="font-data text-sm text-slate-900">{doc.dteId}</p>
                    <p className="text-xs text-slate-500">
                      Vence {formatDate(doc.fechaVencimiento)} · Saldo{" "}
                      <MoneyCell amount={doc.saldoPendiente} currency={doc.moneda} inline />
                    </p>
                  </div>
                  <NumberField
                    aria-label={`Monto a aplicar a ${doc.dteId}`}
                    className="w-32"
                    value={montos[doc.id] ?? 0}
                    minValue={0}
                    maxValue={doc.saldoPendiente}
                    formatOptions={{ minimumFractionDigits: 2 }}
                    onChange={(v) => setMontos((prev) => ({ ...prev, [doc.id]: v ?? 0 }))}
                  >
                    <NumberField.Group>
                      <NumberField.Input className="col-span-3 text-right" />
                    </NumberField.Group>
                  </NumberField>
                </div>
              ))
            )}

            {pendientes.length > 0 ? (
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-medium">
                <span>Total a aplicar</span>
                <MoneyCell amount={totalAplicado} />
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              isPending={isSubmitting}
              isDisabled={pendientes.length === 0 || totalAplicado <= 0}
              onPress={handleSubmit}
            >
              {isSubmitting ? <Spinner color="current" size="sm" /> : null}
              Aplicar pago
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
