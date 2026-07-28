"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Send, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { ordenesCompraLocal, proveedores, bodegas, productos } from "@/lib/mock";
import type { OrdenCompraLocal } from "@/types";

const estadoOptions = ["Borrador", "Enviada", "Confirmada", "Recibida parcial", "Recibida", "Cancelada"].map((s) => ({ label: s, value: s }));

function totalOrden(o: OrdenCompraLocal): number {
  return o.lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);
}

export default function OrdenesLocalesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<OrdenCompraLocal | null>(null);

  const columns: DataTableColumn<OrdenCompraLocal>[] = [
    { id: "folio", header: "Folio", cell: (o) => <span className="font-medium">{o.folio}</span> },
    { id: "proveedor", header: "Proveedor", cell: (o) => proveedores.find((p) => p.id === o.proveedorId)?.nombreComercial ?? "-" },
    { id: "bodega", header: "Bodega destino", cell: (o) => bodegas.find((b) => b.id === o.bodegaDestinoId)?.nombre ?? "-" },
    { id: "emision", header: "Emision", cell: (o) => formatDate(o.fechaEmision) },
    { id: "entrega", header: "Entrega estimada", cell: (o) => formatDate(o.fechaEntregaEstimada) },
    { id: "total", header: "Total", cell: (o) => formatCurrency(totalOrden(o)), className: "text-right" },
    { id: "estado", header: "Estado", cell: (o) => <StatusBadge status={o.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ordenes de compra locales"
        description="Compras a proveedores nacionales para reposicion de inventario."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva orden local
              </Button>
            }
            title="Nueva orden de compra local"
            fields={[
              { id: "proveedorId", label: "Proveedor", type: "select", required: true, options: proveedores.filter((p) => p.pais === "Guatemala").map((p) => ({ label: p.nombreComercial, value: p.id })) },
              { id: "bodegaDestinoId", label: "Bodega destino", type: "select", required: true, options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
              { id: "productoId", label: "Producto", type: "select", required: true, options: productos.slice(0, 30).map((p) => ({ label: p.nombre, value: p.id })) },
              { id: "cantidad", label: "Cantidad", type: "number", required: true },
              { id: "fechaEntrega", label: "Fecha de entrega estimada", placeholder: "dd/mm/aaaa" },
            ]}
          />
        }
      />

      <DataTable
        data={ordenesCompraLocal}
        getRowId={(o) => o.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por folio o proveedor..."
        searchFn={(o, q) => o.folio.toLowerCase().includes(q) || (proveedores.find((p) => p.id === o.proveedorId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        filters={[{ id: "proveedorId", label: "Proveedor", options: proveedores.filter((p) => p.pais === "Guatemala").map((p) => ({ label: p.nombreComercial, value: p.id })) }]}
        getStatus={(o) => o.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(o) => setSelected(o)}
        exportFileName="ordenes_compra_local"
        rowActions={(o) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(o) },
              { label: "Enviar a proveedor", icon: Send, onSelect: () => toast.success("Orden enviada al proveedor (simulado)") },
              { label: "Registrar recepcion", icon: PackageCheck, onSelect: () => toast.info("Redirige a Compras > Recepciones") },
            ]}
          />
        )}
        emptyTitle="Sin ordenes"
        emptyDescription="No hay ordenes de compra locales con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={proveedores.find((p) => p.id === selected?.proveedorId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Bodega destino", value: bodegas.find((b) => b.id === selected.bodegaDestinoId)?.nombre ?? "-" },
                  { label: "Fecha de emision", value: formatDate(selected.fechaEmision) },
                  { label: "Entrega estimada", value: formatDate(selected.fechaEntregaEstimada) },
                  { label: "Solicitado por", value: selected.solicitadoPor },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos">
              <div className="divide-y">
                {selected.lineas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === l.productoId)?.nombre ?? l.productoId}</span>
                    <span className="text-muted-foreground">{l.cantidad} und. · {formatCurrency(l.costoUnitario)}</span>
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
