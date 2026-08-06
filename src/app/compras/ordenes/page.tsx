"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDate } from "@/lib/format";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import type { OrdenCompra } from "@/lib/seed/ordenes-compra";
import { proveedorDe, totalOrden } from "./_components/oc-helpers";

const ESTADOS = [
  { id: "borrador", label: "Borrador" },
  { id: "confirmada", label: "Confirmada" },
  { id: "recibida-parcial", label: "Recepción parcial" },
  { id: "recibida-total", label: "Recibida" },
  { id: "facturada", label: "Facturada" },
  { id: "anulada", label: "Anulada" },
];

export default function OrdenesCompraPage() {
  const ordenes = useOrdenesCompraStore((s) => s.ordenes);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ordenes.filter((o) => {
      const proveedor = proveedorDe(o.proveedorId);
      const matchesSearch =
        !q || o.id.toLowerCase().includes(q) || proveedor?.nombreComercial.toLowerCase().includes(q);
      const matchesEstado = !estadoFilter || o.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [ordenes, search, estadoFilter]);

  const columns: DataTableColumn<OrdenCompra>[] = [
    {
      key: "id",
      header: "Orden",
      sortAccessor: (o) => o.id,
      cellClassName: "whitespace-nowrap",
      cell: (o) => <span className="font-data font-medium text-blue-700">{o.id}</span>,
    },
    { key: "proveedor", header: "Proveedor", cell: (o) => proveedorDe(o.proveedorId)?.nombreComercial ?? "—" },
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (o) => o.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (o) => <span className="font-data">{formatDate(o.fecha)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (o) => totalOrden(o),
      cell: (o) => <MoneyCell amount={totalOrden(o)} currency={o.moneda} />,
    },
    { key: "estado", header: "Estado", cell: (o) => <StatusChip status={`oc:${o.estado}`} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Órdenes de compra"
        description="Ciclo completo: confirmación, recepción de mercadería y facturación del proveedor"
        actions={
          <Button onPress={() => router.push("/compras/ordenes/nueva")}>
            <Plus className="size-4" />
            Nueva orden
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número de orden o proveedor…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Listado de órdenes de compra"
        columns={columns}
        rows={filtered}
        getRowId={(o) => o.id}
        emptyTitle="Sin órdenes de compra"
        emptyDescription="No se encontraron órdenes con los filtros actuales."
        onRowClick={(o) => router.push(`/compras/ordenes/${o.id}`)}
      />
    </div>
  );
}
