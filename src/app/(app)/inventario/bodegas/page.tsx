"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { bodegas, ubicaciones } from "@/lib/mock";
import type { Bodega } from "@/types";

export default function BodegasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Bodega | null>(null);

  const columns: DataTableColumn<Bodega>[] = [
    { id: "codigo", header: "Codigo", cell: (b) => <span className="font-medium">{b.codigo}</span> },
    { id: "nombre", header: "Nombre", cell: (b) => b.nombre },
    { id: "tipo", header: "Tipo", cell: (b) => b.tipo },
    { id: "municipio", header: "Municipio", cell: (b) => b.municipio },
    { id: "responsable", header: "Responsable", cell: (b) => b.responsable },
    { id: "ubicaciones", header: "Ubicaciones", cell: (b) => b.ubicaciones, className: "text-right" },
    { id: "estado", header: "Estado", cell: (b) => <StatusBadge status={b.activa ? "Activa" : "Inactiva"} /> },
  ];

  const ubicacionesSeleccionadas = selected ? ubicaciones.filter((u) => u.bodegaId === selected.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bodegas y ubicaciones"
        description="Centros de almacenamiento y su distribucion de espacios."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva bodega
              </Button>
            }
            title="Nueva bodega"
            fields={[
              { id: "codigo", label: "Codigo", required: true, placeholder: "BOD-06" },
              { id: "nombre", label: "Nombre", required: true, placeholder: "Bodega Regional Peten" },
              { id: "tipo", label: "Tipo", type: "select", required: true, options: ["Central", "Regional", "Transito", "Consignacion"].map((t) => ({ label: t, value: t })) },
              { id: "municipio", label: "Municipio", required: true, placeholder: "Flores" },
              { id: "responsable", label: "Responsable", placeholder: "Nombre del encargado" },
            ]}
          />
        }
      />

      <DataTable
        data={bodegas}
        getRowId={(b) => b.id}
        loading={loading}
        searchPlaceholder="Buscar bodega..."
        searchFn={(b, q) => b.nombre.toLowerCase().includes(q) || b.codigo.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: ["Central", "Regional", "Transito", "Consignacion"].map((t) => ({ label: t, value: t })) }]}
        columns={columns}
        onRowClick={(b) => setSelected(b)}
        exportFileName="bodegas"
        rowActions={(b) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(b) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de bodega simulada") },
            ]}
          />
        )}
        emptyTitle="Sin bodegas"
        emptyDescription="No hay bodegas registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.codigo}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Tipo", value: selected.tipo },
                  { label: "Municipio", value: selected.municipio },
                  { label: "Responsable", value: selected.responsable },
                  { label: "Estado", value: <StatusBadge status={selected.activa ? "Activa" : "Inactiva"} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Ubicaciones y ocupacion">
              <div className="divide-y">
                {ubicacionesSeleccionadas.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3.5 text-sm">
                    <span className="w-24 shrink-0 font-medium">{u.codigo}</span>
                    <Progress value={u.ocupacionPct} className="h-1.5 flex-1" />
                    <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{u.ocupacionPct}%</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
