"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trophy, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { oportunidades, clientes, vendedores } from "@/lib/mock";
import type { Oportunidad } from "@/types";

const estadoOptions = ["Prospeccion", "Calificacion", "Propuesta", "Negociacion", "Ganada", "Perdida"].map((s) => ({ label: s, value: s }));

export default function OportunidadesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Oportunidad | null>(null);

  const valorPipeline = oportunidades.filter((o) => !["Ganada", "Perdida"].includes(o.estado)).reduce((s, o) => s + o.valorEstimadoGTQ, 0);

  const columns: DataTableColumn<Oportunidad>[] = [
    {
      id: "nombre",
      header: "Oportunidad",
      cell: (o) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{o.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{clientes.find((c) => c.id === o.clienteId)?.nombreComercial}</p>
        </div>
      ),
    },
    { id: "estado", header: "Etapa", cell: (o) => <StatusBadge status={o.estado} /> },
    { id: "valor", header: "Valor estimado", cell: (o) => formatCurrency(o.valorEstimadoGTQ), className: "text-right" },
    {
      id: "probabilidad",
      header: "Probabilidad",
      cell: (o) => (
        <div className="flex items-center gap-2">
          <Progress value={o.probabilidadPct} className="h-1.5 w-16" />
          <span className="text-xs text-muted-foreground">{o.probabilidadPct}%</span>
        </div>
      ),
    },
    { id: "vendedor", header: "Vendedor", cell: (o) => vendedores.find((v) => v.id === o.vendedorId)?.nombre ?? "-" },
    { id: "cierre", header: "Cierre estimado", cell: (o) => formatDate(o.fechaCierreEstimada) },
    { id: "origen", header: "Origen", cell: (o) => <Badge variant="outline">{o.origen}</Badge> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Oportunidades"
        description={`Pipeline comercial activo por ${formatCurrency(valorPipeline)}.`}
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva oportunidad
              </Button>
            }
            title="Nueva oportunidad"
            fields={[
              { id: "nombre", label: "Nombre de la oportunidad", required: true, placeholder: "Suministro anual bolsas industriales" },
              { id: "clienteId", label: "Cliente", type: "select", required: true, options: clientes.map((c) => ({ label: c.nombreComercial, value: c.id })) },
              { id: "valor", label: "Valor estimado (GTQ)", type: "number", required: true, placeholder: "0.00" },
              { id: "etapa", label: "Etapa", type: "select", required: true, options: estadoOptions },
              { id: "cierre", label: "Fecha de cierre estimada", placeholder: "dd/mm/aaaa" },
              { id: "notas", label: "Notas", type: "textarea", placeholder: "Detalles del seguimiento comercial" },
            ]}
          />
        }
      />

      <DataTable
        data={oportunidades}
        getRowId={(o) => o.id}
        loading={loading}
        searchPlaceholder="Buscar oportunidad..."
        searchFn={(o, q) => o.nombre.toLowerCase().includes(q)}
        filters={[{ id: "origen", label: "Origen", options: ["Referido", "Feria", "Llamada fria", "Sitio web", "Recompra"].map((o) => ({ label: o, value: o })) }]}
        getStatus={(o) => o.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(o) => setSelected(o)}
        exportFileName="oportunidades"
        exportRow={(o) => ({
          Nombre: o.nombre,
          Cliente: clientes.find((c) => c.id === o.clienteId)?.nombreComercial ?? "",
          Etapa: o.estado,
          ValorEstimado: o.valorEstimadoGTQ,
          Probabilidad: o.probabilidadPct,
        })}
        rowActions={(o) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(o) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de oportunidad simulada") },
              { label: "Marcar como ganada", icon: Trophy, onSelect: () => toast.success("Oportunidad marcada como ganada (simulado)") },
              { label: "Marcar como perdida", icon: XCircle, destructive: true, onSelect: () => toast.error("Oportunidad marcada como perdida (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin oportunidades"
        emptyDescription="No hay oportunidades registradas con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={clientes.find((c) => c.id === selected?.clienteId)?.nombreComercial}>
        {selected && (
          <>
            <DetailSection title="Estado del pipeline">
              <DefinitionList
                items={[
                  { label: "Etapa", value: <StatusBadge status={selected.estado} /> },
                  { label: "Probabilidad", value: `${selected.probabilidadPct}%` },
                  { label: "Valor estimado", value: formatCurrency(selected.valorEstimadoGTQ) },
                  { label: "Fecha de cierre estimada", value: formatDate(selected.fechaCierreEstimada) },
                  { label: "Origen", value: selected.origen },
                  { label: "Vendedor", value: vendedores.find((v) => v.id === selected.vendedorId)?.nombre ?? "-" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Notas de seguimiento">
              <p className="p-3.5 text-sm text-muted-foreground">{selected.notas}</p>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
