"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, ArrowLeftRight, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { existencias, kardex, productos, bodegas } from "@/lib/mock";
const categorias = Array.from(new Set(productos.map((p) => p.categoria))).map((c) => ({ label: c, value: c }));

const rows = existencias.map((e) => {
  const producto = productos.find((p) => p.id === e.productoId);
  return { ...e, producto, bodega: bodegas.find((b) => b.id === e.bodegaId), categoria: producto?.categoria ?? "" };
});

type ExistenciaRow = (typeof rows)[number];

export default function ExistenciasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<ExistenciaRow | null>(null);

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
    {
      id: "producto",
      header: "Producto",
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{e.producto?.nombre ?? e.productoId}</p>
          <p className="text-xs text-muted-foreground">{e.producto?.sku}</p>
        </div>
      ),
    },
    { id: "bodega", header: "Bodega", cell: (e) => e.bodega?.nombre ?? "-" },
    {
      id: "disponible",
      header: "Disponible",
      cell: (e) => (
        <span className={e.disponible < e.stockMinimo ? "font-medium text-red-600 dark:text-red-400" : "font-medium"}>
          {formatNumber(e.disponible)}
        </span>
      ),
      className: "text-right",
    },
    { id: "reservado", header: "Reservado", cell: (e) => formatNumber(e.reservado), className: "text-right" },
    { id: "transito", header: "En transito", cell: (e) => (e.enTransito > 0 ? formatNumber(e.enTransito) : "-"), className: "text-right" },
    {
      id: "backorder",
      header: "Backorder",
      cell: (e) => (e.backorder > 0 ? <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400">{formatNumber(e.backorder)}</Badge> : "-"),
      className: "text-right",
    },
    {
      id: "alerta",
      header: "",
      cell: (e) => (e.disponible < e.stockMinimo ? <TriangleAlert className="size-4 text-amber-500" /> : null),
    },
  ];

  const kardexSeleccionado = selected ? kardex.filter((k) => k.productoId === selected.productoId && k.bodegaId === selected.bodegaId).slice(0, 20) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Existencias" description="Disponibilidad de inventario por producto y bodega en tiempo real." />

      <DataTable
        data={rows}
        getRowId={(e) => e.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar producto por nombre o SKU..."
        searchFn={(e, q) => (e.producto?.nombre.toLowerCase().includes(q) ?? false) || (e.producto?.sku.toLowerCase().includes(q) ?? false)}
        filters={[
          { id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
          { id: "categoria", label: "Categoria", options: categorias },
        ]}
        columns={columns}
        onRowClick={(e) => setSelected(e)}
        exportFileName="existencias"
        exportRow={(e) => ({
          Producto: e.producto?.nombre ?? "",
          SKU: e.producto?.sku ?? "",
          Bodega: e.bodega?.nombre ?? "",
          Disponible: e.disponible,
          Reservado: e.reservado,
          EnTransito: e.enTransito,
          Backorder: e.backorder,
        })}
        rowActions={(e) => (
          <RowActionsMenu
            actions={[
              { label: "Ver kardex", icon: Eye, onSelect: () => setSelected(e) },
              { label: "Crear transferencia", icon: ArrowLeftRight, onSelect: () => toast.info("Redirige a Inventario > Transferencias") },
              { label: "Crear ajuste", icon: SlidersHorizontal, onSelect: () => toast.info("Redirige a Inventario > Ajustes") },
            ]}
          />
        )}
        emptyTitle="Sin existencias"
        emptyDescription="No hay existencias registradas con los filtros seleccionados."
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.producto?.nombre}
        description={`${selected?.bodega?.nombre ?? ""} · Kardex de movimientos`}
      >
        {selected && (
          <>
            <DetailSection title="Resumen de existencia">
              <DefinitionList
                items={[
                  { label: "Disponible", value: formatNumber(selected.disponible) },
                  { label: "Reservado", value: formatNumber(selected.reservado) },
                  { label: "En transito", value: formatNumber(selected.enTransito) },
                  { label: "Backorder", value: formatNumber(selected.backorder) },
                  { label: "Stock minimo", value: formatNumber(selected.stockMinimo) },
                  { label: "Costo promedio", value: formatCurrency(selected.producto?.costoPromedioGTQ ?? 0) },
                  { label: "Ultima actualizacion", value: formatDate(selected.ultimaActualizacion), full: true },
                ]}
              />
            </DetailSection>
            <DetailSection title="Kardex reciente">
              {kardexSeleccionado.length === 0 ? (
                <EmptyState title="Sin movimientos" description="Este producto no registra movimientos de kardex recientes." />
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kardexSeleccionado.map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="whitespace-nowrap text-xs">{formatDate(k.fecha)}</TableCell>
                          <TableCell className="text-xs">{k.tipo}</TableCell>
                          <TableCell className="text-xs">{k.documentoReferencia}</TableCell>
                          <TableCell className={`text-right text-xs font-medium ${k.cantidad >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {k.cantidad >= 0 ? "+" : ""}
                            {formatNumber(k.cantidad)}
                          </TableCell>
                          <TableCell className="text-right text-xs">{formatNumber(k.saldoAcumulado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
