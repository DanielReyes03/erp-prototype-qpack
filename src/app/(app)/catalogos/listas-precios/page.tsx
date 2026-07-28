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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { listasPrecios, productos } from "@/lib/mock";
import type { ListaPrecios } from "@/types";

export default function ListasPreciosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<ListaPrecios | null>(null);

  const columns: DataTableColumn<ListaPrecios>[] = [
    { id: "nombre", header: "Lista", cell: (l) => <span className="font-medium">{l.nombre}</span> },
    { id: "tipoCliente", header: "Tipo de cliente", cell: (l) => <Badge variant="outline">{l.tipoCliente}</Badge> },
    { id: "moneda", header: "Moneda", cell: (l) => l.moneda },
    { id: "items", header: "Productos", cell: (l) => l.items.length, className: "text-right" },
    { id: "vigencia", header: "Vigente desde", cell: (l) => formatDate(l.vigenteDesde) },
    { id: "estado", header: "Estado", cell: (l) => <StatusBadge status={l.activa ? "Activa" : "Inactiva"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Listas de precios"
        description="Precios diferenciados por segmento de cliente."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nueva lista</Button>}
            title="Nueva lista de precios"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "tipoCliente", label: "Tipo de cliente", type: "select", options: ["Distribuidor", "Mayorista", "Minorista", "Institucional"].map((t) => ({ label: t, value: t })) },
              { id: "moneda", label: "Moneda", type: "select", options: [{ label: "GTQ", value: "GTQ" }, { label: "USD", value: "USD" }] },
            ]}
          />
        }
      />

      <DataTable
        data={listasPrecios}
        getRowId={(l) => l.id}
        loading={loading}
        searchPlaceholder="Buscar lista de precios..."
        searchFn={(l, q) => l.nombre.toLowerCase().includes(q)}
        getStatus={(l) => (l.activa ? "Activa" : "Inactiva")}
        statusOptions={[{ label: "Activa", value: "Activa" }, { label: "Inactiva", value: "Inactiva" }]}
        columns={columns}
        onRowClick={(l) => setSelected(l)}
        exportFileName="listas_precios"
        rowActions={(l) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(l) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin listas"
        emptyDescription="No hay listas de precios registradas."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.tipoCliente}>
        {selected && (
          <>
            <DetailSection title="Vigencia">
              <DefinitionList
                items={[
                  { label: "Moneda", value: selected.moneda },
                  { label: "Vigente desde", value: formatDate(selected.vigenteDesde) },
                  { label: "Vigente hasta", value: selected.vigenteHasta ? formatDate(selected.vigenteHasta) : "Indefinido" },
                  { label: "Estado", value: <StatusBadge status={selected.activa ? "Activa" : "Inactiva"} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Muestra de precios (primeros 8 productos)">
              <div className="divide-y">
                {selected.items.slice(0, 8).map((it) => (
                  <div key={it.productoId} className="flex items-center justify-between p-3.5 text-sm">
                    <span className="truncate pr-2">{productos.find((p) => p.id === it.productoId)?.nombre ?? it.productoId}</span>
                    <span className="shrink-0 font-medium">{it.precio.toFixed(2)} {selected.moneda}</span>
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
