"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, CheckCircle2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatNumber } from "@/lib/format";
import { despachos, pedidos, clientes, transportistas, vehiculos, rutas } from "@/lib/mock";
import type { Despacho } from "@/types";

const estadoOptions = ["Programado", "En ruta", "Entregado", "Con incidencia"].map((s) => ({ label: s, value: s }));

export default function DespachosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Despacho | null>(null);

  const columns: DataTableColumn<Despacho>[] = [
    { id: "folio", header: "Folio", cell: (d) => <span className="font-medium">{d.folio}</span> },
    { id: "pedido", header: "Pedido", cell: (d) => pedidos.find((p) => p.id === d.pedidoId)?.folio ?? "-" },
    { id: "cliente", header: "Cliente", cell: (d) => clientes.find((c) => c.id === d.clienteId)?.nombreComercial ?? "-" },
    { id: "transportista", header: "Transportista", cell: (d) => transportistas.find((t) => t.id === d.transportistaId)?.nombre ?? "-" },
    { id: "ruta", header: "Ruta", cell: (d) => rutas.find((r) => r.id === d.rutaId)?.nombre ?? "-" },
    { id: "fecha", header: "Fecha programada", cell: (d) => formatDate(d.fechaProgramada) },
    { id: "bultos", header: "Bultos", cell: (d) => formatNumber(d.bultos), className: "text-right" },
    { id: "estado", header: "Estado", cell: (d) => <StatusBadge status={d.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Despachos"
        description="Programacion y seguimiento de entregas a clientes."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Programar despacho
              </Button>
            }
            title="Programar despacho"
            fields={[
              { id: "pedidoId", label: "Pedido", type: "select", required: true, options: pedidos.slice(0, 20).map((p) => ({ label: p.folio, value: p.id })) },
              { id: "transportistaId", label: "Transportista", type: "select", required: true, options: transportistas.map((t) => ({ label: t.nombre, value: t.id })) },
              { id: "vehiculoId", label: "Vehiculo", type: "select", options: vehiculos.map((v) => ({ label: v.placa, value: v.id })) },
              { id: "rutaId", label: "Ruta", type: "select", options: rutas.map((r) => ({ label: r.nombre, value: r.id })) },
              { id: "fecha", label: "Fecha programada", placeholder: "dd/mm/aaaa" },
            ]}
          />
        }
      />

      <DataTable
        data={despachos}
        getRowId={(d) => d.id}
        loading={loading}
        searchPlaceholder="Buscar por folio o pedido..."
        searchFn={(d, q) => d.folio.toLowerCase().includes(q) || (pedidos.find((p) => p.id === d.pedidoId)?.folio.toLowerCase().includes(q) ?? false)}
        filters={[{ id: "transportistaId", label: "Transportista", options: transportistas.map((t) => ({ label: t.nombre, value: t.id })) }]}
        getStatus={(d) => d.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(d) => setSelected(d)}
        exportFileName="despachos"
        rowActions={(d) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(d) },
              { label: "Rastrear en mapa", icon: MapPin, onSelect: () => toast.info("Rastreo en mapa no disponible en el prototipo") },
              { label: "Marcar como entregado", icon: CheckCircle2, onSelect: () => toast.success("Despacho marcado como entregado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin despachos"
        emptyDescription="No hay despachos programados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={clientes.find((c) => c.id === selected?.clienteId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Informacion del despacho">
              <DefinitionList
                items={[
                  { label: "Pedido", value: pedidos.find((p) => p.id === selected.pedidoId)?.folio ?? "-" },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                  { label: "Transportista", value: transportistas.find((t) => t.id === selected.transportistaId)?.nombre ?? "-" },
                  { label: "Vehiculo", value: vehiculos.find((v) => v.id === selected.vehiculoId)?.placa ?? "-" },
                  { label: "Ruta", value: rutas.find((r) => r.id === selected.rutaId)?.nombre ?? "-" },
                  { label: "Fecha programada", value: formatDate(selected.fechaProgramada) },
                  { label: "Fecha de entrega", value: formatDate(selected.fechaEntrega) },
                ]}
              />
            </DetailSection>
            <DetailSection title="Carga">
              <DefinitionList
                items={[
                  { label: "Bultos", value: formatNumber(selected.bultos) },
                  { label: "Peso total", value: `${formatNumber(selected.pesoTotalKg, 1)} kg` },
                  { label: "Receptor", value: selected.firmaReceptor ?? "Pendiente" },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
