"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import type { FacturaProveedor } from "@/lib/seed/facturas-proveedor";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";

function proveedorDe(id: string) {
  return PROVEEDORES_SEED.find((p) => p.id === id);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

interface FilaCompra {
  factura: FacturaProveedor;
  base: number;
  iva: number;
}

export default function LibroComprasPage() {
  const facturas = useFacturasProveedorStore((s) => s.facturas);
  const [search, setSearch] = useState("");

  const filas = useMemo<FilaCompra[]>(
    () =>
      facturas.map((f) => {
        const base = round2(f.monto / 1.12);
        return { factura: f, base, iva: round2(f.monto - base) };
      }),
    [facturas],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter((f) => proveedorDe(f.factura.proveedorId)?.nombreComercial.toLowerCase().includes(q));
  }, [filas, search]);

  const totales = filtered.reduce(
    (acc, f) => {
      acc.base += f.base;
      acc.iva += f.iva;
      acc.total += f.factura.monto;
      return acc;
    },
    { base: 0, iva: 0, total: 0 },
  );

  const columns: DataTableColumn<FilaCompra>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (f) => f.factura.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data">{formatDate(f.factura.fecha)}</span>,
    },
    {
      key: "factura",
      header: "Factura",
      cell: (f) => <span className="font-data font-medium text-blue-700">{f.factura.numeroFactura}</span>,
    },
    {
      key: "proveedor",
      header: "Proveedor",
      cell: (f) => proveedorDe(f.factura.proveedorId)?.nombreComercial ?? "—",
    },
    {
      key: "nit",
      header: "NIT",
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data">{proveedorDe(f.factura.proveedorId)?.nit ?? "—"}</span>,
    },
    {
      key: "base",
      header: "Base gravable",
      align: "right",
      cell: (f) => <MoneyCell amount={f.base} currency={f.factura.moneda} />,
    },
    {
      key: "iva",
      header: "IVA",
      align: "right",
      cell: (f) => <MoneyCell amount={f.iva} currency={f.factura.moneda} />,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (f) => f.factura.monto,
      cell: (f) => <MoneyCell amount={f.factura.monto} currency={f.factura.moneda} className="font-semibold text-slate-900" />,
    },
  ];

  function handleExport() {
    downloadCsv(
      "libro-compras.csv",
      ["Fecha", "Factura", "Proveedor", "NIT", "Base gravable", "IVA", "Total"],
      filtered.map((f) => [
        formatDate(f.factura.fecha),
        f.factura.numeroFactura,
        proveedorDe(f.factura.proveedorId)?.nombreComercial ?? "",
        proveedorDe(f.factura.proveedorId)?.nit ?? "",
        f.base.toFixed(2),
        f.iva.toFixed(2),
        f.factura.monto.toFixed(2),
      ]),
    );
  }

  return (
    <div>
      <PageHeader
        title="Libro de compras"
        description="Detalle de facturas de proveedores, IVA crédito fiscal"
        actions={
          <Button variant="secondary" onPress={handleExport}>
            <Download className="size-4" />
            Exportar CSV
          </Button>
        }
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar proveedor…" />

      <DataTable
        ariaLabel="Libro de compras"
        columns={columns}
        rows={filtered}
        getRowId={(f) => f.factura.id}
        pageSize={40}
        emptyTitle="Sin compras registradas"
      />

      <div className="mt-4 flex justify-end gap-8 rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
        <div className="text-right">
          <p className="text-xs text-slate-500">Base gravable</p>
          <MoneyCell amount={totales.base} className="font-semibold text-slate-900" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">IVA crédito</p>
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
