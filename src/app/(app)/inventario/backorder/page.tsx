"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatNumber } from "@/lib/format";
import { backorders, productos, clientes } from "@/lib/mock";
import type { Backorder } from "@/types";

const estadoOptions = ["Pendiente", "Parcial", "Surtido"].map((s) => ({ label: s, value: s }));

export default function BackorderPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Backorder | null>(null);

  const columns: DataTableColumn<Backorder>[] = [
    { id: "producto", header: "Producto", cell: (b) => productos.find((p) => p.id === b.productoId)?.nombre ?? b.productoId },
    { id: "cliente", header: "Cliente", cell: (b) => clientes.find((c) => c.id === b.clienteId)?.nombreComercial ?? "-" },
    { id: "pedido", header: "Pedido", cell: (b) => b.pedidoId },
    { id: "cantidad", header: "Cantidad pendiente", cell: (b) => formatNumber(b.cantidadPendiente), className: "text-right" },
    { id: "origen", header: "Reposicion via", cell: (b) => <Badge variant="outline">{b.origenReposicion}</Badge> },
    { id: "fechaEstimada", header: "Surtido estimado", cell: (b) => formatDate(b.fechaEstimadaSurtido) },
    { id: "estado", header: "Estado", cell: (b) => <StatusBadge status={b.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Backorder" description="Pedidos de clientes con cantidades pendientes de surtir por falta de existencia." />

      <DataTable
        data={backorders}
        getRowId={(b) => b.id}
        loading={loading}
        searchPlaceholder="Buscar por pedido..."
        searchFn={(b, q) => b.pedidoId.toLowerCase().includes(q)}
        filters={[{ id: "origenReposicion", label: "Reposicion", options: ["Orden local", "Importacion"].map((o) => ({ label: o, value: o })) }]}
        getStatus={(b) => b.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(b) => setSelected(b)}
        exportFileName="backorder"
        rowActions={(b) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(b) },
              { label: "Marcar como surtido", icon: PackageCheck, onSelect: () => toast.success("Backorder marcado como surtido (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin backorders"
        emptyDescription="No hay pedidos pendientes de surtir con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={productos.find((p) => p.id === selected?.productoId)?.nombre} description={selected?.pedidoId}>
        {selected && (
          <DetailSection title="Detalle del backorder">
            <DefinitionList
              items={[
                { label: "Cliente", value: clientes.find((c) => c.id === selected.clienteId)?.nombreComercial ?? "-" },
                { label: "Cantidad pendiente", value: formatNumber(selected.cantidadPendiente) },
                { label: "Origen del pedido", value: formatDate(selected.fechaOrigen) },
                { label: "Surtido estimado", value: formatDate(selected.fechaEstimadaSurtido) },
                { label: "Via de reposicion", value: selected.origenReposicion },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
