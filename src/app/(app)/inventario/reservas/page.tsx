"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, Unlock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatNumber } from "@/lib/format";
import { reservas, productos, bodegas, clientes } from "@/lib/mock";
import type { Reserva } from "@/types";

const estadoOptions = ["Activa", "Liberada", "Consumida"].map((s) => ({ label: s, value: s }));

export default function ReservasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Reserva | null>(null);

  const columns: DataTableColumn<Reserva>[] = [
    { id: "producto", header: "Producto", cell: (r) => productos.find((p) => p.id === r.productoId)?.nombre ?? r.productoId },
    { id: "bodega", header: "Bodega", cell: (r) => bodegas.find((b) => b.id === r.bodegaId)?.nombre ?? "-" },
    { id: "pedido", header: "Pedido", cell: (r) => r.pedidoId },
    { id: "cliente", header: "Cliente", cell: (r) => clientes.find((c) => c.id === r.clienteId)?.nombreComercial ?? "-" },
    { id: "cantidad", header: "Cantidad", cell: (r) => formatNumber(r.cantidad), className: "text-right" },
    { id: "vencimiento", header: "Vence", cell: (r) => formatDate(r.vencimiento) },
    { id: "estado", header: "Estado", cell: (r) => <StatusBadge status={r.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reservas de inventario" description="Cantidades apartadas de existencias disponibles para pedidos confirmados." />

      <DataTable
        data={reservas}
        getRowId={(r) => r.id}
        loading={loading}
        searchPlaceholder="Buscar por pedido..."
        searchFn={(r, q) => r.pedidoId.toLowerCase().includes(q)}
        filters={[{ id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) }]}
        getStatus={(r) => r.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(r) => setSelected(r)}
        exportFileName="reservas_inventario"
        rowActions={(r) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(r) },
              { label: "Liberar reserva", icon: Unlock, onSelect: () => toast.success("Reserva liberada (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin reservas"
        emptyDescription="No hay reservas activas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={productos.find((p) => p.id === selected?.productoId)?.nombre} description={selected?.pedidoId}>
        {selected && (
          <DetailSection title="Detalle de la reserva">
            <DefinitionList
              items={[
                { label: "Bodega", value: bodegas.find((b) => b.id === selected.bodegaId)?.nombre ?? "-" },
                { label: "Cliente", value: clientes.find((c) => c.id === selected.clienteId)?.nombreComercial ?? "-" },
                { label: "Cantidad reservada", value: formatNumber(selected.cantidad) },
                { label: "Fecha de reserva", value: formatDate(selected.fechaReserva) },
                { label: "Vencimiento", value: formatDate(selected.vencimiento) },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
