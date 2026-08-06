"use client";

import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { CATALOGO_CUENTAS, type TipoCuenta } from "@/lib/seed/catalogo-cuentas";

interface FilaBalance {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  debe: number;
  haber: number;
  saldoDeudor: number;
  saldoAcreedor: number;
}

export default function BalanceSaldosPage() {
  const polizas = useContabilidadStore((s) => s.polizas);

  const filas = useMemo<FilaBalance[]>(() => {
    const acumulado = new Map<string, { debe: number; haber: number }>();
    for (const poliza of polizas) {
      for (const linea of poliza.lineas) {
        const actual = acumulado.get(linea.cuentaCodigo) ?? { debe: 0, haber: 0 };
        actual.debe += linea.debe;
        actual.haber += linea.haber;
        acumulado.set(linea.cuentaCodigo, actual);
      }
    }

    const filas: FilaBalance[] = [];
    for (const [codigo, { debe, haber }] of acumulado.entries()) {
      const cuenta = CATALOGO_CUENTAS.find((c) => c.codigo === codigo);
      if (!cuenta) continue;
      const neto = debe - haber;
      filas.push({
        codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        debe,
        haber,
        saldoDeudor: neto > 0 ? neto : 0,
        saldoAcreedor: neto < 0 ? -neto : 0,
      });
    }
    return filas.sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [polizas]);

  const totalDebe = filas.reduce((s, f) => s + f.debe, 0);
  const totalHaber = filas.reduce((s, f) => s + f.haber, 0);
  const totalSaldoDeudor = filas.reduce((s, f) => s + f.saldoDeudor, 0);
  const totalSaldoAcreedor = filas.reduce((s, f) => s + f.saldoAcreedor, 0);
  const cuadra = Math.abs(totalSaldoDeudor - totalSaldoAcreedor) < 0.05;

  const columns: DataTableColumn<FilaBalance>[] = [
    {
      key: "cuenta",
      header: "Cuenta",
      cell: (f) => (
        <div className="flex flex-col">
          <span>{f.nombre}</span>
          <span className="font-data text-xs text-slate-500">{f.codigo}</span>
        </div>
      ),
    },
    { key: "tipo", header: "Tipo", cell: (f) => f.tipo },
    { key: "debe", header: "Movimiento Debe", align: "right", cell: (f) => <MoneyCell amount={f.debe} /> },
    { key: "haber", header: "Movimiento Haber", align: "right", cell: (f) => <MoneyCell amount={f.haber} /> },
    {
      key: "saldoDeudor",
      header: "Saldo Deudor",
      align: "right",
      cell: (f) => (f.saldoDeudor > 0.005 ? <MoneyCell amount={f.saldoDeudor} /> : null),
    },
    {
      key: "saldoAcreedor",
      header: "Saldo Acreedor",
      align: "right",
      cell: (f) => (f.saldoAcreedor > 0.005 ? <MoneyCell amount={f.saldoAcreedor} /> : null),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Balance de saldos"
        description="Sumas y saldos de todas las cuentas con movimiento"
        actions={
          cuadra ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-medium text-[#059669]">
              <CheckCircle2 className="size-3.5" />
              Balance cuadrado
            </span>
          ) : null
        }
      />

      <DataTable
        ariaLabel="Balance de saldos"
        columns={columns}
        rows={filas}
        getRowId={(f) => f.codigo}
        pageSize={50}
        emptyTitle="Sin movimientos contables"
      />

      <div className="mt-4 flex justify-end gap-8 rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Debe</p>
          <MoneyCell amount={totalDebe} className="font-semibold text-slate-900" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total Haber</p>
          <MoneyCell amount={totalHaber} className="font-semibold text-slate-900" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Saldo Deudor</p>
          <MoneyCell amount={totalSaldoDeudor} className="font-semibold text-blue-700" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Saldo Acreedor</p>
          <MoneyCell amount={totalSaldoAcreedor} className="font-semibold text-blue-700" />
        </div>
      </div>
    </div>
  );
}
