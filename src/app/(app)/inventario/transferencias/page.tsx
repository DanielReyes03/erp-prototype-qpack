"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Truck, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { transferencias, bodegas, productos } from "@/lib/mock";
import type { Transferencia } from "@/types";

const estadoOptions = ["Solicitada", "En transito", "Recibida", "Cancelada"].map((s) => ({ label: s, value: s }));

export default function TransferenciasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Transferencia | null>(null);

  const columns: DataTableColumn<Transferencia>[] = [
    { id: "folio", header: "Folio", cell: (t) => <span className="font-medium">{t.folio}</span> },
    { id: "origen", header: "Origen", cell: (t) => bodegas.find((b) => b.id === t.bodegaOrigenId)?.nombre ?? "-" },
    { id: "destino", header: "Destino", cell: (t) => bodegas.find((b) => b.id === t.bodegaDestinoId)?.nombre ?? "-" },
    { id: "fecha", header: "Fecha", cell: (t) => formatDate(t.fecha) },
    { id: "items", header: "Productos", cell: (t) => `${t.items.length} lineas` },
    { id: "responsable", header: "Responsable", cell: (t) => t.responsable },
    { id: "estado", header: "Estado", cell: (t) => <StatusBadge status={t.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transferencias entre bodegas"
        description="Movimientos de inventario entre bodegas y ubicaciones de la compania."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva transferencia
              </Button>
            }
            title="Nueva transferencia"
            fields={[
              { id: "bodegaOrigenId", label: "Bodega origen", type: "select", required: true, options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
              { id: "bodegaDestinoId", label: "Bodega destino", type: "select", required: true, options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
              { id: "productoId", label: "Producto", type: "select", required: true, options: productos.slice(0, 30).map((p) => ({ label: p.nombre, value: p.id })) },
              { id: "cantidad", label: "Cantidad", type: "number", required: true },
            ]}
          />
        }
      />

      <DataTable
        data={transferencias}
        getRowId={(t) => t.id}
        loading={loading}
        searchPlaceholder="Buscar por folio..."
        searchFn={(t, q) => t.folio.toLowerCase().includes(q)}
        filters={[{ id: "bodegaOrigenId", label: "Bodega origen", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) }]}
        getStatus={(t) => t.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(t) => setSelected(t)}
        exportFileName="transferencias"
        rowActions={(t) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(t) },
              { label: "Marcar en transito", icon: Truck, onSelect: () => toast.info("Transferencia marcada en transito (simulado)") },
              { label: "Confirmar recepcion", icon: CheckCircle2, onSelect: () => toast.success("Transferencia recibida (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin transferencias"
        emptyDescription="No hay transferencias registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={`${bodegas.find((b) => b.id === selected?.bodegaOrigenId)?.nombre ?? ""} → ${bodegas.find((b) => b.id === selected?.bodegaDestinoId)?.nombre ?? ""}`}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Fecha", value: formatDate(selected.fecha) },
                  { label: "Responsable", value: selected.responsable },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos">
              <div className="divide-y">
                {selected.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === it.productoId)?.nombre ?? it.productoId}</span>
                    <span className="text-muted-foreground">{it.cantidad} und.</span>
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
