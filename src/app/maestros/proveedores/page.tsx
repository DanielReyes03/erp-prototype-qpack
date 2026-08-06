"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Power, Trash2 } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { useProveedoresStore } from "@/lib/store/proveedores";
import type { Proveedor } from "@/lib/seed/proveedores";
import { DEPARTAMENTOS, MUNICIPIOS } from "@/lib/seed/geografia";
import { ProveedorFormModal } from "./_components/ProveedorFormModal";

function municipioNombre(id: string) {
  return MUNICIPIOS.find((m) => m.id === id)?.nombre ?? "—";
}
function departamentoNombre(id: string) {
  return DEPARTAMENTOS.find((d) => d.id === id)?.nombre ?? "—";
}

export default function ProveedoresPage() {
  const proveedores = useProveedoresStore((s) => s.proveedores);
  const setActivo = useProveedoresStore((s) => s.setActivo);
  const deleteProveedor = useProveedoresStore((s) => s.deleteProveedor);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | undefined>(undefined);
  const [deleting, setDeleting] = useState<Proveedor | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter(
      (p) =>
        p.nombreComercial.toLowerCase().includes(q) ||
        p.razonSocial.toLowerCase().includes(q) ||
        p.nit.toLowerCase().includes(q),
    );
  }, [proveedores, search]);

  const columns: DataTableColumn<Proveedor>[] = [
    {
      key: "nombre",
      header: "Proveedor",
      sortAccessor: (p) => p.nombreComercial,
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{p.nombreComercial}</span>
          <span className="text-xs text-slate-500">{p.razonSocial}</span>
        </div>
      ),
    },
    { key: "nit", header: "NIT", cellClassName: "whitespace-nowrap", cell: (p) => <span className="font-data">{p.nit}</span> },
    {
      key: "ubicacion",
      header: "Ubicación",
      cell: (p) => (
        <div className="flex flex-col">
          <span>{municipioNombre(p.municipioId)}</span>
          <span className="text-xs text-slate-500">{departamentoNombre(p.departamentoId)}</span>
        </div>
      ),
    },
    { key: "contacto", header: "Contacto", cell: (p) => p.contactoNombre },
    {
      key: "banco",
      header: "Banco",
      cell: (p) => (
        <div className="flex flex-col">
          <span>{p.datosBancarios.banco}</span>
          <span className="font-data text-xs text-slate-500">
            {p.datosBancarios.tipoCuenta} · {p.datosBancarios.moneda}
          </span>
        </div>
      ),
    },
    {
      key: "dias",
      header: "Días crédito",
      align: "right",
      sortAccessor: (p) => p.diasCredito,
      cell: (p) => <span className="font-data">{p.diasCredito}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (p) => <StatusChip status={p.activo ? "gen:activo" : "gen:inactivo"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Proveedores nacionales e internacionales de QPack Importadora, S.A."
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo proveedor
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, razón social o NIT…"
      />

      <DataTable
        ariaLabel="Listado de proveedores"
        columns={columns}
        rows={filtered}
        getRowId={(p) => p.id}
        emptyTitle="Sin proveedores"
        emptyDescription="No se encontraron proveedores con los filtros actuales."
        rowActions={[
          {
            key: "editar",
            label: "Editar",
            icon: Pencil,
            onSelect: (p) => {
              setEditing(p);
              setFormOpen(true);
            },
          },
          {
            key: "toggle",
            label: "Activar / Desactivar",
            icon: Power,
            onSelect: async (p) => {
              await setActivo(p.id, !p.activo);
              toast.success(p.activo ? "Proveedor desactivado" : "Proveedor activado", {
                description: p.nombreComercial,
              });
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            onSelect: (p) => setDeleting(p),
          },
        ]}
      />

      <ProveedorFormModal isOpen={formOpen} onOpenChange={setFormOpen} proveedor={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar proveedor?"
        description={`Se eliminará permanentemente "${deleting?.nombreComercial}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteProveedor(deleting.id);
          toast.success("Proveedor eliminado", { description: deleting.nombreComercial });
        }}
      />
    </div>
  );
}
