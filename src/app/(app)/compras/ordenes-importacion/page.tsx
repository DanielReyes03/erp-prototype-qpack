"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Send, Ship } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { ordenesImportacion, proveedores, productos, embarques } from "@/lib/mock";
import type { OrdenImportacion } from "@/types";
import { useRouter } from "next/navigation";

const estadoOptions = [
  "Borrador",
  "Enviada a proveedor",
  "Confirmada",
  "En produccion",
  "Lista para embarque",
  "Embarcada",
  "Cerrada",
  "Cancelada",
].map((s) => ({ label: s, value: s }));

function totalOrden(o: OrdenImportacion): number {
  return o.lineas.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);
}

export default function OrdenesImportacionPage() {
  const loading = useMockLoading();
  const router = useRouter();
  const [selected, setSelected] = React.useState<OrdenImportacion | null>(null);

  const columns: DataTableColumn<OrdenImportacion>[] = [
    { id: "folio", header: "Folio", cell: (o) => <span className="font-medium">{o.folio}</span> },
    { id: "proveedor", header: "Proveedor", cell: (o) => proveedores.find((p) => p.id === o.proveedorId)?.nombreComercial ?? "-" },
    { id: "origen", header: "Pais origen", cell: (o) => o.paisOrigen },
    { id: "incoterm", header: "Incoterm", cell: (o) => <Badge variant="outline">{o.incoterm}</Badge> },
    { id: "emision", header: "Emision", cell: (o) => formatDate(o.fechaEmision) },
    { id: "embarque", header: "Embarque estimado", cell: (o) => formatDate(o.fechaEmbarqueEstimada) },
    { id: "total", header: "Total (USD)", cell: (o) => formatCurrency(totalOrden(o), "USD"), className: "text-right" },
    { id: "estado", header: "Estado", cell: (o) => <StatusBadge status={o.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ordenes de importacion"
        description="Compras internacionales sujetas a embarque, aduana y costeo de importacion."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva orden de importacion
              </Button>
            }
            title="Nueva orden de importacion"
            fields={[
              { id: "proveedorId", label: "Proveedor", type: "select", required: true, options: proveedores.filter((p) => p.pais !== "Guatemala").map((p) => ({ label: p.nombreComercial, value: p.id })) },
              { id: "incoterm", label: "Incoterm", type: "select", required: true, options: ["EXW", "FOB", "FCA", "CFR", "CIF", "CIP", "DAP", "DDP"].map((i) => ({ label: i, value: i })) },
              { id: "productoId", label: "Producto", type: "select", required: true, options: productos.slice(0, 30).map((p) => ({ label: p.nombre, value: p.id })) },
              { id: "cantidad", label: "Cantidad", type: "number", required: true },
              { id: "fechaEmbarque", label: "Fecha estimada de embarque", placeholder: "dd/mm/aaaa" },
            ]}
          />
        }
      />

      <DataTable
        data={ordenesImportacion}
        getRowId={(o) => o.id}
        loading={loading}
        searchPlaceholder="Buscar por folio o proveedor..."
        searchFn={(o, q) => o.folio.toLowerCase().includes(q) || (proveedores.find((p) => p.id === o.proveedorId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        filters={[{ id: "proveedorId", label: "Proveedor", options: proveedores.filter((p) => p.pais !== "Guatemala").map((p) => ({ label: p.nombreComercial, value: p.id })) }]}
        getStatus={(o) => o.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(o) => setSelected(o)}
        exportFileName="ordenes_importacion"
        rowActions={(o) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(o) },
              { label: "Enviar a proveedor", icon: Send, onSelect: () => toast.success("Orden enviada al proveedor (simulado)") },
              {
                label: "Ver embarque asociado",
                icon: Ship,
                onSelect: () => (o.embarqueId ? router.push(`/compras/embarques/${o.embarqueId}`) : toast.info("Esta orden aun no tiene embarque asignado")),
              },
            ]}
          />
        )}
        emptyTitle="Sin ordenes"
        emptyDescription="No hay ordenes de importacion con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={proveedores.find((p) => p.id === selected?.proveedorId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Pais origen", value: selected.paisOrigen },
                  { label: "Incoterm", value: selected.incoterm },
                  { label: "Fecha de emision", value: formatDate(selected.fechaEmision) },
                  { label: "Embarque estimado", value: formatDate(selected.fechaEmbarqueEstimada) },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                  {
                    label: "Embarque asociado",
                    value: selected.embarqueId ? embarques.find((e) => e.id === selected.embarqueId)?.folio ?? selected.embarqueId : "Sin asignar",
                  },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos">
              <div className="divide-y">
                {selected.lineas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === l.productoId)?.nombre ?? l.productoId}</span>
                    <span className="text-muted-foreground">{l.cantidad} und. · {formatCurrency(l.costoUnitario, "USD")}</span>
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
