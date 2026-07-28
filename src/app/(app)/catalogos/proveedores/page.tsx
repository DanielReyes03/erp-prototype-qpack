"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { proveedores } from "@/lib/mock";
import type { Proveedor } from "@/types";

export default function ProveedoresPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Proveedor | null>(null);

  const columns: DataTableColumn<Proveedor>[] = [
    { id: "nombre", header: "Proveedor", cell: (p) => <span className="font-medium">{p.nombreComercial}</span> },
    { id: "pais", header: "Pais", cell: (p) => p.pais },
    { id: "incoterm", header: "Incoterm habitual", cell: (p) => <Badge variant="outline">{p.incotermHabitual}</Badge> },
    { id: "moneda", header: "Moneda", cell: (p) => p.moneda },
    { id: "credito", header: "Dias credito", cell: (p) => p.diasCredito, className: "text-right" },
    { id: "calificacion", header: "Calificacion", cell: (p) => `${p.calificacion.toFixed(1)} / 5` },
    { id: "estado", header: "Estado", cell: (p) => <StatusBadge status={p.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Proveedores"
        description="Proveedores nacionales e internacionales de materia prima y producto terminado."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo proveedor</Button>}
            title="Nuevo proveedor"
            fields={[
              { id: "nombreComercial", label: "Nombre comercial", required: true },
              { id: "pais", label: "Pais", required: true },
              { id: "contacto", label: "Contacto" },
              { id: "incotermHabitual", label: "Incoterm habitual", type: "select", options: ["EXW", "FOB", "FCA", "CFR", "CIF", "CIP", "DAP", "DDP"].map((i) => ({ label: i, value: i })) },
              { id: "diasCredito", label: "Dias de credito", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={proveedores}
        getRowId={(p) => p.id}
        loading={loading}
        searchPlaceholder="Buscar proveedor..."
        searchFn={(p, q) => p.nombreComercial.toLowerCase().includes(q)}
        filters={[{ id: "pais", label: "Pais", options: Array.from(new Set(proveedores.map((p) => p.pais))).map((p) => ({ label: p, value: p })) }]}
        getStatus={(p) => (p.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(p) => setSelected(p)}
        exportFileName="proveedores"
        rowActions={(p) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(p) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
              { label: p.activo ? "Desactivar" : "Activar", icon: p.activo ? Ban : CheckCircle2, destructive: p.activo, onSelect: () => toast.success("Estado actualizado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin proveedores"
        emptyDescription="No hay proveedores registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombreComercial} description={selected?.pais}>
        {selected && (
          <DetailSection title="Informacion comercial">
            <DefinitionList
              items={[
                { label: "Contacto", value: selected.contacto },
                { label: "Correo", value: selected.correo },
                { label: "Telefono", value: selected.telefono },
                { label: "Incoterm habitual", value: selected.incotermHabitual },
                { label: "Moneda", value: selected.moneda },
                { label: "Dias de credito", value: `${selected.diasCredito} dias` },
                { label: "Calificacion", value: `${selected.calificacion.toFixed(1)} / 5` },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
