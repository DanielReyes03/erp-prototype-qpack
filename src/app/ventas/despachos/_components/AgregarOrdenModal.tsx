"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Modal, Button, toast } from "@heroui/react";
import { EmptyState } from "@/components/patterns/EmptyState";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { formatDate } from "@/lib/format";
import { useRutasStore } from "@/lib/store/rutas";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { clienteDe } from "../../ordenes/_components/ov-helpers";

interface AgregarOrdenModalProps {
  rutaId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function AgregarOrdenModal({ rutaId, onOpenChange }: AgregarOrdenModalProps) {
  const rutas = useRutasStore((s) => s.rutas);
  const agregarOrden = useRutasStore((s) => s.agregarOrden);
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const disponibles = useMemo(() => {
    const asignadas = new Set(rutas.flatMap((r) => r.ordenIds));
    // Solo órdenes facturadas (inventario ya descargado) que no estén en otra ruta.
    return ordenes.filter((o) => o.estado === "facturado" && !asignadas.has(o.id));
  }, [rutas, ordenes]);

  async function handleAdd(ordenId: string) {
    if (!rutaId) return;
    setPendingId(ordenId);
    try {
      await agregarOrden(rutaId, ordenId);
      toast.success("Orden agregada a la ruta", { description: ordenId });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Modal.Backdrop isOpen={!!rutaId} onOpenChange={(open) => !open && onOpenChange(false)}>
      <Modal.Container size="lg">
        <Modal.Dialog aria-label="Agregar órdenes a la ruta">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Agregar órdenes a la ruta</Modal.Heading>
            <p className="text-sm text-slate-500">
              Órdenes confirmadas o despachadas que aún no están en ninguna ruta.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-2">
            {disponibles.length === 0 ? (
              <EmptyState
                title="Sin órdenes disponibles"
                description="No hay órdenes confirmadas o despachadas libres para asignar."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {disponibles.map((o) => {
                  const cliente = clienteDe(o.clienteId);
                  return (
                    <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-data text-sm font-medium text-blue-700">{o.id}</span>
                          <StatusChip status={`ov:${o.estado}`} />
                        </div>
                        <p className="truncate text-sm text-slate-900">{cliente?.nombreComercial}</p>
                        <p className="text-xs text-slate-500">{formatDate(o.fecha)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <MoneyCell amount={computeTotals(o.lineas).total} currency={o.moneda} />
                        <Button
                          size="sm"
                          variant="secondary"
                          isPending={pendingId === o.id}
                          onPress={() => handleAdd(o.id)}
                        >
                          <Plus className="size-3.5" />
                          Agregar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onPress={() => onOpenChange(false)}>
              Listo
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
