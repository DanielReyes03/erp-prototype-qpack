"use client";

import { useMemo, useState } from "react";
import { Select, ListBox, Label } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { EmptyState } from "@/components/patterns/EmptyState";
import { formatDate } from "@/lib/format";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { CATALOGO_CUENTAS } from "@/lib/seed/catalogo-cuentas";

interface FilaMayor {
  id: string;
  fecha: string;
  numero: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
}

const CUENTAS_IMPUTABLES = CATALOGO_CUENTAS.filter((c) => c.imputable);

export default function LibroMayorPage() {
  const polizas = useContabilidadStore((s) => s.polizas);
  const [cuentaCodigo, setCuentaCodigo] = useState<string>(CUENTAS_IMPUTABLES[0]?.codigo ?? "");

  const cuenta = CATALOGO_CUENTAS.find((c) => c.codigo === cuentaCodigo);
  const esNaturalezaDeudora = cuenta?.tipo === "Activo" || cuenta?.tipo === "Costo" || cuenta?.tipo === "Gasto";

  const filas = useMemo<FilaMayor[]>(() => {
    const movimientos = polizas
      .flatMap((p) =>
        p.lineas
          .filter((l) => l.cuentaCodigo === cuentaCodigo)
          .map((l) => ({ fecha: p.fecha, numero: p.numero, concepto: p.concepto, debe: l.debe, haber: l.haber })),
      )
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    let saldo = 0;
    return movimientos.map((m, i) => {
      saldo += esNaturalezaDeudora ? m.debe - m.haber : m.haber - m.debe;
      return { id: `${cuentaCodigo}-${i}`, ...m, saldo };
    });
  }, [polizas, cuentaCodigo, esNaturalezaDeudora]);

  const totalDebe = filas.reduce((s, f) => s + f.debe, 0);
  const totalHaber = filas.reduce((s, f) => s + f.haber, 0);
  const saldoFinal = filas.at(-1)?.saldo ?? 0;

  const columns: DataTableColumn<FilaMayor>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data text-xs">{formatDate(f.fecha)}</span>,
    },
    { key: "poliza", header: "Póliza", cell: (f) => <span className="font-data">{f.numero}</span> },
    { key: "concepto", header: "Concepto", cell: (f) => f.concepto },
    { key: "debe", header: "Debe", align: "right", cell: (f) => (f.debe > 0 ? <MoneyCell amount={f.debe} /> : null) },
    { key: "haber", header: "Haber", align: "right", cell: (f) => (f.haber > 0 ? <MoneyCell amount={f.haber} /> : null) },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      cell: (f) => <MoneyCell amount={f.saldo} className="font-medium text-slate-900" />,
    },
  ];

  return (
    <div>
      <PageHeader title="Libro mayor" description="Movimientos y saldo acumulado por cuenta contable" />

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
        <Select
          className="flex max-w-md flex-col gap-1"
          value={cuentaCodigo}
          onChange={(k) => k && setCuentaCodigo(String(k))}
        >
          <Label>Cuenta contable</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {CUENTAS_IMPUTABLES.map((c) => (
                <ListBox.Item key={c.codigo} id={c.codigo} textValue={`${c.codigo} ${c.nombre}`}>
                  <span className="font-data text-xs text-slate-500">{c.codigo}</span> {c.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {filas.length === 0 ? (
        <EmptyState
          size="page"
          title="Sin movimientos"
          description="Esta cuenta no registra movimientos en el período."
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
              <p className="text-xs text-slate-500">Total Debe</p>
              <MoneyCell amount={totalDebe} className="text-lg font-semibold text-slate-900" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
              <p className="text-xs text-slate-500">Total Haber</p>
              <MoneyCell amount={totalHaber} className="text-lg font-semibold text-slate-900" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
              <p className="text-xs text-slate-500">Saldo final</p>
              <MoneyCell amount={saldoFinal} className="text-lg font-semibold text-blue-700" />
            </div>
          </div>
          <DataTable
            ariaLabel="Libro mayor de la cuenta seleccionada"
            columns={columns}
            rows={filas}
            getRowId={(f) => f.id}
            pageSize={40}
            emptyTitle="Sin movimientos"
          />
        </>
      )}
    </div>
  );
}
