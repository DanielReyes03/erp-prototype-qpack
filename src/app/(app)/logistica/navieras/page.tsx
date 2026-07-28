"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { navieras } from "@/lib/mock";
import type { Naviera } from "@/types";

export default function NavierasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Naviera | null>(null);

  const columns: DataTableColumn<Naviera>[] = [
    { id: "nombre", header: "Naviera", cell: (n) => <span className="font-medium">{n.nombre}</span> },
    { id: "scac", header: "Codigo SCAC", cell: (n) => <Badge variant="outline">{n.codigoScac}</Badge> },
    { id: "contacto", header: "Contacto", cell: (n) => n.contacto },
    { id: "telefono", header: "Telefono", cell: (n) => n.telefono },
    { id: "rutas", header: "Rutas habituales", cell: (n) => n.rutasHabituales.join(", ") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Navieras"
        description="Lineas navieras utilizadas para embarques de importacion."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nueva naviera</Button>}
            title="Nueva naviera"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "codigoScac", label: "Codigo SCAC", required: true, placeholder: "MAEU" },
              { id: "contacto", label: "Contacto" },
              { id: "correo", label: "Correo" },
            ]}
          />
        }
      />

      <DataTable
        data={navieras}
        getRowId={(n) => n.id}
        loading={loading}
        searchPlaceholder="Buscar naviera..."
        searchFn={(n, q) => n.nombre.toLowerCase().includes(q) || n.codigoScac.toLowerCase().includes(q)}
        columns={columns}
        onRowClick={(n) => setSelected(n)}
        exportFileName="navieras"
        rowActions={(n) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(n) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin navieras"
        emptyDescription="No hay navieras registradas."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.codigoScac}>
        {selected && (
          <DetailSection title="Informacion de contacto">
            <DefinitionList
              items={[
                { label: "Contacto", value: selected.contacto },
                { label: "Telefono", value: selected.telefono },
                { label: "Correo", value: selected.correo },
                { label: "Rutas habituales", value: selected.rutasHabituales.join(", "), full: true },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
