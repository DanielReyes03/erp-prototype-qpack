"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatNumber } from "@/lib/format";
import { vehiculos, transportistas } from "@/lib/mock";
import type { Vehiculo } from "@/types";

const estadoOptions = ["Disponible", "En ruta", "Mantenimiento"].map((s) => ({ label: s, value: s }));

export default function VehiculosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Vehiculo | null>(null);

  const columns: DataTableColumn<Vehiculo>[] = [
    { id: "placa", header: "Placa", cell: (v) => <span className="font-medium">{v.placa}</span> },
    { id: "tipo", header: "Tipo", cell: (v) => v.tipo },
    { id: "transportista", header: "Transportista", cell: (v) => transportistas.find((t) => t.id === v.transportistaId)?.nombre ?? "-" },
    { id: "capacidad", header: "Capacidad", cell: (v) => `${formatNumber(v.capacidadKg)} kg`, className: "text-right" },
    { id: "estado", header: "Estado", cell: (v) => <StatusBadge status={v.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vehiculos"
        description="Flota vehicular asignada a los transportistas de la compania."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo vehiculo</Button>}
            title="Nuevo vehiculo"
            fields={[
              { id: "placa", label: "Placa", required: true },
              { id: "tipo", label: "Tipo", type: "select", options: ["Camion", "Cabezal", "Pickup", "Furgon"].map((t) => ({ label: t, value: t })) },
              { id: "transportistaId", label: "Transportista", type: "select", options: transportistas.map((t) => ({ label: t.nombre, value: t.id })) },
              { id: "capacidad", label: "Capacidad (kg)", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={vehiculos}
        getRowId={(v) => v.id}
        loading={loading}
        searchPlaceholder="Buscar por placa..."
        searchFn={(v, q) => v.placa.toLowerCase().includes(q)}
        filters={[
          { id: "tipo", label: "Tipo", options: ["Camion", "Cabezal", "Pickup", "Furgon"].map((t) => ({ label: t, value: t })) },
          { id: "transportistaId", label: "Transportista", options: transportistas.map((t) => ({ label: t.nombre, value: t.id })) },
        ]}
        getStatus={(v) => v.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(v) => setSelected(v)}
        exportFileName="vehiculos"
        rowActions={(v) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(v) },
              { label: "Enviar a mantenimiento", icon: Wrench, onSelect: () => toast.info("Vehiculo enviado a mantenimiento (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin vehiculos"
        emptyDescription="No hay vehiculos registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.placa} description={selected?.tipo}>
        {selected && (
          <DetailSection title="Detalle del vehiculo">
            <DefinitionList
              items={[
                { label: "Transportista", value: transportistas.find((t) => t.id === selected.transportistaId)?.nombre ?? "-" },
                { label: "Capacidad", value: `${formatNumber(selected.capacidadKg)} kg` },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
