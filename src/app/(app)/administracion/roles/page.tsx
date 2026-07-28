"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { roles } from "@/lib/mock";
import type { Rol } from "@/types";

export default function RolesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Rol | null>(null);

  const columns: DataTableColumn<Rol>[] = [
    { id: "nombre", header: "Rol", cell: (r) => <span className="font-medium">{r.nombre}</span> },
    { id: "descripcion", header: "Descripcion", cell: (r) => r.descripcion },
    { id: "usuarios", header: "Usuarios", cell: (r) => r.usuarios, className: "text-right" },
    { id: "tipo", header: "Tipo", cell: (r) => (r.esSistema ? <Badge variant="outline">Rol de sistema</Badge> : <Badge variant="outline">Personalizado</Badge>) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles y permisos"
        description="Perfiles de acceso y permisos asignados a cada rol."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo rol</Button>}
            title="Nuevo rol"
            fields={[
              { id: "nombre", label: "Nombre del rol", required: true },
              { id: "descripcion", label: "Descripcion", type: "textarea", required: true },
            ]}
          />
        }
      />

      <DataTable
        data={roles}
        getRowId={(r) => r.id}
        loading={loading}
        searchPlaceholder="Buscar rol..."
        searchFn={(r, q) => r.nombre.toLowerCase().includes(q)}
        columns={columns}
        onRowClick={(r) => setSelected(r)}
        exportFileName="roles"
        rowActions={(r) => (
          <RowActionsMenu
            actions={[
              { label: "Ver permisos", icon: Eye, onSelect: () => setSelected(r) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de rol simulada") },
              {
                label: "Eliminar rol",
                icon: Trash2,
                destructive: true,
                separatorBefore: true,
                onSelect: () => (r.esSistema ? toast.error("No se puede eliminar un rol de sistema") : toast.success("Rol eliminado (simulado)")),
              },
            ]}
          />
        )}
        emptyTitle="Sin roles"
        emptyDescription="No hay roles registrados."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.descripcion}>
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Usuarios con este rol", value: String(selected.usuarios) },
                  { label: "Tipo", value: selected.esSistema ? "Rol de sistema" : "Personalizado" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Permisos asignados">
              <div className="flex flex-wrap gap-1.5 p-3.5">
                {selected.permisos.map((p) => (
                  <Badge key={p} variant="outline">{p}</Badge>
                ))}
              </div>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
