"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { cuentaDe } from "@/lib/seed/catalogo-cuentas";

interface FilaDiario {
  id: string;
  fecha: string;
  numero: string;
  concepto: string;
  cuentaCodigo: string;
  cuentaNombre: string;
  debe: number;
  haber: number;
}

const TIPO_LABEL: Record<string, string> = {
  venta: "Venta",
  compra: "Compra",
  cobro: "Cobro",
  pago: "Pago",
  gasto: "Gasto",
  manual: "Asiento manual",
};

export default function LibroDiarioPage() {
  const polizas = useContabilidadStore((s) => s.polizas);
  const [search, setSearch] = useState("");

  const filas = useMemo<FilaDiario[]>(() => {
    const rows: FilaDiario[] = [];
    for (const poliza of polizas) {
      for (const linea of poliza.lineas) {
        rows.push({
          id: `${poliza.id}-${linea.id}`,
          fecha: poliza.fecha,
          numero: poliza.numero,
          concepto: `${poliza.concepto} (${TIPO_LABEL[poliza.tipo] ?? poliza.tipo})`,
          cuentaCodigo: linea.cuentaCodigo,
          cuentaNombre: cuentaDe(linea.cuentaCodigo)?.nombre ?? linea.descripcion,
          debe: linea.debe,
          haber: linea.haber,
        });
      }
    }
    return rows.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [polizas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) =>
        f.concepto.toLowerCase().includes(q) ||
        f.cuentaNombre.toLowerCase().includes(q) ||
        f.numero.includes(q),
    );
  }, [filas, search]);

  const totalDebe = filtered.reduce((s, f) => s + f.debe, 0);
  const totalHaber = filtered.reduce((s, f) => s + f.haber, 0);

  const columns: DataTableColumn<FilaDiario>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (f) => f.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data text-xs">{formatDate(f.fecha)}</span>,
    },
    { key: "poliza", header: "Póliza", cell: (f) => <span className="font-data">{f.numero}</span> },
    { key: "concepto", header: "Concepto", cell: (f) => f.concepto },
    {
      key: "cuenta",
      header: "Cuenta",
      cell: (f) => (
        <div className="flex flex-col">
          <span>{f.cuentaNombre}</span>
          <span className="font-data text-xs text-slate-500">{f.cuentaCodigo}</span>
        </div>
      ),
    },
    {
      key: "debe",
      header: "Debe",
      align: "right",
      cell: (f) => (f.debe > 0 ? <MoneyCell amount={f.debe} /> : null),
    },
    {
      key: "haber",
      header: "Haber",
      align: "right",
      cell: (f) => (f.haber > 0 ? <MoneyCell amount={f.haber} /> : null),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Libro diario"
        description="Registro cronológico de todas las pólizas contables"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por concepto, cuenta o número de póliza…"
        actions={
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Debe: <span className="font-data font-medium text-slate-900">{totalDebe.toFixed(2)}</span>
            </span>
            <span>
              Haber: <span className="font-data font-medium text-slate-900">{totalHaber.toFixed(2)}</span>
            </span>
          </div>
        }
      />

      <DataTable
        ariaLabel="Libro diario"
        columns={columns}
        rows={filtered}
        getRowId={(f) => f.id}
        pageSize={40}
        emptyTitle="Sin movimientos contables"
      />
    </div>
  );
}
