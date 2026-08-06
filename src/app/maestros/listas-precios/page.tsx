"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { useClientesStore } from "@/lib/store/clientes";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import type { ListaPrecio } from "@/lib/seed/listas-precios";
import { ListaPrecioFormModal } from "./_components/ListaPrecioFormModal";
import { ListaPrecioDetalleModal } from "./_components/ListaPrecioDetalleModal";

export default function ListasPreciosPage() {
  const listas = useListasPreciosStore((s) => s.listas);
  const deleteLista = useListasPreciosStore((s) => s.deleteLista);
  const clientes = useClientesStore((s) => s.clientes);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ListaPrecio | undefined>(undefined);
  const [viewing, setViewing] = useState<ListaPrecio | undefined>(undefined);
  const [deleting, setDeleting] = useState<ListaPrecio | undefined>(undefined);

  const clientesPorLista = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clientes) map.set(c.listaPrecioId, (map.get(c.listaPrecioId) ?? 0) + 1);
    return map;
  }, [clientes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listas;
    return listas.filter((l) => l.nombre.toLowerCase().includes(q));
  }, [listas, search]);

  const columns: DataTableColumn<ListaPrecio>[] = [
    {
      key: "nombre",
      header: "Lista",
      sortAccessor: (l) => l.nombre,
      cell: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{l.nombre}</span>
          <span className="text-xs text-slate-500">{l.descripcion}</span>
        </div>
      ),
    },
    { key: "moneda", header: "Moneda", cell: (l) => l.moneda },
    {
      key: "productos",
      header: "Productos",
      align: "right",
      cell: () => <span className="font-data">{PRODUCTOS_SEED.length}</span>,
    },
    {
      key: "clientes",
      header: "Clientes asignados",
      align: "right",
      cell: (l) => <span className="font-data">{clientesPorLista.get(l.id) ?? 0}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Listas de precios"
        description="Cabeceras de precio y su detalle por producto"
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nueva lista
          </Button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar lista…" />

      <DataTable
        ariaLabel="Listado de listas de precios"
        columns={columns}
        rows={filtered}
        getRowId={(l) => l.id}
        emptyTitle="Sin listas de precios"
        onRowClick={(l) => setViewing(l)}
        rowActions={[
          {
            key: "detalle",
            label: "Ver / editar precios",
            icon: ListChecks,
            onSelect: (l) => setViewing(l),
          },
          {
            key: "editar",
            label: "Editar cabecera",
            icon: Pencil,
            onSelect: (l) => {
              setEditing(l);
              setFormOpen(true);
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            isDisabled: (l) => (clientesPorLista.get(l.id) ?? 0) > 0,
            onSelect: (l) => setDeleting(l),
          },
        ]}
      />

      <ListaPrecioFormModal isOpen={formOpen} onOpenChange={setFormOpen} lista={editing} />
      <ListaPrecioDetalleModal isOpen={!!viewing} onOpenChange={(o) => !o && setViewing(undefined)} lista={viewing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar lista de precios?"
        description={`Se eliminará permanentemente "${deleting?.nombre}" y su detalle de precios.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteLista(deleting.id);
          toast.success("Lista eliminada", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
