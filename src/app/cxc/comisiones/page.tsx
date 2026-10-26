"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { HandCoins, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";

interface FilaComision {
  vendedorId: string;
  nombre: string;
  zona: string;
  porcentaje: number;
  totalVendido: number;
  totalComision: number;
  facturas: number;
}

export default function ComisionesPage() {
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);

  const filas = useMemo<FilaComision[]>(() => {
    // Toda orden que ya generó factura (facturada, programada o entregada).
    const facturadas = ordenes.filter(
      (o) => o.estado === "facturado" || o.estado === "programado" || o.estado === "entregado",
    );
    return VENDEDORES_SEED.map((v) => {
      const propias = facturadas.filter((o) => o.vendedorId === v.id);
      const totalVendido = propias.reduce((s, o) => s + computeTotals(o.lineas).total, 0);
      return {
        vendedorId: v.id,
        nombre: v.nombre,
        zona: v.zonaAsignada,
        porcentaje: v.porcentajeComision,
        totalVendido,
        totalComision: (totalVendido * v.porcentajeComision) / 100,
        facturas: propias.length,
      };
    })
      .filter((f) => f.facturas > 0)
      .sort((a, b) => b.totalComision - a.totalComision);
  }, [ordenes]);

  const totalComisiones = filas.reduce((s, f) => s + f.totalComision, 0);
  const totalVendido = filas.reduce((s, f) => s + f.totalVendido, 0);

  const columns: DataTableColumn<FilaComision>[] = [
    { key: "vendedor", header: "Vendedor", cell: (f) => f.nombre },
    { key: "zona", header: "Zona", cell: (f) => f.zona },
    {
      key: "facturas",
      header: "Facturas",
      align: "right",
      cell: (f) => <span className="font-data">{f.facturas}</span>,
    },
    {
      key: "vendido",
      header: "Total vendido",
      align: "right",
      sortAccessor: (f) => f.totalVendido,
      cell: (f) => <MoneyCell amount={f.totalVendido} />,
    },
    {
      key: "pct",
      header: "% Comisión",
      align: "right",
      cell: (f) => <span className="font-data">{f.porcentaje.toFixed(2)}%</span>,
    },
    {
      key: "comision",
      header: "Comisión",
      align: "right",
      sortAccessor: (f) => f.totalComision,
      cell: (f) => <MoneyCell amount={f.totalComision} className="font-semibold text-blue-700" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Comisiones por vendedor"
        description="Calculadas sobre el total facturado (DTE certificados) por vendedor"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Total vendido facturado" value={formatMoney(totalVendido)} icon={TrendingUp} />
        <KpiCard label="Comisiones a pagar" value={formatMoney(totalComisiones)} icon={HandCoins} />
      </div>

      <DataTable
        ariaLabel="Comisiones por vendedor"
        columns={columns}
        rows={filas}
        getRowId={(f) => f.vendedorId}
        emptyTitle="Sin comisiones"
        emptyDescription="Ningún vendedor tiene ventas facturadas todavía."
      />
    </div>
  );
}
