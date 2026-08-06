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
import { useVendedoresStore } from "@/lib/store/vendedores";
import type { Vendedor } from "@/lib/seed/vendedores";
import { VendedorFormModal } from "./_components/VendedorFormModal";

export default function VendedoresPage() {
  const vendedores = useVendedoresStore((s) => s.vendedores);
  const setActivo = useVendedoresStore((s) => s.setActivo);
  const deleteVendedor = useVendedoresStore((s) => s.deleteVendedor);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vendedor | undefined>(undefined);
  const [deleting, setDeleting] = useState<Vendedor | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendedores;
    return vendedores.filter(
      (v) => v.nombre.toLowerCase().includes(q) || v.email.toLowerCase().includes(q),
    );
  }, [vendedores, search]);

  const columns: DataTableColumn<Vendedor>[] = [
    {
      key: "nombre",
      header: "Vendedor",
      sortAccessor: (v) => v.nombre,
      cell: (v) => (
        <div className="flex items-center gap-2.5">
          <EntityAvatar name={v.nombre} />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{v.nombre}</span>
            <span className="text-xs text-slate-500">{v.email}</span>
          </div>
        </div>
      ),
    },
    { key: "telefono", header: "Teléfono", cell: (v) => <span className="font-data">{v.telefono}</span> },
    { key: "zona", header: "Zona asignada", sortAccessor: (v) => v.zonaAsignada, cell: (v) => v.zonaAsignada },
    {
      key: "comision",
      header: "% Comisión",
      align: "right",
      sortAccessor: (v) => v.porcentajeComision,
      cell: (v) => <span className="font-data">{v.porcentajeComision.toFixed(2)}%</span>,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (v) => <StatusChip status={v.activo ? "gen:activo" : "gen:inactivo"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendedores"
        description="Fuerza de ventas de QPack Importadora, S.A."
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo vendedor
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o correo…"
      />

      <DataTable
        ariaLabel="Listado de vendedores"
        columns={columns}
        rows={filtered}
        getRowId={(v) => v.id}
        emptyTitle="Sin vendedores"
        emptyDescription="No se encontraron vendedores con los filtros actuales."
        rowActions={[
          {
            key: "editar",
            label: "Editar",
            icon: Pencil,
            onSelect: (v) => {
              setEditing(v);
              setFormOpen(true);
            },
          },
          {
            key: "toggle",
            label: "Activar / Desactivar",
            icon: Power,
            onSelect: async (v) => {
              await setActivo(v.id, !v.activo);
              toast.success(v.activo ? "Vendedor desactivado" : "Vendedor activado", {
                description: v.nombre,
              });
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            onSelect: (v) => setDeleting(v),
          },
        ]}
      />

      <VendedorFormModal isOpen={formOpen} onOpenChange={setFormOpen} vendedor={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar vendedor?"
        description={`Se eliminará permanentemente a "${deleting?.nombre}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteVendedor(deleting.id);
          toast.success("Vendedor eliminado", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
