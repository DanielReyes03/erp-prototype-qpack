"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Power, Trash2, Warehouse, Store } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { KpiCard } from "@/components/patterns/KpiCard";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { useInventarioStore } from "@/lib/store/inventario";
import type { Locacion } from "@/lib/seed/locaciones";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/seed/geografia";
import { AlmacenFormModal } from "./_components/AlmacenFormModal";

function ubicacionDe(l: Locacion): string {
  const depto = DEPARTAMENTOS.find((d) => d.id === l.departamentoId)?.nombre ?? "—";
  const muni = municipiosDe(l.departamentoId).find((m) => m.id === l.municipioId)?.nombre ?? "—";
  return `${muni}, ${depto}`;
}

export default function AlmacenesPage() {
  const locaciones = useLocacionesStore((s) => s.locaciones);
  const setActivo = useLocacionesStore((s) => s.setActivo);
  const deleteLocacion = useLocacionesStore((s) => s.deleteLocacion);
  const existencias = useInventarioStore((s) => s.existencias);

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Locacion | undefined>(undefined);
  const [deleting, setDeleting] = useState<Locacion | undefined>(undefined);

  const unidadesPorLocacion = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of existencias) {
      map.set(e.locacionId, (map.get(e.locacionId) ?? 0) + e.cantidad);
    }
    return map;
  }, [existencias]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return locaciones.filter((l) => {
      const matchesSearch =
        !q ||
        l.nombre.toLowerCase().includes(q) ||
        l.codigo.toLowerCase().includes(q) ||
        l.responsable.toLowerCase().includes(q) ||
        l.direccion.toLowerCase().includes(q);
      const matchesTipo = !tipoFilter || l.tipo === tipoFilter;
      const matchesEstado =
        !estadoFilter ||
        (estadoFilter === "activo" && l.activo) ||
        (estadoFilter === "inactivo" && !l.activo);
      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [locaciones, search, tipoFilter, estadoFilter]);

  const totales = useMemo(
    () => ({
      total: locaciones.length,
      activos: locaciones.filter((l) => l.activo).length,
      bodegas: locaciones.filter((l) => l.tipo === "Bodega").length,
      sucursales: locaciones.filter((l) => l.tipo === "Sucursal").length,
    }),
    [locaciones],
  );

  const columns: DataTableColumn<Locacion>[] = [
    {
      key: "codigo",
      header: "Código",
      sortAccessor: (l) => l.codigo,
      cellClassName: "whitespace-nowrap",
      cell: (l) => <span className="font-data font-medium text-blue-700">{l.codigo}</span>,
    },
    {
      key: "nombre",
      header: "Almacén",
      sortAccessor: (l) => l.nombre,
      cell: (l) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{l.nombre}</span>
          <span className="text-xs text-slate-500">{l.direccion}</span>
        </div>
      ),
    },
    { key: "tipo", header: "Tipo", sortAccessor: (l) => l.tipo, cell: (l) => l.tipo },
    { key: "responsable", header: "Responsable", cell: (l) => l.responsable },
    { key: "ubicacion", header: "Ubicación", cell: (l) => ubicacionDe(l) },
    {
      key: "existencia",
      header: "Unidades en stock",
      align: "right",
      sortAccessor: (l) => unidadesPorLocacion.get(l.id) ?? 0,
      cell: (l) => (
        <span className="font-data text-slate-500">
          {(unidadesPorLocacion.get(l.id) ?? 0).toLocaleString("en-US")}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (l) => <StatusChip status={l.activo ? "gen:activo" : "gen:inactivo"} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Almacenes y bodegas"
        description="Control de bodegas, sucursales y ubicaciones de tránsito donde se maneja existencia"
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nuevo almacén
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Almacenes" value={String(totales.total)} icon={Warehouse} />
        <KpiCard label="Activos" value={String(totales.activos)} icon={Power} tone="success" />
        <KpiCard label="Bodegas" value={String(totales.bodegas)} icon={Warehouse} />
        <KpiCard label="Sucursales" value={String(totales.sucursales)} icon={Store} />
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código, nombre, responsable o dirección…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="Bodega">Bodega</option>
          <option value="Sucursal">Sucursal</option>
          <option value="Tránsito">Tránsito</option>
        </select>
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Listado de almacenes"
        columns={columns}
        rows={filtered}
        getRowId={(l) => l.id}
        emptyTitle="Sin almacenes"
        emptyDescription="No se encontraron almacenes con los filtros actuales."
        rowActions={[
          {
            key: "editar",
            label: "Editar",
            icon: Pencil,
            onSelect: (l) => {
              setEditing(l);
              setFormOpen(true);
            },
          },
          {
            key: "toggle",
            label: "Activar / Desactivar",
            icon: Power,
            onSelect: async (l) => {
              await setActivo(l.id, !l.activo);
              toast.success(l.activo ? "Almacén desactivado" : "Almacén activado", {
                description: l.nombre,
              });
            },
          },
          {
            key: "eliminar",
            label: "Eliminar",
            icon: Trash2,
            isDanger: true,
            onSelect: (l) => setDeleting(l),
          },
        ]}
      />

      <AlmacenFormModal isOpen={formOpen} onOpenChange={setFormOpen} almacen={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar almacén?"
        description={
          deleting && (unidadesPorLocacion.get(deleting.id) ?? 0) > 0
            ? `"${deleting.nombre}" tiene existencia registrada. Elimínalo solo si ya no se usará; los movimientos históricos se conservan.`
            : `Se eliminará permanentemente "${deleting?.nombre}". Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await deleteLocacion(deleting.id);
          toast.success("Almacén eliminado", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
