"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Power, Trash2 } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { EntityAvatar } from "@/components/patterns/EntityAvatar";
import { formatDate } from "@/lib/format";
import { useSeguridadStore } from "@/lib/store/seguridad";
import type { Usuario } from "@/lib/seed/usuarios";
import { UsuarioFormModal } from "./_components/UsuarioFormModal";

export default function UsuariosPage() {
  const usuarios = useSeguridadStore((s) => s.usuarios);
  const roles = useSeguridadStore((s) => s.roles);
  const setActivo = useSeguridadStore((s) => s.setActivo);
  const deleteUsuario = useSeguridadStore((s) => s.deleteUsuario);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | undefined>(undefined);
  const [deleting, setDeleting] = useState<Usuario | undefined>(undefined);

  function rolNombre(rolId: string) {
    return roles.find((r) => r.id === rolId)?.nombre ?? "—";
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [usuarios, search]);

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: "nombre",
      header: "Usuario",
      sortAccessor: (u) => u.nombre,
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={u.nombre} />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{u.nombre}</span>
            <span className="text-xs text-slate-500">{u.email}</span>
          </div>
        </div>
      ),
    },
    { key: "telefono", header: "Teléfono", cell: (u) => <span className="font-data">{u.telefono}</span> },
    { key: "rol", header: "Rol", sortAccessor: (u) => rolNombre(u.rolId), cell: (u) => rolNombre(u.rolId) },
    {
      key: "createdAt",
      header: "Alta",
      cellClassName: "whitespace-nowrap",
      sortAccessor: (u) => u.createdAt,
      cell: (u) => <span className="font-data">{formatDate(u.createdAt)}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (u) => <StatusChip status={u.activo ? "gen:activo" : "gen:inactivo"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Cuentas de acceso al sistema y su rol asignado"
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nombre o correo…" />

      <DataTable
        ariaLabel="Listado de usuarios"
        columns={columns}
        rows={filtered}
        getRowId={(u) => u.id}
        emptyTitle="Sin usuarios"
        emptyDescription="No se encontraron usuarios con los filtros actuales."
        rowActions={[
          {
            key: "editar",
            label: "Editar",
            icon: Pencil,
            onSelect: (u) => {
              setEditing(u);
              setFormOpen(true);
            },
          },
          {
            key: "toggle",
            label: "Activar / Desactivar",
            icon: Power,
            onSelect: async (u) => {
              await setActivo(u.id, !u.activo);
              toast.success(u.activo ? "Usuario desactivado" : "Usuario activado", { description: u.nombre });
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            onSelect: (u) => setDeleting(u),
          },
        ]}
      />

      <UsuarioFormModal isOpen={formOpen} onOpenChange={setFormOpen} usuario={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar usuario?"
        description={`Se eliminará permanentemente a "${deleting?.nombre}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteUsuario(deleting.id);
          toast.success("Usuario eliminado", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
