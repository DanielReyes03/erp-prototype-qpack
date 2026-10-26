"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Power, Trash2, Package } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { cn } from "@/lib/cn";
import { useProductosStore } from "@/lib/store/productos";
import { useInventarioStore } from "@/lib/store/inventario";
import { CATEGORIAS_PRODUCTO, type Producto } from "@/lib/seed/productos";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { ProductoFormModal } from "./_components/ProductoFormModal";

const CATEGORY_COLORS: Record<string, string> = {
  Resinas: "bg-blue-50 text-blue-700",
  Bolsas: "bg-[#EDE9FE] text-[#6D28D9]",
  Envases: "bg-[#D1FAE5] text-[#059669]",
  "Tapas y cierres": "bg-[#FEF3C7] text-[#D97706]",
  "Aditivos y colorantes": "bg-[#FCE7F3] text-[#BE185D]",
  "Film y empaque": "bg-slate-100 text-slate-700",
};

function ProductPlaceholder({ categoria }: { categoria: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
        CATEGORY_COLORS[categoria] ?? "bg-slate-100 text-slate-700",
      )}
      aria-hidden
    >
      <Package className="size-4" />
    </div>
  );
}

function ReorderDot({ existencia, puntoReorden }: { existencia: number; puntoReorden: number }) {
  const color =
    existencia <= puntoReorden
      ? "bg-[#DC2626]"
      : existencia <= puntoReorden * 1.5
        ? "bg-[#D97706]"
        : "bg-[#059669]";
  return <span className={cn("inline-block size-2 rounded-full", color)} aria-hidden />;
}

export default function ProductosPage() {
  const productos = useProductosStore((s) => s.productos);
  const setActivo = useProductosStore((s) => s.setActivo);
  const deleteProducto = useProductosStore((s) => s.deleteProducto);
  const getExistenciaTotal = useInventarioStore((s) => s.getExistenciaTotal);

  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | undefined>(undefined);
  const [deleting, setDeleting] = useState<Producto | undefined>(undefined);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter((p) => {
      const matchesSearch =
        !q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCat = !categoriaFilter || p.categoria === categoriaFilter;
      return matchesSearch && matchesCat;
    });
  }, [productos, search, categoriaFilter]);

  const columns: DataTableColumn<Producto>[] = [
    {
      key: "producto",
      header: "Producto",
      sortAccessor: (p) => p.nombre,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <ProductPlaceholder categoria={p.categoria} />
          <div className="flex min-w-0 flex-col">
            <span className="font-medium text-slate-900">{p.nombre}</span>
            <span className="font-data text-xs text-slate-500">{p.sku}</span>
          </div>
        </div>
      ),
    },
    { key: "categoria", header: "Categoría", sortAccessor: (p) => p.categoria, cell: (p) => p.categoria },
    { key: "um", header: "Unidad", cell: (p) => p.unidadMedida },
    {
      key: "proveedor",
      header: "Proveedor",
      cell: (p) => PROVEEDORES_SEED.find((pr) => pr.id === p.proveedorId)?.nombreComercial ?? "—",
    },
    {
      key: "costo",
      header: "Costo",
      align: "right",
      sortAccessor: (p) => p.costo,
      cell: (p) => <MoneyCell amount={p.costo} />,
    },
    {
      key: "precio",
      header: "Precio base",
      align: "right",
      sortAccessor: (p) => p.precioBase,
      cell: (p) => <MoneyCell amount={p.precioBase} />,
    },
    {
      key: "existencia",
      header: "Existencia",
      align: "right",
      sortAccessor: (p) => getExistenciaTotal(p.id),
      cell: (p) => {
        const existencia = getExistenciaTotal(p.id);
        return (
          <div className="flex items-center justify-end gap-2">
            <ReorderDot existencia={existencia} puntoReorden={p.puntoReorden} />
            <span className="font-data">{existencia.toLocaleString("en-US")}</span>
          </div>
        );
      },
    },
    {
      key: "stock",
      header: "Stock mín / máx",
      align: "right",
      sortAccessor: (p) => p.stockMinimo,
      cell: (p) => (
        <span className="font-data text-slate-500">
          {p.stockMinimo.toLocaleString("en-US")} / {p.stockMaximo.toLocaleString("en-US")}
        </span>
      ),
    },
    {
      key: "reorden",
      header: "Pto. reorden",
      align: "right",
      sortAccessor: (p) => p.puntoReorden,
      cell: (p) => <span className="font-data text-slate-500">{p.puntoReorden.toLocaleString("en-US")}</span>,
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
        title="Productos"
        description="Catálogo de resinas, bolsas, envases y accesorios plásticos"
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o SKU…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS_PRODUCTO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Listado de productos"
        columns={columns}
        rows={filtered}
        getRowId={(p) => p.id}
        emptyTitle="Sin productos"
        emptyDescription="No se encontraron productos con los filtros actuales."
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
              toast.success(p.activo ? "Producto desactivado" : "Producto activado", {
                description: p.nombre,
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

      <ProductoFormModal isOpen={formOpen} onOpenChange={setFormOpen} producto={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar producto?"
        description={`Se eliminará permanentemente "${deleting?.nombre}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteProducto(deleting.id);
          toast.success("Producto eliminado", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
