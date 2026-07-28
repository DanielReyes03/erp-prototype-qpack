"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Eye, Send, Pencil, Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { cotizaciones, clientes, vendedores } from "@/lib/mock";
import type { Cotizacion } from "@/types";

const estadoOptions = ["Borrador", "Enviada", "Aprobada", "Rechazada", "Convertida", "Vencida"].map((s) => ({ label: s, value: s }));

function totalCotizacion(c: Cotizacion): number {
  const subtotal = c.lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario * (1 - l.descuentoPct / 100), 0);
  return subtotal;
}

export default function CotizacionesPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<Cotizacion>[] = [
    {
      id: "folio",
      header: "Folio",
      cell: (c) => <span className="font-medium">{c.folio}</span>,
    },
    { id: "cliente", header: "Cliente", cell: (c) => clientes.find((cl) => cl.id === c.clienteId)?.nombreComercial ?? "-" },
    { id: "vendedor", header: "Vendedor", cell: (c) => vendedores.find((v) => v.id === c.vendedorId)?.nombre ?? "-" },
    { id: "emision", header: "Emision", cell: (c) => formatDate(c.fechaEmision) },
    { id: "vencimiento", header: "Vencimiento", cell: (c) => formatDate(c.fechaVencimiento) },
    { id: "total", header: "Total", cell: (c) => formatCurrency(totalCotizacion(c), c.moneda), className: "text-right" },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cotizaciones"
        description="Cotizaciones emitidas a clientes y su estado de seguimiento."
        actions={
          <Button size="sm" onClick={() => router.push("/ventas/cotizaciones/nueva")}>
            <Plus />
            Nueva cotizacion
          </Button>
        }
      />

      <DataTable
        data={cotizaciones}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por folio o cliente..."
        searchFn={(c, q) => c.folio.toLowerCase().includes(q) || (clientes.find((cl) => cl.id === c.clienteId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        filters={[{ id: "vendedorId", label: "Vendedor", options: vendedores.map((v) => ({ label: v.nombre, value: v.id })) }]}
        getStatus={(c) => c.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(c) => router.push(`/ventas/cotizaciones/${c.id}`)}
        exportFileName="cotizaciones"
        exportRow={(c) => ({
          Folio: c.folio,
          Cliente: clientes.find((cl) => cl.id === c.clienteId)?.nombreComercial ?? "",
          Estado: c.estado,
          Total: totalCotizacion(c),
          Emision: c.fechaEmision,
        })}
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver / editar", icon: Eye, onSelect: () => router.push(`/ventas/cotizaciones/${c.id}`) },
              { label: "Enviar al cliente", icon: Send, onSelect: () => toast.success("Cotizacion enviada (simulado)", { description: c.folio }) },
              { label: "Duplicar", icon: Copy, onSelect: () => toast.info("Cotizacion duplicada (simulado)") },
              { label: "Editar condiciones", icon: Pencil, onSelect: () => router.push(`/ventas/cotizaciones/${c.id}`) },
            ]}
          />
        )}
        emptyTitle="Sin cotizaciones"
        emptyDescription="No se encontraron cotizaciones con los filtros seleccionados."
      />
    </div>
  );
}
