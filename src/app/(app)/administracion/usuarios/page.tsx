"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Ban, CheckCircle2, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { usuarios, roles, bodegas } from "@/lib/mock";
import type { Usuario } from "@/types";

export default function UsuariosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Usuario | null>(null);

  const columns: DataTableColumn<Usuario>[] = [
    {
      id: "usuario",
      header: "Usuario",
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">{u.avatarIniciales}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{u.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">{u.correo}</p>
          </div>
        </div>
      ),
    },
    { id: "cargo", header: "Cargo", cell: (u) => u.cargo },
    { id: "rol", header: "Rol", cell: (u) => roles.find((r) => r.id === u.rolId)?.nombre ?? "-" },
    { id: "bodega", header: "Bodega asignada", cell: (u) => bodegas.find((b) => b.id === u.bodegaAsignadaId)?.nombre ?? "N/A" },
    { id: "acceso", header: "Ultimo acceso", cell: (u) => formatDate(u.ultimoAcceso) },
    { id: "estado", header: "Estado", cell: (u) => <StatusBadge status={u.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Usuarios con acceso al sistema y su rol asignado."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo usuario</Button>}
            title="Nuevo usuario"
            fields={[
              { id: "nombre", label: "Nombre completo", required: true },
              { id: "correo", label: "Correo", required: true, placeholder: "usuario@qpack.gt" },
              { id: "cargo", label: "Cargo", required: true },
              { id: "rolId", label: "Rol", type: "select", required: true, options: roles.map((r) => ({ label: r.nombre, value: r.id })) },
            ]}
          />
        }
      />

      <DataTable
        data={usuarios}
        getRowId={(u) => u.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por nombre o correo..."
        searchFn={(u, q) => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)}
        filters={[{ id: "rolId", label: "Rol", options: roles.map((r) => ({ label: r.nombre, value: r.id })) }]}
        getStatus={(u) => (u.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(u) => setSelected(u)}
        exportFileName="usuarios"
        rowActions={(u) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(u) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de usuario simulada") },
              { label: "Restablecer contrasena", icon: KeyRound, onSelect: () => toast.success("Enlace de restablecimiento enviado (simulado)") },
              { label: u.activo ? "Desactivar" : "Activar", icon: u.activo ? Ban : CheckCircle2, destructive: u.activo, onSelect: () => toast.success("Estado actualizado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.cargo}>
        {selected && (
          <DetailSection title="Informacion de acceso">
            <DefinitionList
              items={[
                { label: "Correo", value: selected.correo },
                { label: "Rol", value: roles.find((r) => r.id === selected.rolId)?.nombre ?? "-" },
                { label: "Bodega asignada", value: bodegas.find((b) => b.id === selected.bodegaAsignadaId)?.nombre ?? "N/A" },
                { label: "Ultimo acceso", value: formatDate(selected.ultimoAcceso) },
                { label: "Estado", value: <StatusBadge status={selected.activo ? "Activo" : "Inactivo"} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
