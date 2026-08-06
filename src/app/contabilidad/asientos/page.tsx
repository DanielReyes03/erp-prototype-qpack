"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Modal } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { PolizaCard } from "@/components/patterns/PolizaCard";
import { formatDate } from "@/lib/format";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import type { Poliza } from "@/lib/seed/polizas";

export default function AsientosManualesPage() {
  const router = useRouter();
  const polizas = useContabilidadStore((s) => s.polizas);
  const [polizaVista, setPolizaVista] = useState<Poliza | undefined>(undefined);

  const asientos = useMemo(() => polizas.filter((p) => p.tipo === "manual"), [polizas]);

  const columns: DataTableColumn<Poliza>[] = [
    { key: "numero", header: "Póliza", cell: (p) => <span className="font-data font-medium text-blue-700">{p.numero}</span> },
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (p) => p.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (p) => <span className="font-data">{formatDate(p.fecha)}</span>,
    },
    { key: "concepto", header: "Concepto", cell: (p) => p.concepto },
    { key: "lineas", header: "Líneas", align: "right", cell: (p) => p.lineas.length },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (p) => <MoneyCell amount={p.lineas.reduce((s, l) => s + l.debe, 0)} className="font-semibold text-slate-900" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Asientos manuales"
        description="Pólizas contables registradas manualmente, con validación de cuadre"
        actions={
          <Button onPress={() => router.push("/contabilidad/asientos/nueva")}>
            <Plus className="size-4" />
            Nuevo asiento
          </Button>
        }
      />

      <DataTable
        ariaLabel="Asientos manuales"
        columns={columns}
        rows={asientos}
        getRowId={(p) => p.id}
        emptyTitle="Sin asientos manuales"
        emptyDescription="Registrá tu primer asiento manual con el botón «Nuevo asiento»."
        onRowClick={(p) => setPolizaVista(p)}
      />

      <Modal.Backdrop isOpen={!!polizaVista} onOpenChange={(open) => !open && setPolizaVista(undefined)}>
        <Modal.Container size="md">
          <Modal.Dialog aria-label="Detalle del asiento manual">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Póliza — {polizaVista?.numero}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{polizaVista ? <PolizaCard poliza={polizaVista} /> : null}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
