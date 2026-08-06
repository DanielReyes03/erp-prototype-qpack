"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { downloadCsv } from "@/lib/csv";
import { useDteStore } from "@/lib/store/dte";
import type { Dte } from "@/lib/seed/dte";
import { clienteDe } from "@/app/dte/_components/dte-helpers";

export default function LibroVentasPage() {
  const documentos = useDteStore((s) => s.documentos);
  const [search, setSearch] = useState("");

  const ventas = useMemo(
    () => documentos.filter((d) => d.tipo === "FACT" && d.estado === "certificado"),
    [documentos],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ventas;
    return ventas.filter((d) => clienteDe(d.clienteId)?.nombreComercial.toLowerCase().includes(q));
  }, [ventas, search]);

  const totales = filtered.reduce(
    (acc, d) => {
      const t = computeTotals(d.lineas);
      acc.base += t.baseGravable;
      acc.iva += t.iva;
      acc.total += t.total;
      return acc;
    },
    { base: 0, iva: 0, total: 0 },
  );

  const columns: DataTableColumn<Dte>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (d) => d.fechaCertificacion,
      cellClassName: "whitespace-nowrap",
      cell: (d) => <span className="font-data">{formatDate(d.fechaCertificacion)}</span>,
    },
    {
      key: "documento",
      header: "Documento",
      cell: (d) => <span className="font-data font-medium text-blue-700">{d.serie}-{d.numero}</span>,
    },
    {
      key: "cliente",
      header: "Cliente",
      cell: (d) => clienteDe(d.clienteId)?.nombreComercial ?? "—",
    },
    {
      key: "nit",
      header: "NIT",
      cellClassName: "whitespace-nowrap",
      cell: (d) => <span className="font-data">{clienteDe(d.clienteId)?.nit ?? "—"}</span>,
    },
    {
      key: "base",
      header: "Base gravable",
      align: "right",
      cell: (d) => <MoneyCell amount={computeTotals(d.lineas).baseGravable} currency={d.moneda} />,
    },
    {
      key: "iva",
      header: "IVA",
      align: "right",
      cell: (d) => <MoneyCell amount={computeTotals(d.lineas).iva} currency={d.moneda} />,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (d) => computeTotals(d.lineas).total,
      cell: (d) => <MoneyCell amount={computeTotals(d.lineas).total} currency={d.moneda} className="font-semibold text-slate-900" />,
    },
  ];

  function handleExport() {
    downloadCsv(
      "libro-ventas.csv",
      ["Fecha", "Documento", "Cliente", "NIT", "Base gravable", "IVA", "Total"],
      filtered.map((d) => {
        const t = computeTotals(d.lineas);
        return [
          formatDate(d.fechaCertificacion),
          `${d.serie}-${d.numero}`,
          clienteDe(d.clienteId)?.nombreComercial ?? "",
          clienteDe(d.clienteId)?.nit ?? "",
          t.baseGravable.toFixed(2),
          t.iva.toFixed(2),
          t.total.toFixed(2),
        ];
      }),
    );
  }

  return (
    <div>
      <PageHeader
        title="Libro de ventas"
        description="Detalle de facturas electrónicas certificadas, IVA débito fiscal"
        actions={
          <Button variant="secondary" onPress={handleExport}>
            <Download className="size-4" />
            Exportar CSV
          </Button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar cliente…" />

      <DataTable
        ariaLabel="Libro de ventas"
        columns={columns}
        rows={filtered}
        getRowId={(d) => d.id}
        pageSize={40}
        emptyTitle="Sin ventas registradas"
      />

      <div className="mt-4 flex justify-end gap-8 rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
        <div className="text-right">
          <p className="text-xs text-slate-500">Base gravable</p>
          <MoneyCell amount={totales.base} className="font-semibold text-slate-900" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">IVA débito</p>
          <MoneyCell amount={totales.iva} className="font-semibold text-slate-900" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <MoneyCell amount={totales.total} className="font-semibold text-blue-700" />
        </div>
      </div>
    </div>
  );
}
