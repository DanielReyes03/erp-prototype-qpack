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
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { distribuidores, rutas } from "@/lib/mock";
import type { Distribuidor } from "@/types";

export default function DistribuidoresPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Distribuidor | null>(null);

  const columns: DataTableColumn<Distribuidor>[] = [
    { id: "nombre", header: "Distribuidor", cell: (d) => <span className="font-medium">{d.nombre}</span> },
    { id: "zona", header: "Zona", cell: (d) => d.zona },
    { id: "clientes", header: "Clientes asignados", cell: (d) => d.clientesAsignados, className: "text-right" },
    { id: "contacto", header: "Contacto", cell: (d) => d.contacto },
    { id: "estado", header: "Estado", cell: (d) => <StatusBadge status={d.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Distribuidores"
        description="Distribuidores regionales encargados de rutas de reparto."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo distribuidor</Button>}
            title="Nuevo distribuidor"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "zona", label: "Zona", required: true },
              { id: "contacto", label: "Contacto" },
              { id: "telefono", label: "Telefono" },
            ]}
          />
        }
      />

      <DataTable
        data={distribuidores}
        getRowId={(d) => d.id}
        loading={loading}
        searchPlaceholder="Buscar distribuidor..."
        searchFn={(d, q) => d.nombre.toLowerCase().includes(q)}
        getStatus={(d) => (d.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(d) => setSelected(d)}
        exportFileName="distribuidores"
        rowActions={(d) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(d) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin distribuidores"
        emptyDescription="No hay distribuidores registrados."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.zona}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Contacto", value: selected.contacto },
                  { label: "Telefono", value: selected.telefono },
                  { label: "Clientes asignados", value: String(selected.clientesAsignados) },
                  { label: "Estado", value: <StatusBadge status={selected.activo ? "Activo" : "Inactivo"} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Rutas asignadas">
              <div className="divide-y">
                {rutas.filter((r) => r.distribuidorId === selected.id).map((r) => (
                  <div key={r.id} className="p-3.5 text-sm">
                    <p className="font-medium">{r.nombre}</p>
                    <p className="text-xs text-muted-foreground">{r.diasVisita.join(", ")}</p>
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
