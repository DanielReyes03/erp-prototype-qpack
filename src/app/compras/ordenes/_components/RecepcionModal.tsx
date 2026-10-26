"use client";

import { useState } from "react";
import { Modal, Button, NumberField, Spinner, toast } from "@heroui/react";
import type { OrdenCompra } from "@/lib/seed/ordenes-compra";
import { useOrdenesCompraStore, type RecepcionLinea } from "@/lib/store/ordenes-compra";
import { formatMoney } from "@/lib/format";

interface RecepcionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orden: OrdenCompra;
}

export function RecepcionModal({ isOpen, onOpenChange, orden }: RecepcionModalProps) {
  const registrarRecepcion = useOrdenesCompraStore((s) => s.registrarRecepcion);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendientes = orden.lineas.filter((l) => l.cantidadRecibida < l.cantidad);

  async function handleSubmit() {
    const recepciones: RecepcionLinea[] = pendientes
      .map((l) => ({ lineaId: l.id, cantidad: cantidades[l.id] ?? 0 }))
      .filter((r) => r.cantidad > 0);

    if (recepciones.length === 0) {
      toast.danger("Ingresa al menos una cantidad a recibir");
      return;
    }

    setIsSubmitting(true);
    try {
      await registrarRecepcion(orden.id, recepciones);
      toast.success("Recepción registrada", { description: orden.id });
      setCantidades({});
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="md">
        <Modal.Dialog aria-label="Registrar recepción de mercadería">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Registrar recepción — {orden.id}</Modal.Heading>
            <p className="text-sm text-slate-500">
              Indica la cantidad recibida por línea. Puedes recibir parcialmente.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            {pendientes.length === 0 ? (
              <p className="text-sm text-slate-500">Todas las líneas ya fueron recibidas.</p>
            ) : (
              pendientes.map((linea) => {
                const pendiente = linea.cantidad - linea.cantidadRecibida;
                return (
                  <div
                    key={linea.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-900">{linea.nombre}</p>
                      <p className="font-data text-xs text-slate-500">
                        {linea.sku} · Pendiente: {pendiente.toLocaleString("en-US")} de{" "}
                        {linea.cantidad.toLocaleString("en-US")} · {formatMoney(linea.costoUnitario)}
                      </p>
                    </div>
                    <NumberField
                      aria-label={`Cantidad a recibir de ${linea.nombre}`}
                      className="w-32"
                      value={cantidades[linea.id] ?? 0}
                      minValue={0}
                      maxValue={pendiente}
                      onChange={(v) =>
                        setCantidades((prev) => ({ ...prev, [linea.id]: v ?? 0 }))
                      }
                    >
                      <NumberField.Group>
                        <NumberField.DecrementButton />
                        <NumberField.Input className="text-right" />
                        <NumberField.IncrementButton />
                      </NumberField.Group>
                    </NumberField>
                  </div>
                );
              })
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button isPending={isSubmitting} isDisabled={pendientes.length === 0} onPress={handleSubmit}>
              {isSubmitting ? <Spinner color="current" size="sm" /> : null}
              Confirmar recepción
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
