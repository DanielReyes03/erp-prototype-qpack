"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, PlayCircle, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatNumber } from "@/lib/format";
import { conteosFisicos, bodegas, productos } from "@/lib/mock";
import type { ConteoFisico } from "@/types";

const estadoOptions = ["Programado", "En proceso", "Cerrado con diferencias", "Cerrado sin diferencias"].map((s) => ({ label: s, value: s }));

export default function ConteosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<ConteoFisico | null>(null);

  const columns: DataTableColumn<ConteoFisico>[] = [
    { id: "folio", header: "Folio", cell: (c) => <span className="font-medium">{c.folio}</span> },
    { id: "bodega", header: "Bodega", cell: (c) => bodegas.find((b) => b.id === c.bodegaId)?.nombre ?? "-" },
    { id: "fecha", header: "Fecha programada", cell: (c) => formatDate(c.fechaProgramada) },
    { id: "items", header: "Productos a contar", cell: (c) => c.items.length },
    { id: "responsable", header: "Responsable", cell: (c) => c.responsable },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conteos fisicos"
        description="Conteos ciclicos y totales para validar la exactitud del inventario."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Programar conteo
              </Button>
            }
            title="Programar conteo fisico"
            fields={[
              { id: "bodegaId", label: "Bodega", type: "select", required: true, options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
              { id: "fecha", label: "Fecha programada", required: true, placeholder: "dd/mm/aaaa" },
              { id: "responsable", label: "Responsable", placeholder: "Nombre del encargado" },
            ]}
          />
        }
      />

      <DataTable
        data={conteosFisicos}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por folio..."
        searchFn={(c, q) => c.folio.toLowerCase().includes(q)}
        filters={[{ id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) }]}
        getStatus={(c) => c.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(c) => setSelected(c)}
        exportFileName="conteos_fisicos"
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(c) },
              { label: "Iniciar conteo", icon: PlayCircle, onSelect: () => toast.info("Conteo iniciado (simulado)") },
              { label: "Cerrar conteo", icon: Lock, onSelect: () => toast.success("Conteo cerrado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin conteos"
        emptyDescription="No hay conteos programados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={bodegas.find((b) => b.id === selected?.bodegaId)?.nombre}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Fecha programada", value: formatDate(selected.fechaProgramada) },
                  { label: "Responsable", value: selected.responsable },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos">
              <div className="divide-y">
                {selected.items.map((it, i) => {
                  const diff = it.cantidadContada !== null ? it.cantidadContada - it.cantidadSistema : null;
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                      <span>{productos.find((p) => p.id === it.productoId)?.nombre ?? it.productoId}</span>
                      <span className="text-right text-xs text-muted-foreground">
                        Sistema: {formatNumber(it.cantidadSistema)} · Contado: {it.cantidadContada === null ? "Pendiente" : formatNumber(it.cantidadContada)}
                        {diff !== null && diff !== 0 && (
                          <span className={diff > 0 ? " text-emerald-600 dark:text-emerald-400" : " text-red-600 dark:text-red-400"}> ({diff > 0 ? "+" : ""}{diff})</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
