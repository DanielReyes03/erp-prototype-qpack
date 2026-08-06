"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useInventarioStore } from "@/lib/store/inventario";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import { Boxes, AlertTriangle, TrendingDown } from "lucide-react";
import type { ExistenciaLocacion } from "@/lib/seed/kardex";

function productoDe(id: string) {
  return PRODUCTOS_SEED.find((p) => p.id === id);
}
function locacionDe(id: string) {
  return LOCACIONES_SEED.find((l) => l.id === id);
}

function ReorderDot({ existencia, puntoReorden }: { existencia: number; puntoReorden: number }) {
  const color =
    existencia <= puntoReorden
      ? "bg-[#DC2626]"
      : existencia <= puntoReorden * 1.5
        ? "bg-[#D97706]"
        : "bg-[#059669]";
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", color)} aria-hidden />;
}

export default function ExistenciasPage() {
  const existencias = useInventarioStore((s) => s.existencias);
  const [search, setSearch] = useState("");
  const [locacionFilter, setLocacionFilter] = useState("");
  const [onlyBajoReorden, setOnlyBajoReorden] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return existencias
      .map((e) => ({ e, producto: productoDe(e.productoId), locacion: locacionDe(e.locacionId) }))
      .filter(({ producto, locacion }) => producto && locacion)
      .filter(({ producto }) => !q || producto!.nombre.toLowerCase().includes(q) || producto!.sku.toLowerCase().includes(q))
      .filter(({ locacion }) => !locacionFilter || locacion!.id === locacionFilter)
      .filter(({ e, producto }) => !onlyBajoReorden || e.cantidad <= producto!.puntoReorden);
  }, [existencias, search, locacionFilter, onlyBajoReorden]);

  const valorTotal = useMemo(
    () => existencias.reduce((sum, e) => sum + e.cantidad * e.costoPromedio, 0),
    [existencias],
  );
  const bajoReorden = useMemo(
    () =>
      existencias.filter((e) => {
        const p = productoDe(e.productoId);
        return p && e.cantidad <= p.puntoReorden;
      }).length,
    [existencias],
  );

  const columns: DataTableColumn<{ e: ExistenciaLocacion; producto?: (typeof PRODUCTOS_SEED)[number]; locacion?: (typeof LOCACIONES_SEED)[number] }>[] = [
    {
      key: "producto",
      header: "Producto",
      sortAccessor: (r) => r.producto?.nombre ?? "",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{r.producto?.nombre}</span>
          <span className="font-data text-xs text-slate-500">{r.producto?.sku}</span>
        </div>
      ),
    },
    {
      key: "locacion",
      header: "Locación",
      sortAccessor: (r) => r.locacion?.nombre ?? "",
      cell: (r) => r.locacion?.nombre,
    },
    {
      key: "cantidad",
      header: "Existencia",
      align: "right",
      sortAccessor: (r) => r.e.cantidad,
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <ReorderDot existencia={r.e.cantidad} puntoReorden={r.producto?.puntoReorden ?? 0} />
          <span className="font-data">{r.e.cantidad.toLocaleString("en-US")}</span>
        </div>
      ),
    },
    {
      key: "costo",
      header: "Costo promedio",
      align: "right",
      sortAccessor: (r) => r.e.costoPromedio,
      cell: (r) => <MoneyCell amount={r.e.costoPromedio} />,
    },
    {
      key: "valor",
      header: "Valor en existencia",
      align: "right",
      sortAccessor: (r) => r.e.cantidad * r.e.costoPromedio,
      cell: (r) => <MoneyCell amount={r.e.cantidad * r.e.costoPromedio} />,
    },
    {
      key: "reorden",
      header: "Pto. reorden",
      align: "right",
      cell: (r) => <span className="font-data text-slate-500">{r.producto?.puntoReorden}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Existencias"
        description="Inventario disponible por producto y locación, valorizado a costo promedio ponderado"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Valor total de inventario" value={formatMoney(valorTotal)} icon={Boxes} />
        <KpiCard label="Renglones bajo punto de reorden" value={String(bajoReorden)} icon={AlertTriangle} />
        <KpiCard
          label="Locaciones activas"
          value={String(LOCACIONES_SEED.filter((l) => l.activo).length)}
          icon={TrendingDown}
        />
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por producto o SKU…"
        actions={
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlyBajoReorden}
              onChange={(e) => setOnlyBajoReorden(e.target.checked)}
              className="size-3.5 accent-blue-700"
            />
            Solo bajo punto de reorden
          </label>
        }
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={locacionFilter}
          onChange={(e) => setLocacionFilter(e.target.value)}
        >
          <option value="">Todas las locaciones</option>
          {LOCACIONES_SEED.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Existencias por producto y locación"
        columns={columns}
        rows={rows}
        getRowId={(r) => `${r.e.productoId}::${r.e.locacionId}`}
        emptyTitle="Sin existencias"
        emptyDescription="No se encontraron existencias con los filtros actuales."
      />
    </div>
  );
}
