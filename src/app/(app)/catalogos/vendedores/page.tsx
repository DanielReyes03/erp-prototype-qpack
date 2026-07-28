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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency } from "@/lib/format";
import { vendedores } from "@/lib/mock";
import type { Vendedor } from "@/types";

export default function VendedoresPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Vendedor | null>(null);

  const columns: DataTableColumn<Vendedor>[] = [
    { id: "nombre", header: "Vendedor", cell: (v) => <span className="font-medium">{v.nombre}</span> },
    { id: "zona", header: "Zona", cell: (v) => v.zona },
    { id: "meta", header: "Meta mensual", cell: (v) => formatCurrency(v.metaMensualGTQ), className: "text-right" },
    {
      id: "cumplimiento",
      header: "Cumplimiento",
      cell: (v) => (
        <div className="flex items-center gap-2">
          <Progress value={Math.min(100, (v.ventaAcumuladaGTQ / v.metaMensualGTQ) * 100)} className="h-1.5 w-16" />
          <span className="text-xs text-muted-foreground">{Math.round((v.ventaAcumuladaGTQ / v.metaMensualGTQ) * 100)}%</span>
        </div>
      ),
    },
    { id: "comision", header: "Comision", cell: (v) => `${v.comisionPct}%`, className: "text-right" },
    { id: "estado", header: "Estado", cell: (v) => <StatusBadge status={v.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vendedores"
        description="Fuerza de ventas y sus metas asignadas por zona."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo vendedor</Button>}
            title="Nuevo vendedor"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "correo", label: "Correo", required: true },
              { id: "zona", label: "Zona", required: true },
              { id: "metaMensual", label: "Meta mensual (GTQ)", type: "number" },
              { id: "comision", label: "Comision (%)", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={vendedores}
        getRowId={(v) => v.id}
        loading={loading}
        searchPlaceholder="Buscar vendedor..."
        searchFn={(v, q) => v.nombre.toLowerCase().includes(q)}
        filters={[{ id: "zona", label: "Zona", options: Array.from(new Set(vendedores.map((v) => v.zona))).map((z) => ({ label: z, value: z })) }]}
        getStatus={(v) => (v.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(v) => setSelected(v)}
        exportFileName="vendedores"
        rowActions={(v) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(v) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin vendedores"
        emptyDescription="No hay vendedores registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.zona}>
        {selected && (
          <DetailSection title="Desempeno comercial">
            <DefinitionList
              items={[
                { label: "Correo", value: selected.correo },
                { label: "Telefono", value: selected.telefono },
                { label: "Meta mensual", value: formatCurrency(selected.metaMensualGTQ) },
                { label: "Venta acumulada", value: formatCurrency(selected.ventaAcumuladaGTQ) },
                { label: "Comision", value: `${selected.comisionPct}%` },
                { label: "Estado", value: <StatusBadge status={selected.activo ? "Activo" : "Inactivo"} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
