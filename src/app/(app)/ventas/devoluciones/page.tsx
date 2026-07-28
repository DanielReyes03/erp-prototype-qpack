"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, CheckCircle2, XCircle } from "lucide-react";
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
import { devoluciones, pedidos, clientes, productos } from "@/lib/mock";
import type { Devolucion } from "@/types";

const estadoOptions = ["Solicitada", "En revision", "Aprobada", "Rechazada", "Completada"].map((s) => ({ label: s, value: s }));
const motivoOptions = ["Producto danado", "Error en pedido", "No cumple especificacion", "Exceso de inventario del cliente", "Vencimiento"].map((m) => ({ label: m, value: m }));

export default function DevolucionesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Devolucion | null>(null);

  const columns: DataTableColumn<Devolucion>[] = [
    { id: "folio", header: "Folio", cell: (d) => <span className="font-medium">{d.folio}</span> },
    { id: "pedido", header: "Pedido origen", cell: (d) => pedidos.find((p) => p.id === d.pedidoId)?.folio ?? "-" },
    { id: "cliente", header: "Cliente", cell: (d) => clientes.find((c) => c.id === d.clienteId)?.nombreComercial ?? "-" },
    { id: "motivo", header: "Motivo", cell: (d) => <Badge variant="outline">{d.motivo}</Badge> },
    { id: "fecha", header: "Fecha solicitud", cell: (d) => formatDate(d.fechaSolicitud) },
    { id: "monto", header: "Monto", cell: (d) => formatCurrency(d.montoGTQ), className: "text-right" },
    { id: "notaCredito", header: "Nota de credito", cell: (d) => (d.requiereNotaCredito ? <Badge variant="outline">Requerida</Badge> : "-") },
    { id: "estado", header: "Estado", cell: (d) => <StatusBadge status={d.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Devoluciones"
        description="Solicitudes de devolucion de clientes y su resolucion."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva devolucion
              </Button>
            }
            title="Nueva solicitud de devolucion"
            fields={[
              { id: "pedidoId", label: "Pedido origen", type: "select", required: true, options: pedidos.slice(0, 20).map((p) => ({ label: p.folio, value: p.id })) },
              { id: "motivo", label: "Motivo", type: "select", required: true, options: motivoOptions },
              { id: "descripcion", label: "Descripcion del problema", type: "textarea" },
            ]}
          />
        }
      />

      <DataTable
        data={devoluciones}
        getRowId={(d) => d.id}
        loading={loading}
        searchPlaceholder="Buscar por folio o pedido..."
        searchFn={(d, q) => d.folio.toLowerCase().includes(q)}
        filters={[{ id: "motivo", label: "Motivo", options: motivoOptions }]}
        getStatus={(d) => d.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(d) => setSelected(d)}
        exportFileName="devoluciones"
        rowActions={(d) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(d) },
              { label: "Aprobar", icon: CheckCircle2, onSelect: () => toast.success("Devolucion aprobada (simulado)") },
              { label: "Rechazar", icon: XCircle, destructive: true, onSelect: () => toast.error("Devolucion rechazada (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin devoluciones"
        emptyDescription="No hay devoluciones registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folio} description={clientes.find((c) => c.id === selected?.clienteId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Informacion de la devolucion">
              <DefinitionList
                items={[
                  { label: "Pedido origen", value: pedidos.find((p) => p.id === selected.pedidoId)?.folio ?? "-" },
                  { label: "Motivo", value: selected.motivo },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                  { label: "Fecha de solicitud", value: formatDate(selected.fechaSolicitud) },
                  { label: "Monto", value: formatCurrency(selected.montoGTQ) },
                  { label: "Requiere nota de credito", value: selected.requiereNotaCredito ? "Si" : "No" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos a devolver">
              <div className="divide-y">
                {selected.lineas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === l.productoId)?.nombre ?? l.productoId}</span>
                    <span className="text-muted-foreground">{l.cantidad} und.</span>
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
