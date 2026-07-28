"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { aprobaciones } from "@/lib/mock";
import type { Aprobacion } from "@/types";

const estadoOptions = ["Pendiente", "Aprobada", "Rechazada"].map((s) => ({ label: s, value: s }));
const tipoOptions = ["Descuento", "Credito", "Ajuste inventario", "Orden de compra", "Devolucion"].map((t) => ({ label: t, value: t }));

export default function AprobacionesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Aprobacion | null>(null);

  const pendientes = aprobaciones.filter((a) => a.estado === "Pendiente").length;

  const columns: DataTableColumn<Aprobacion>[] = [
    { id: "documento", header: "Documento", cell: (a) => <span className="font-medium">{a.documentoReferencia}</span> },
    { id: "tipo", header: "Tipo", cell: (a) => <Badge variant="outline">{a.tipo}</Badge> },
    { id: "solicitante", header: "Solicitado por", cell: (a) => a.solicitadoPor },
    { id: "fecha", header: "Fecha solicitud", cell: (a) => formatDate(a.fechaSolicitud) },
    { id: "monto", header: "Monto", cell: (a) => formatCurrency(a.montoGTQ), className: "text-right" },
    { id: "aprobador", header: "Aprobador", cell: (a) => a.aprobador },
    { id: "estado", header: "Estado", cell: (a) => <StatusBadge status={a.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Aprobaciones" description={`${pendientes} solicitudes pendientes de autorizacion.`} />

      <DataTable
        data={aprobaciones}
        getRowId={(a) => a.id}
        loading={loading}
        searchPlaceholder="Buscar por documento..."
        searchFn={(a, q) => a.documentoReferencia.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: tipoOptions }]}
        getStatus={(a) => a.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(a) => setSelected(a)}
        exportFileName="aprobaciones"
        rowActions={(a) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(a) },
              { label: "Aprobar", icon: CheckCircle2, onSelect: () => toast.success("Solicitud aprobada (simulado)") },
              { label: "Rechazar", icon: XCircle, destructive: true, onSelect: () => toast.error("Solicitud rechazada (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin solicitudes"
        emptyDescription="No hay solicitudes de aprobacion con estos filtros."
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.documentoReferencia}
        description={selected?.tipo}
        footer={
          selected &&
          selected.estado === "Pendiente" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-destructive"
                onClick={() => {
                  toast.error("Solicitud rechazada (simulado)", { description: selected.documentoReferencia });
                  setSelected(null);
                }}
              >
                <XCircle />
                Rechazar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Solicitud aprobada (simulado)", { description: selected.documentoReferencia });
                  setSelected(null);
                }}
              >
                <CheckCircle2 />
                Aprobar
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <>
            <DetailSection title="Detalle de la solicitud">
              <DefinitionList
                items={[
                  { label: "Solicitado por", value: selected.solicitadoPor },
                  { label: "Fecha de solicitud", value: formatDate(selected.fechaSolicitud) },
                  { label: "Monto", value: formatCurrency(selected.montoGTQ) },
                  { label: "Aprobador asignado", value: selected.aprobador },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Justificacion">
              <p className="p-3.5 text-sm text-muted-foreground">{selected.justificacion}</p>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
