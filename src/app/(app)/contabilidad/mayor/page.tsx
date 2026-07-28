"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { movimientosMayor, cuentasContables } from "@/lib/mock";
import type { MovimientoMayor } from "@/types";

export default function LibroMayorPage() {
  const loading = useMockLoading();

  const columns: DataTableColumn<MovimientoMayor>[] = [
    {
      id: "cuenta",
      header: "Cuenta",
      cell: (m) => {
        const cuenta = cuentasContables.find((c) => c.id === m.cuentaId);
        return cuenta ? `${cuenta.codigo} · ${cuenta.nombre}` : m.cuentaId;
      },
    },
    { id: "fecha", header: "Fecha", cell: (m) => formatDate(m.fecha) },
    { id: "poliza", header: "Poliza", cell: (m) => <span className="font-medium">{m.polizaFolio}</span> },
    { id: "concepto", header: "Concepto", cell: (m) => m.concepto },
    { id: "debe", header: "Debe", cell: (m) => (m.debe > 0 ? formatCurrency(m.debe) : "-"), className: "text-right" },
    { id: "haber", header: "Haber", cell: (m) => (m.haber > 0 ? formatCurrency(m.haber) : "-"), className: "text-right" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Libro mayor" description="Movimientos contabilizados agrupados por cuenta." />

      <DataTable
        data={movimientosMayor}
        getRowId={(m) => m.id}
        loading={loading}
        pageSize={15}
        searchPlaceholder="Buscar por poliza o concepto..."
        searchFn={(m, q) => m.polizaFolio.toLowerCase().includes(q) || m.concepto.toLowerCase().includes(q)}
        filters={[{ id: "cuentaId", label: "Cuenta", options: cuentasContables.map((c) => ({ label: `${c.codigo} · ${c.nombre}`, value: c.id })) }]}
        columns={columns}
        exportFileName="libro_mayor"
        exportRow={(m) => ({
          Cuenta: cuentasContables.find((c) => c.id === m.cuentaId)?.nombre ?? "",
          Fecha: m.fecha,
          Poliza: m.polizaFolio,
          Debe: m.debe,
          Haber: m.haber,
        })}
        emptyTitle="Sin movimientos"
        emptyDescription="No hay movimientos en el libro mayor con estos filtros."
      />
    </div>
  );
}
