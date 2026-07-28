"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate, formatNumber } from "@/lib/format";
import { kardex, productos, bodegas } from "@/lib/mock";
import type { MovimientoKardex } from "@/types";

const tiposSalida = ["Salida por venta", "Ajuste negativo", "Transferencia salida"];

export default function SalidasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<MovimientoKardex | null>(null);
  const salidas = kardex.filter((k) => tiposSalida.includes(k.tipo));

  const columns: DataTableColumn<MovimientoKardex>[] = [
    { id: "fecha", header: "Fecha", cell: (k) => formatDate(k.fecha) },
    { id: "documento", header: "Documento", cell: (k) => <span className="font-medium">{k.documentoReferencia}</span> },
    { id: "tipo", header: "Tipo", cell: (k) => <Badge variant="outline">{k.tipo}</Badge> },
    { id: "producto", header: "Producto", cell: (k) => productos.find((p) => p.id === k.productoId)?.nombre ?? k.productoId },
    { id: "bodega", header: "Bodega", cell: (k) => bodegas.find((b) => b.id === k.bodegaId)?.nombre ?? "-" },
    { id: "cantidad", header: "Cantidad", cell: (k) => <span className="font-medium text-red-600 dark:text-red-400">{formatNumber(k.cantidad)}</span>, className: "text-right" },
    { id: "usuario", header: "Usuario", cell: (k) => k.usuario },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Salidas de inventario" description="Movimientos que reducen las existencias: ventas, ajustes negativos y transferencias enviadas." />

      <DataTable
        data={salidas}
        getRowId={(k) => k.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por documento..."
        searchFn={(k, q) => k.documentoReferencia.toLowerCase().includes(q)}
        filters={[
          { id: "tipo", label: "Tipo de salida", options: tiposSalida.map((t) => ({ label: t, value: t })) },
          { id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
        ]}
        columns={columns}
        onRowClick={(k) => setSelected(k)}
        exportFileName="salidas_inventario"
        rowActions={(k) => <RowActionsMenu actions={[{ label: "Ver detalle", icon: Eye, onSelect: () => setSelected(k) }]} />}
        emptyTitle="Sin salidas"
        emptyDescription="No hay movimientos de salida con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.documentoReferencia} description={selected?.tipo}>
        {selected && (
          <DetailSection title="Detalle del movimiento">
            <DefinitionList
              items={[
                { label: "Producto", value: productos.find((p) => p.id === selected.productoId)?.nombre ?? selected.productoId },
                { label: "Bodega", value: bodegas.find((b) => b.id === selected.bodegaId)?.nombre ?? "-" },
                { label: "Fecha", value: formatDate(selected.fecha) },
                { label: "Cantidad", value: formatNumber(selected.cantidad) },
                { label: "Saldo acumulado", value: formatNumber(selected.saldoAcumulado) },
                { label: "Usuario", value: selected.usuario },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
