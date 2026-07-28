"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { rutas, distribuidores } from "@/lib/mock";
import type { Ruta } from "@/types";

export default function RutasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Ruta | null>(null);

  const columns: DataTableColumn<Ruta>[] = [
    { id: "nombre", header: "Ruta", cell: (r) => <span className="font-medium">{r.nombre}</span> },
    { id: "zona", header: "Zona", cell: (r) => r.zona },
    { id: "municipios", header: "Municipios", cell: (r) => r.municipios.join(", ") },
    { id: "distribuidor", header: "Distribuidor", cell: (r) => distribuidores.find((d) => d.id === r.distribuidorId)?.nombre ?? "-" },
    { id: "dias", header: "Dias de visita", cell: (r) => <div className="flex flex-wrap gap-1">{r.diasVisita.map((d) => <Badge key={d} variant="outline">{d}</Badge>)}</div> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rutas"
        description="Rutas de distribucion y sus dias de visita programados."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nueva ruta</Button>}
            title="Nueva ruta"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "zona", label: "Zona", required: true },
              { id: "distribuidorId", label: "Distribuidor", type: "select", options: distribuidores.map((d) => ({ label: d.nombre, value: d.id })) },
            ]}
          />
        }
      />

      <DataTable
        data={rutas}
        getRowId={(r) => r.id}
        loading={loading}
        searchPlaceholder="Buscar ruta..."
        searchFn={(r, q) => r.nombre.toLowerCase().includes(q) || r.zona.toLowerCase().includes(q)}
        filters={[{ id: "distribuidorId", label: "Distribuidor", options: distribuidores.map((d) => ({ label: d.nombre, value: d.id })) }]}
        columns={columns}
        onRowClick={(r) => setSelected(r)}
        exportFileName="rutas"
        rowActions={(r) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(r) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin rutas"
        emptyDescription="No hay rutas registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.zona}>
        {selected && (
          <DetailSection title="Detalle de la ruta">
            <DefinitionList
              items={[
                { label: "Municipios", value: selected.municipios.join(", "), full: true },
                { label: "Distribuidor", value: distribuidores.find((d) => d.id === selected.distribuidorId)?.nombre ?? "-" },
                { label: "Dias de visita", value: selected.diasVisita.join(", ") },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
