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
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useCotizacionesStore } from "@/lib/store/cotizaciones";
import type { Cotizacion } from "@/lib/seed/cotizaciones";
import { clienteDe, vendedorDe } from "./_components/cot-helpers";

const ESTADOS = [
  { id: "borrador", label: "Borrador" },
  { id: "enviada", label: "Enviada" },
  { id: "aceptada", label: "Aceptada" },
  { id: "rechazada", label: "Rechazada" },
  { id: "vencida", label: "Vencida" },
  { id: "convertida", label: "Convertida a pedido" },
];

export default function CotizacionesPage() {
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cotizaciones.filter((c) => {
      const cliente = clienteDe(c.clienteId);
      const matchesSearch =
        !q || c.id.toLowerCase().includes(q) || cliente?.nombreComercial.toLowerCase().includes(q);
      const matchesEstado = !estadoFilter || c.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [cotizaciones, search, estadoFilter]);

  const columns: DataTableColumn<Cotizacion>[] = [
    {
      key: "id",
      header: "Cotización",
      sortAccessor: (c) => c.id,
      cellClassName: "whitespace-nowrap",
      cell: (c) => <span className="font-data font-medium text-blue-700">{c.id}</span>,
    },
    { key: "cliente", header: "Cliente", cell: (c) => clienteDe(c.clienteId)?.nombreComercial ?? "—" },
    { key: "vendedor", header: "Vendedor", cell: (c) => vendedorDe(c.vendedorId)?.nombre ?? "—" },
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (c) => c.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (c) => <span className="font-data">{formatDate(c.fecha)}</span>,
    },
    {
      key: "validez",
      header: "Válida hasta",
      cellClassName: "whitespace-nowrap",
      cell: (c) => <span className="font-data">{formatDate(c.fechaValidez)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (c) => computeTotals(c.lineas).total,
      cell: (c) => <MoneyCell amount={computeTotals(c.lineas).total} currency={c.moneda} />,
    },
    { key: "estado", header: "Estado", cell: (c) => <StatusChip status={`cot:${c.estado}`} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Cotizaciones"
        description="Propuestas comerciales enviadas a clientes"
        actions={
          <Button onPress={() => router.push("/ventas/cotizaciones/nueva")}>
            <Plus className="size-4" />
            Nueva cotización
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número o cliente…"
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
        ariaLabel="Listado de cotizaciones"
        columns={columns}
        rows={filtered}
        getRowId={(c) => c.id}
        emptyTitle="Sin cotizaciones"
        emptyDescription="No se encontraron cotizaciones con los filtros actuales."
        onRowClick={(c) => router.push(`/ventas/cotizaciones/${c.id}`)}
      />
    </div>
  );
}
