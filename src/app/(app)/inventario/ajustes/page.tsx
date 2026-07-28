"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { ajustesInventario, bodegas, productos } from "@/lib/mock";
import type { AjusteInventario } from "@/types";

const estadoOptions = ["Borrador", "Aplicado"].map((s) => ({ label: s, value: s }));

export default function AjustesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<AjusteInventario | null>(null);

  const columns: DataTableColumn<AjusteInventario>[] = [
    { id: "folio", header: "Folio", cell: (a) => <span className="font-medium">{a.folio}</span> },
    { id: "bodega", header: "Bodega", cell: (a) => bodegas.find((b) => b.id === a.bodegaId)?.nombre ?? "-" },
    { id: "tipo", header: "Tipo", cell: (a) => <StatusBadge status={a.tipo} tone={a.tipo === "Positivo" ? "success" : "danger"} /> },
    { id: "motivo", header: "Motivo", cell: (a) => a.motivo },
    { id: "fecha", header: "Fecha", cell: (a) => formatDate(a.fecha) },
    {
      id: "valor",
      header: "Valor estimado",
      cell: (a) => formatCurrency(a.items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0)),
      className: "text-right",
    },
    { id: "autoriza", header: "Autorizado por", cell: (a) => a.autorizadoPor },
    { id: "estado", header: "Estado", cell: (a) => <StatusBadge status={a.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ajustes de inventario"
        description="Correcciones de existencia por merma, error de captura o reclasificacion."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nuevo ajuste
              </Button>
            }
            title="Nuevo ajuste de inventario"
            fields={[
              { id: "bodegaId", label: "Bodega", type: "select", required: true, options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
              { id: "tipo", label: "Tipo", type: "select", required: true, options: [{ label: "Positivo", value: "Positivo" }, { label: "Negativo", value: "Negativo" }] },
              { id: "productoId", label: "Producto", type: "select", required: true, options: productos.slice(0, 30).map((p) => ({ label: p.nombre, value: p.id })) },
              { id: "cantidad", label: "Cantidad", type: "number", required: true },
              { id: "motivo", label: "Motivo", required: true, placeholder: "Merma por manejo, diferencia en conteo, etc." },
            ]}
          />
        }
      />

      <DataTable
        data={ajustesInventario}
        getRowId={(a) => a.id}
        loading={loading}
        searchPlaceholder="Buscar por folio..."
        searchFn={(a, q) => a.folio.toLowerCase().includes(q)}
        filters={[{ id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) }]}
        getStatus={(a) => a.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(a) => setSelected(a)}
        exportFileName="ajustes_inventario"
        rowActions={(a) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(a) },
              { label: "Aplicar ajuste", icon: CheckCircle2, onSelect: () => toast.success("Ajuste aplicado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin ajustes"
        emptyDescription="No hay ajustes registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={selected?.motivo}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Bodega", value: bodegas.find((b) => b.id === selected.bodegaId)?.nombre ?? "-" },
                  { label: "Tipo", value: selected.tipo },
                  { label: "Fecha", value: formatDate(selected.fecha) },
                  { label: "Autorizado por", value: selected.autorizadoPor },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos ajustados">
              <div className="divide-y">
                {selected.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === it.productoId)?.nombre ?? it.productoId}</span>
                    <span className="text-muted-foreground">{it.cantidad} und. · {formatCurrency(it.costoUnitario)}</span>
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
