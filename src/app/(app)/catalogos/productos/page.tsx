"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatNumber } from "@/lib/format";
import { productos, unidadesMedida, proveedores, partidasArancelarias, categoriasProducto } from "@/lib/mock";
import type { Producto } from "@/types";

export default function ProductosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<Producto | null>(null);

  const columns: DataTableColumn<Producto>[] = [
    {
      id: "producto",
      header: "Producto",
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 shrink-0 rounded-md" style={{ backgroundColor: p.imagenColor + "26", border: `1px solid ${p.imagenColor}55` }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{p.nombre}</p>
            <p className="text-xs text-muted-foreground">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { id: "categoria", header: "Categoria", cell: (p) => <Badge variant="outline">{p.categoria}</Badge> },
    { id: "unidad", header: "Unidad", cell: (p) => unidadesMedida.find((u) => u.id === p.unidadMedidaId)?.codigo ?? "-" },
    { id: "proveedor", header: "Proveedor", cell: (p) => proveedores.find((pr) => pr.id === p.proveedorPrincipalId)?.nombreComercial ?? "-" },
    { id: "costo", header: "Costo promedio", cell: (p) => formatCurrency(p.costoPromedioGTQ), className: "text-right" },
    { id: "precio", header: "Precio lista", cell: (p) => formatCurrency(p.precioListaGTQ), className: "text-right" },
    { id: "estado", header: "Estado", cell: (p) => <StatusBadge status={p.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productos"
        description="Catalogo de productos plasticos importados y comercializados por QPack."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo producto</Button>}
            title="Nuevo producto"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "sku", label: "SKU", required: true, placeholder: "QP-0031" },
              { id: "categoria", label: "Categoria", type: "select", required: true, options: categoriasProducto.map((c) => ({ label: c, value: c })) },
              { id: "unidadMedidaId", label: "Unidad de medida", type: "select", options: unidadesMedida.map((u) => ({ label: u.nombre, value: u.id })) },
              { id: "proveedorPrincipalId", label: "Proveedor principal", type: "select", options: proveedores.map((p) => ({ label: p.nombreComercial, value: p.id })) },
              { id: "precioListaGTQ", label: "Precio de lista (GTQ)", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={productos}
        getRowId={(p) => p.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por nombre o SKU..."
        searchFn={(p, q) => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)}
        filters={[
          { id: "categoria", label: "Categoria", options: categoriasProducto.map((c) => ({ label: c, value: c })) },
          { id: "proveedorPrincipalId", label: "Proveedor", options: proveedores.map((p) => ({ label: p.nombreComercial, value: p.id })) },
        ]}
        getStatus={(p) => (p.activo ? "Activo" : "Inactivo")}
        statusOptions={[{ label: "Activo", value: "Activo" }, { label: "Inactivo", value: "Inactivo" }]}
        columns={columns}
        onRowClick={(p) => setSelected(p)}
        exportFileName="productos"
        exportRow={(p) => ({ SKU: p.sku, Nombre: p.nombre, Categoria: p.categoria, CostoPromedio: p.costoPromedioGTQ, PrecioLista: p.precioListaGTQ })}
        rowActions={(p) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(p) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion de producto simulada") },
              { label: p.activo ? "Desactivar" : "Activar", icon: p.activo ? Ban : CheckCircle2, destructive: p.activo, onSelect: () => toast.success("Estado actualizado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin productos"
        emptyDescription="No hay productos que coincidan con los filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.sku}>
        {selected && (
          <>
            <DetailSection title="Clasificacion">
              <DefinitionList
                items={[
                  { label: "Categoria", value: selected.categoria },
                  { label: "Unidad de medida", value: unidadesMedida.find((u) => u.id === selected.unidadMedidaId)?.nombre ?? "-" },
                  { label: "Partida arancelaria", value: partidasArancelarias.find((pa) => pa.id === selected.partidaArancelariaId)?.codigo ?? "-" },
                  { label: "Proveedor principal", value: proveedores.find((p) => p.id === selected.proveedorPrincipalId)?.nombreComercial ?? "-" },
                ]}
              />
            </DetailSection>
            <DetailSection title="Precios y costos">
              <DefinitionList
                items={[
                  { label: "Costo promedio", value: formatCurrency(selected.costoPromedioGTQ) },
                  { label: "Precio lista GTQ", value: formatCurrency(selected.precioListaGTQ) },
                  { label: "Precio lista USD", value: formatCurrency(selected.precioListaUSD, "USD") },
                  { label: "Stock minimo", value: formatNumber(selected.stockMinimo) },
                ]}
              />
            </DetailSection>
            <DetailSection title="Especificaciones fisicas">
              <DefinitionList
                items={[
                  { label: "Peso unitario", value: `${selected.pesoKgUnitario} kg` },
                  { label: "Volumen unitario", value: `${selected.volumenM3Unitario} m3` },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
