"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, CheckCircle2, Pencil, Phone, ClipboardList, Users2, AlertCircle } from "lucide-react";
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
import { actividades, clientes, usuarios } from "@/lib/mock";
import type { Actividad, TipoActividad } from "@/types";

const tipoIcon: Record<TipoActividad, typeof Phone> = {
  Llamada: Phone,
  Tarea: ClipboardList,
  Reunion: Users2,
  Reclamo: AlertCircle,
};

const estadoOptions = ["Pendiente", "En progreso", "Completada", "Vencida"].map((s) => ({ label: s, value: s }));

export default function ActividadesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Actividad | null>(null);

  const columns: DataTableColumn<Actividad>[] = [
    {
      id: "asunto",
      header: "Actividad",
      cell: (a) => {
        const Icon = tipoIcon[a.tipo];
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{a.asunto}</p>
              <p className="truncate text-xs text-muted-foreground">{clientes.find((c) => c.id === a.clienteId)?.nombreComercial}</p>
            </div>
          </div>
        );
      },
    },
    { id: "tipo", header: "Tipo", cell: (a) => <Badge variant="outline">{a.tipo}</Badge> },
    { id: "prioridad", header: "Prioridad", cell: (a) => <StatusBadge status={a.prioridad} tone={a.prioridad === "Alta" ? "danger" : a.prioridad === "Media" ? "warning" : "neutral"} /> },
    { id: "responsable", header: "Responsable", cell: (a) => usuarios.find((u) => u.id === a.responsableId)?.nombre ?? "Vendedor" },
    { id: "fecha", header: "Fecha programada", cell: (a) => formatDate(a.fechaProgramada) },
    { id: "estado", header: "Estado", cell: (a) => <StatusBadge status={a.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Actividades"
        description="Llamadas, tareas, reuniones y reclamos del equipo comercial."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva actividad
              </Button>
            }
            title="Nueva actividad"
            fields={[
              { id: "tipo", label: "Tipo", type: "select", required: true, options: ["Llamada", "Tarea", "Reunion", "Reclamo"].map((t) => ({ label: t, value: t })) },
              { id: "asunto", label: "Asunto", required: true, placeholder: "Describe brevemente la actividad" },
              { id: "clienteId", label: "Cliente", type: "select", required: true, options: clientes.map((c) => ({ label: c.nombreComercial, value: c.id })) },
              { id: "prioridad", label: "Prioridad", type: "select", options: ["Alta", "Media", "Baja"].map((p) => ({ label: p, value: p })) },
              { id: "fecha", label: "Fecha programada", placeholder: "dd/mm/aaaa" },
              { id: "descripcion", label: "Descripcion", type: "textarea" },
            ]}
          />
        }
      />

      <DataTable
        data={actividades}
        getRowId={(a) => a.id}
        loading={loading}
        searchPlaceholder="Buscar actividad..."
        searchFn={(a, q) => a.asunto.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: ["Llamada", "Tarea", "Reunion", "Reclamo"].map((t) => ({ label: t, value: t })) }]}
        getStatus={(a) => a.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(a) => setSelected(a)}
        exportFileName="actividades"
        rowActions={(a) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(a) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de actividad simulada") },
              {
                label: "Marcar como completada",
                icon: CheckCircle2,
                onSelect: () => toast.success("Actividad completada (simulado)", { description: a.asunto }),
              },
            ]}
          />
        )}
        emptyTitle="Sin actividades"
        emptyDescription="No hay actividades registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.asunto} description={clientes.find((c) => c.id === selected?.clienteId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Detalle de la actividad">
              <DefinitionList
                items={[
                  { label: "Tipo", value: selected.tipo },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                  { label: "Prioridad", value: selected.prioridad },
                  { label: "Fecha programada", value: formatDate(selected.fechaProgramada) },
                  { label: "Fecha completada", value: formatDate(selected.fechaCompletada) },
                  { label: "Responsable", value: usuarios.find((u) => u.id === selected.responsableId)?.nombre ?? "Vendedor" },
                ]}
              />
            </DetailSection>
            {selected.tipo === "Reclamo" && (
              <DetailSection title="Detalle del reclamo">
                <DefinitionList
                  items={[
                    { label: "Canal", value: selected.canalReclamo ?? "-" },
                    { label: "Severidad", value: selected.severidadReclamo ?? "-" },
                  ]}
                />
              </DetailSection>
            )}
            <DetailSection title="Descripcion">
              <p className="p-3.5 text-sm text-muted-foreground">{selected.descripcion}</p>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
