"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { transportistas } from "@/lib/mock";
import type { Transportista } from "@/types";

export default function TransportistasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Transportista | null>(null);

  const columns: DataTableColumn<Transportista>[] = [
    { id: "nombre", header: "Transportista", cell: (t) => <span className="font-medium">{t.nombre}</span> },
    { id: "nit", header: "NIT", cell: (t) => t.nit },
    { id: "tipo", header: "Tipo", cell: (t) => <Badge variant="outline">{t.tipo}</Badge> },
    { id: "vehiculos", header: "Vehiculos", cell: (t) => t.vehiculosAsignados, className: "text-right" },
    { id: "calificacion", header: "Calificacion", cell: (t) => `${t.calificacion.toFixed(1)} / 5` },
    { id: "estado", header: "Estado", cell: (t) => <StatusBadge status={t.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transportistas"
        description="Empresas de transporte local e internacional."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo transportista</Button>}
            title="Nuevo transportista"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "nit", label: "NIT", required: true },
              { id: "tipo", label: "Tipo", type: "select", options: [{ label: "Local", value: "Local" }, { label: "Internacional", value: "Internacional" }] },
              { id: "telefono", label: "Telefono" },
            ]}
          />
        }
      />

      <DataTable
        data={transportistas}
        getRowId={(t) => t.id}
        loading={loading}
        searchPlaceholder="Buscar transportista..."
        searchFn={(t, q) => t.nombre.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: [{ label: "Local", value: "Local" }, { label: "Internacional", value: "Internacional" }] }]}
        getStatus={(t) => (t.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(t) => setSelected(t)}
        exportFileName="transportistas"
        rowActions={(t) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(t) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
              { label: t.activo ? "Desactivar" : "Activar", icon: t.activo ? Ban : CheckCircle2, destructive: t.activo, onSelect: () => toast.success("Estado actualizado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin transportistas"
        emptyDescription="No hay transportistas registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.nit}>
        {selected && (
          <DetailSection title="Detalle del transportista">
            <DefinitionList
              items={[
                { label: "Tipo", value: selected.tipo },
                { label: "Telefono", value: selected.telefono },
                { label: "Vehiculos asignados", value: String(selected.vehiculosAsignados) },
                { label: "Calificacion", value: `${selected.calificacion.toFixed(1)} / 5` },
                { label: "Estado", value: <StatusBadge status={selected.activo ? "Activo" : "Inactivo"} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
