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
import { lotes, productos, bodegas } from "@/lib/mock";
import type { Lote } from "@/types";

export default function LotesPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Lote | null>(null);

  const columns: DataTableColumn<Lote>[] = [
    { id: "codigo", header: "Lote", cell: (l) => <span className="font-medium">{l.codigo}</span> },
    { id: "producto", header: "Producto", cell: (l) => productos.find((p) => p.id === l.productoId)?.nombre ?? l.productoId },
    { id: "bodega", header: "Bodega", cell: (l) => bodegas.find((b) => b.id === l.bodegaId)?.nombre ?? "-" },
    { id: "ingreso", header: "Fecha ingreso", cell: (l) => formatDate(l.fechaIngreso) },
    { id: "vencimiento", header: "Vencimiento", cell: (l) => (l.fechaVencimiento ? formatDate(l.fechaVencimiento) : "N/A") },
    { id: "inicial", header: "Cant. inicial", cell: (l) => formatNumber(l.cantidadInicial), className: "text-right" },
    { id: "disponible", header: "Disponible", cell: (l) => formatNumber(l.cantidadDisponible), className: "text-right" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Lotes" description="Trazabilidad de lotes de producto por bodega y fecha de ingreso." />

      <DataTable
        data={lotes}
        getRowId={(l) => l.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por codigo de lote..."
        searchFn={(l, q) => l.codigo.toLowerCase().includes(q)}
        filters={[{ id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) }]}
        columns={columns}
        onRowClick={(l) => setSelected(l)}
        exportFileName="lotes"
        rowActions={(l) => <RowActionsMenu actions={[{ label: "Ver detalle", icon: Eye, onSelect: () => setSelected(l) }]} />}
        emptyTitle="Sin lotes"
        emptyDescription="No hay lotes registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.codigo} description={productos.find((p) => p.id === selected?.productoId)?.nombre}>
        {selected && (
          <DetailSection title="Detalle del lote">
            <DefinitionList
              items={[
                { label: "Bodega", value: bodegas.find((b) => b.id === selected.bodegaId)?.nombre ?? "-" },
                { label: "Fecha de ingreso", value: formatDate(selected.fechaIngreso) },
                { label: "Fecha de vencimiento", value: selected.fechaVencimiento ? formatDate(selected.fechaVencimiento) : "No aplica" },
                { label: "Cantidad inicial", value: formatNumber(selected.cantidadInicial) },
                { label: "Cantidad disponible", value: formatNumber(selected.cantidadDisponible) },
                { label: "Orden de compra", value: selected.ordenCompraId ? <Badge variant="outline">{selected.ordenCompraId}</Badge> : "N/A" },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
