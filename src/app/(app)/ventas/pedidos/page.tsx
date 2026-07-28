"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Eye, Truck, ReceiptText, Ban } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { pedidos, clientes, vendedores, bodegas } from "@/lib/mock";
import type { Pedido } from "@/types";

const estadoOptions = [
  "Pendiente",
  "En preparacion",
  "Listo para despacho",
  "Despachado parcial",
  "Despachado",
  "Facturado",
  "Cancelado",
].map((s) => ({ label: s, value: s }));

function totalPedido(p: Pedido): number {
  return p.lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario * (1 - l.descuentoPct / 100), 0);
}

export default function PedidosPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<Pedido>[] = [
    { id: "folio", header: "Folio", cell: (p) => <span className="font-medium">{p.folio}</span> },
    { id: "cliente", header: "Cliente", cell: (p) => clientes.find((c) => c.id === p.clienteId)?.nombreComercial ?? "-" },
    { id: "vendedor", header: "Vendedor", cell: (p) => vendedores.find((v) => v.id === p.vendedorId)?.nombre ?? "-" },
    { id: "bodega", header: "Bodega", cell: (p) => bodegas.find((b) => b.id === p.bodegaId)?.nombre ?? "-" },
    { id: "fecha", header: "Fecha pedido", cell: (p) => formatDate(p.fechaPedido) },
    { id: "entrega", header: "Entrega comprometida", cell: (p) => formatDate(p.fechaEntregaComprometida) },
    { id: "prioridad", header: "Prioridad", cell: (p) => <StatusBadge status={p.prioridad} tone={p.prioridad === "Alta" ? "danger" : p.prioridad === "Normal" ? "info" : "neutral"} /> },
    { id: "total", header: "Total", cell: (p) => formatCurrency(totalPedido(p), p.moneda), className: "text-right" },
    { id: "estado", header: "Estado", cell: (p) => <StatusBadge status={p.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pedidos"
        description="Seguimiento de pedidos desde su creacion hasta la facturacion."
        actions={
          <Button size="sm" onClick={() => router.push("/ventas/cotizaciones/nueva")}>
            <Plus />
            Nuevo pedido
          </Button>
        }
      />

      <DataTable
        data={pedidos}
        getRowId={(p) => p.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por folio o cliente..."
        searchFn={(p, q) => p.folio.toLowerCase().includes(q) || (clientes.find((c) => c.id === p.clienteId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        filters={[
          { id: "bodegaId", label: "Bodega", options: bodegas.slice(0, 3).map((b) => ({ label: b.nombre, value: b.id })) },
          { id: "vendedorId", label: "Vendedor", options: vendedores.map((v) => ({ label: v.nombre, value: v.id })) },
          { id: "prioridad", label: "Prioridad", options: ["Alta", "Normal", "Baja"].map((p) => ({ label: p, value: p })) },
        ]}
        getStatus={(p) => p.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(p) => router.push(`/ventas/pedidos/${p.id}`)}
        exportFileName="pedidos"
        exportRow={(p) => ({
          Folio: p.folio,
          Cliente: clientes.find((c) => c.id === p.clienteId)?.nombreComercial ?? "",
          Estado: p.estado,
          Total: totalPedido(p),
          FechaPedido: p.fechaPedido,
        })}
        rowActions={(p) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => router.push(`/ventas/pedidos/${p.id}`) },
              { label: "Programar despacho", icon: Truck, onSelect: () => router.push("/ventas/despachos") },
              { label: "Facturar", icon: ReceiptText, onSelect: () => router.push("/facturacion/dte") },
              {
                label: "Cancelar pedido",
                icon: Ban,
                destructive: true,
                separatorBefore: true,
                onSelect: () => toast.error("Pedido cancelado (simulado)", { description: p.folio }),
              },
            ]}
          />
        )}
        emptyTitle="Sin pedidos"
        emptyDescription="No se encontraron pedidos con los filtros seleccionados."
      />
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-normal">Tip</Badge>
        Haz clic en un pedido para ver el detalle completo, sus lineas y el historial de estatus.
      </p>
    </div>
  );
}
