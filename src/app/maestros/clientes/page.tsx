"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Power, Trash2 } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { useClientesStore } from "@/lib/store/clientes";
import type { Cliente } from "@/lib/seed/clientes";
import { DEPARTAMENTOS, MUNICIPIOS } from "@/lib/seed/geografia";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { ClienteFormModal } from "./_components/ClienteFormModal";

function departamentoNombre(id: string) {
  return DEPARTAMENTOS.find((d) => d.id === id)?.nombre ?? "—";
}
function municipioNombre(id: string) {
  return MUNICIPIOS.find((m) => m.id === id)?.nombre ?? "—";
}
function vendedorNombre(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id)?.nombre ?? "—";
}

export default function ClientesPage() {
  const clientes = useClientesStore((s) => s.clientes);
  const setActivo = useClientesStore((s) => s.setActivo);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  const [search, setSearch] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clientes.filter((c) => {
      const matchesSearch =
        !q ||
        c.nombreComercial.toLowerCase().includes(q) ||
        c.razonSocial.toLowerCase().includes(q) ||
        c.nit.toLowerCase().includes(q);
      const matchesDept = !departamentoFilter || c.departamentoId === departamentoFilter;
      return matchesSearch && matchesDept;
    });
  }, [clientes, search, departamentoFilter]);

  const columns: DataTableColumn<Cliente>[] = [
    {
      key: "nombre",
      header: "Cliente",
      sortAccessor: (c) => c.nombreComercial,
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{c.nombreComercial}</span>
          <span className="text-xs text-slate-500">{c.razonSocial}</span>
        </div>
      ),
    },
    {
      key: "nit",
      header: "NIT",
      sortAccessor: (c) => c.nit,
      cellClassName: "whitespace-nowrap",
      cell: (c) => <span className="font-data">{c.nit}</span>,
    },
    {
      key: "ubicacion",
      header: "Ubicación",
      cell: (c) => (
        <div className="flex flex-col">
          <span>{municipioNombre(c.municipioId)}</span>
          <span className="text-xs text-slate-500">{departamentoNombre(c.departamentoId)}</span>
        </div>
      ),
    },
    {
      key: "vendedor",
      header: "Vendedor",
      cell: (c) => vendedorNombre(c.vendedorId),
    },
    {
      key: "credito",
      header: "Límite de crédito",
      align: "right",
      sortAccessor: (c) => c.limiteCredito,
      cell: (c) => <MoneyCell amount={c.limiteCredito} />,
    },
    {
      key: "dias",
      header: "Días crédito",
      align: "right",
      sortAccessor: (c) => c.diasCredito,
      cell: (c) => <span className="font-data">{c.diasCredito}</span>,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (c) => <StatusChip status={c.activo ? "gen:activo" : "gen:inactivo"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cartera de clientes de QPack Importadora, S.A."
        actions={
          <Button
            onPress={() => {
              setEditingCliente(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, razón social o NIT…"
      >
        <select
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
          value={departamentoFilter}
          onChange={(e) => setDepartamentoFilter(e.target.value)}
        >
          <option value="">Todos los departamentos</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Listado de clientes"
        columns={columns}
        rows={filtered}
        getRowId={(c) => c.id}
        emptyTitle="Sin clientes"
        emptyDescription="No se encontraron clientes con los filtros actuales."
        rowActions={[
          {
            key: "editar",
            label: "Editar",
            icon: Pencil,
            onSelect: (c) => {
              setEditingCliente(c);
              setFormOpen(true);
            },
          },
          {
            key: "toggle",
            label: "Activar / Desactivar",
            icon: Power,
            onSelect: async (c) => {
              await setActivo(c.id, !c.activo);
              toast.success(c.activo ? "Cliente desactivado" : "Cliente activado", {
                description: c.nombreComercial,
              });
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            onSelect: (c) => setDeletingCliente(c),
          },
        ]}
      />

      <ClienteFormModal isOpen={formOpen} onOpenChange={setFormOpen} cliente={editingCliente} />

      <ConfirmDialog
        isOpen={!!deletingCliente}
        onOpenChange={(open) => !open && setDeletingCliente(undefined)}
        status="danger"
        title="¿Eliminar cliente?"
        description={`Se eliminará permanentemente "${deletingCliente?.nombreComercial}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deletingCliente) return;
          await deleteCliente(deletingCliente.id);
          toast.success("Cliente eliminado", { description: deletingCliente.nombreComercial });
        }}
      />
    </div>
  );
}
