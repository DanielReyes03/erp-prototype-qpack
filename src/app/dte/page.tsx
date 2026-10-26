"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDateTime } from "@/lib/format";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useDteStore } from "@/lib/store/dte";
import type { Dte } from "@/lib/seed/dte";
import { clienteDe, TIPO_DTE_LABEL } from "./_components/dte-helpers";

const ESTADOS = [
  { id: "certificado", label: "Certificado" },
  { id: "rechazado", label: "Rechazado" },
  { id: "anulado", label: "Anulado" },
];

export default function DtePage() {
  const documentos = useDteStore((s) => s.documentos);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documentos.filter((d) => {
      const cliente = clienteDe(d.clienteId);
      const matchesSearch =
        !q ||
        d.numero.includes(q) ||
        d.uuid.toLowerCase().includes(q) ||
        cliente?.nombreComercial.toLowerCase().includes(q);
      const matchesEstado = !estadoFilter || d.estado === estadoFilter;
      const matchesTipo = !tipoFilter || d.tipo === tipoFilter;
      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [documentos, search, estadoFilter, tipoFilter]);

  const columns: DataTableColumn<Dte>[] = [
    {
      key: "documento",
      header: "Documento",
      cellClassName: "whitespace-nowrap",
      cell: (d) => (
        <div className="flex flex-col">
          <span className="font-data font-medium text-blue-700">
            {d.serie}-{d.numero}
          </span>
          <span className="text-xs text-slate-500">{TIPO_DTE_LABEL[d.tipo]}</span>
        </div>
      ),
    },
    { key: "cliente", header: "Cliente", cell: (d) => clienteDe(d.clienteId)?.nombreComercial ?? "—" },
    {
      key: "fecha",
      header: "Certificación",
      sortAccessor: (d) => d.fechaCertificacion,
      cellClassName: "whitespace-nowrap",
      cell: (d) => <span className="font-data text-xs">{formatDateTime(d.fechaCertificacion)}</span>,
    },
    { key: "ov", header: "Orden de venta", cell: (d) => d.ordenVentaId ?? "—" },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (d) => computeTotals(d.lineas).total,
      cell: (d) => <MoneyCell amount={computeTotals(d.lineas).total} currency={d.moneda} />,
    },
    { key: "estado", header: "Estado", cell: (d) => <StatusChip status={`dte:${d.estado}`} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Documentos DTE"
        description="Facturas, notas de crédito y notas de débito certificadas ante la SAT. Las facturas se emiten al cerrar una orden de venta."
        actions={
          <Button variant="secondary" onPress={() => router.push("/dte/nuevo")}>
            <FilePlus2 className="size-4" />
            Nota de crédito / débito
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número, UUID o cliente…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="FACT">Factura</option>
          <option value="NCRE">Nota de crédito</option>
          <option value="NDEB">Nota de débito</option>
        </select>
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
        ariaLabel="Listado de documentos DTE"
        columns={columns}
        rows={filtered}
        getRowId={(d) => d.id}
        emptyTitle="Sin documentos DTE"
        emptyDescription="No se encontraron documentos con los filtros actuales."
        onRowClick={(d) => router.push(`/dte/${d.id}`)}
      />
    </div>
  );
}
