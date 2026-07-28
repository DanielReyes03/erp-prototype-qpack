"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, Banknote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { CreditCard, AlertOctagon } from "lucide-react";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { cuentasPorPagar, proveedores } from "@/lib/mock";
import type { CuentaPorPagar } from "@/types";

const estadoOptions = ["Vigente", "Por vencer", "Vencida", "Pagada"].map((s) => ({ label: s, value: s }));

export default function CuentasPorPagarPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<CuentaPorPagar | null>(null);

  const totalPorPagar = cuentasPorPagar.filter((c) => c.estado !== "Pagada").reduce((s, c) => s + c.saldoPendiente, 0);
  const totalVencida = cuentasPorPagar.filter((c) => c.estado === "Vencida").reduce((s, c) => s + c.saldoPendiente, 0);

  const columns: DataTableColumn<CuentaPorPagar>[] = [
    { id: "documento", header: "Documento", cell: (c) => <span className="font-medium">{c.documento}</span> },
    { id: "proveedor", header: "Proveedor", cell: (c) => proveedores.find((p) => p.id === c.proveedorId)?.nombreComercial ?? "-" },
    { id: "concepto", header: "Concepto", cell: (c) => c.concepto },
    { id: "vencimiento", header: "Vencimiento", cell: (c) => formatDate(c.fechaVencimiento) },
    { id: "dias", header: "Dias vencido", cell: (c) => (c.diasVencido > 0 ? <span className="font-medium text-red-600 dark:text-red-400">{c.diasVencido}</span> : "-"), className: "text-right" },
    { id: "saldo", header: "Saldo pendiente", cell: (c) => formatCurrency(c.saldoPendiente, c.moneda), className: "text-right" },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cuentas por pagar" description="Obligaciones pendientes con proveedores locales y del exterior." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total por pagar" value={formatCurrency(totalPorPagar)} icon={CreditCard} />
        <StatCard label="Vencido" value={formatCurrency(totalVencida)} icon={AlertOctagon} />
      </div>

      <DataTable
        data={cuentasPorPagar}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por documento o proveedor..."
        searchFn={(c, q) => c.documento.toLowerCase().includes(q) || (proveedores.find((p) => p.id === c.proveedorId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        getStatus={(c) => c.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(c) => setSelected(c)}
        exportFileName="cuentas_por_pagar"
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(c) },
              { label: "Programar pago", icon: Banknote, onSelect: () => toast.success("Pago programado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin cuentas por pagar"
        emptyDescription="No hay documentos pendientes con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.documento} description={proveedores.find((p) => p.id === selected?.proveedorId)?.nombreComercial}>
        {selected && (
          <DetailSection title="Detalle del documento">
            <DefinitionList
              items={[
                { label: "Concepto", value: selected.concepto, full: true },
                { label: "Fecha de emision", value: formatDate(selected.fechaEmision) },
                { label: "Fecha de vencimiento", value: formatDate(selected.fechaVencimiento) },
                { label: "Monto original", value: formatCurrency(selected.montoOriginal, selected.moneda) },
                { label: "Saldo pendiente", value: formatCurrency(selected.saldoPendiente, selected.moneda) },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
