"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, Banknote, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Wallet, AlertOctagon, Clock } from "lucide-react";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { cuentasPorCobrar, clientes } from "@/lib/mock";
import type { CuentaPorCobrar } from "@/types";

const estadoOptions = ["Vigente", "Por vencer", "Vencida", "Pagada"].map((s) => ({ label: s, value: s }));

export default function CuentasPorCobrarPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<CuentaPorCobrar | null>(null);

  const totalCartera = cuentasPorCobrar.filter((c) => c.estado !== "Pagada").reduce((s, c) => s + c.saldoPendiente, 0);
  const totalVencida = cuentasPorCobrar.filter((c) => c.estado === "Vencida").reduce((s, c) => s + c.saldoPendiente, 0);
  const promedioVencido = (() => {
    const vencidas = cuentasPorCobrar.filter((c) => c.estado === "Vencida");
    return vencidas.length ? Math.round(vencidas.reduce((s, c) => s + c.diasVencido, 0) / vencidas.length) : 0;
  })();

  const columns: DataTableColumn<CuentaPorCobrar>[] = [
    { id: "folio", header: "Documento", cell: (c) => <span className="font-medium">{c.folioDte}</span> },
    { id: "cliente", header: "Cliente", cell: (c) => clientes.find((cl) => cl.id === c.clienteId)?.nombreComercial ?? "-" },
    { id: "emision", header: "Emision", cell: (c) => formatDate(c.fechaEmision) },
    { id: "vencimiento", header: "Vencimiento", cell: (c) => formatDate(c.fechaVencimiento) },
    { id: "dias", header: "Dias vencido", cell: (c) => (c.diasVencido > 0 ? <span className="font-medium text-red-600 dark:text-red-400">{c.diasVencido}</span> : "-"), className: "text-right" },
    { id: "original", header: "Monto original", cell: (c) => formatCurrency(c.montoOriginal), className: "text-right" },
    { id: "saldo", header: "Saldo pendiente", cell: (c) => formatCurrency(c.saldoPendiente), className: "text-right" },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Cuentas por cobrar" description="Cartera de clientes pendiente de cobro por documento." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Cartera total pendiente" value={formatCurrency(totalCartera)} icon={Wallet} />
        <StatCard label="Cartera vencida" value={formatCurrency(totalVencida)} icon={AlertOctagon} />
        <StatCard label="Dias promedio de vencimiento" value={`${promedioVencido} dias`} icon={Clock} />
      </div>

      <DataTable
        data={cuentasPorCobrar}
        getRowId={(c) => c.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por documento o cliente..."
        searchFn={(c, q) => c.folioDte.toLowerCase().includes(q) || (clientes.find((cl) => cl.id === c.clienteId)?.nombreComercial.toLowerCase().includes(q) ?? false)}
        getStatus={(c) => c.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(c) => setSelected(c)}
        exportFileName="cuentas_por_cobrar"
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(c) },
              { label: "Registrar pago", icon: Banknote, onSelect: () => toast.success("Pago registrado (simulado)") },
              { label: "Enviar recordatorio", icon: Mail, onSelect: () => toast.info("Recordatorio de pago enviado (simulado)") },
            ]}
          />
        )}
        emptyTitle="Sin cuentas por cobrar"
        emptyDescription="No hay documentos pendientes con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.folioDte} description={clientes.find((c) => c.id === selected?.clienteId)?.nombreComercial}>
        {selected && (
          <DetailSection title="Detalle del documento">
            <DefinitionList
              items={[
                { label: "Fecha de emision", value: formatDate(selected.fechaEmision) },
                { label: "Fecha de vencimiento", value: formatDate(selected.fechaVencimiento) },
                { label: "Dias vencido", value: String(selected.diasVencido) },
                { label: "Monto original", value: formatCurrency(selected.montoOriginal) },
                { label: "Saldo pendiente", value: formatCurrency(selected.saldoPendiente) },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
