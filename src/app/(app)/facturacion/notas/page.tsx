"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Code2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { notasCreditoDebito, clientes, dtesEmitidos } from "@/lib/mock";
import type { NotaCreditoDebito } from "@/types";

const estadoOptions = ["Certificado", "Pendiente", "Rechazado", "Anulado"].map((s) => ({ label: s, value: s }));

export default function NotasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<NotaCreditoDebito | null>(null);

  const columns: DataTableColumn<NotaCreditoDebito>[] = [
    { id: "documento", header: "Documento", cell: (n) => <span className="font-medium">{n.serie}-{n.numero}</span> },
    { id: "tipo", header: "Tipo", cell: (n) => <Badge variant="outline">{n.tipo}</Badge> },
    { id: "cliente", header: "Cliente", cell: (n) => clientes.find((c) => c.id === n.clienteId)?.nombreComercial ?? "-" },
    { id: "origen", header: "DTE origen", cell: (n) => { const dte = dtesEmitidos.find((d) => d.id === n.dteOrigenId); return dte ? `${dte.serie}-${dte.numero}` : "-"; } },
    { id: "motivo", header: "Motivo", cell: (n) => n.motivo },
    { id: "fecha", header: "Fecha emision", cell: (n) => formatDate(n.fechaEmision) },
    { id: "monto", header: "Monto", cell: (n) => formatCurrency(n.monto), className: "text-right" },
    { id: "estado", header: "Estado", cell: (n) => <StatusBadge status={n.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notas de credito y debito"
        description="Documentos de ajuste emitidos sobre facturas certificadas."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nueva nota
              </Button>
            }
            title="Nueva nota de credito o debito"
            fields={[
              { id: "tipo", label: "Tipo de documento", type: "select", required: true, options: [{ label: "Nota de credito", value: "Nota de credito" }, { label: "Nota de debito", value: "Nota de debito" }] },
              { id: "dteOrigenId", label: "DTE origen", type: "select", required: true, options: dtesEmitidos.slice(0, 20).map((d) => ({ label: `${d.serie}-${d.numero}`, value: d.id })) },
              { id: "motivo", label: "Motivo", required: true, placeholder: "Devolucion de mercaderia" },
              { id: "monto", label: "Monto (GTQ)", type: "number", required: true },
            ]}
          />
        }
      />

      <DataTable
        data={notasCreditoDebito}
        getRowId={(n) => n.id}
        loading={loading}
        searchPlaceholder="Buscar por documento..."
        searchFn={(n, q) => `${n.serie}-${n.numero}`.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: [{ label: "Nota de credito", value: "Nota de credito" }, { label: "Nota de debito", value: "Nota de debito" }] }]}
        getStatus={(n) => n.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(n) => setSelected(n)}
        exportFileName="notas_credito_debito"
        rowActions={(n) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(n) },
              { label: "Ver XML", icon: Code2, onSelect: () => toast.info("Vista de XML disponible desde el detalle") },
            ]}
          />
        )}
        emptyTitle="Sin notas"
        emptyDescription="No se encontraron notas con los filtros seleccionados."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected ? `${selected.serie}-${selected.numero}` : ""} description={selected?.tipo}>
        {selected && (
          <DetailSection title="Informacion del documento">
            <DefinitionList
              items={[
                { label: "Cliente", value: clientes.find((c) => c.id === selected.clienteId)?.nombreComercial ?? "-" },
                { label: "DTE origen", value: (() => { const dte = dtesEmitidos.find((d) => d.id === selected.dteOrigenId); return dte ? `${dte.serie}-${dte.numero}` : "-"; })() },
                { label: "Motivo", value: selected.motivo, full: true },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                { label: "Fecha de emision", value: formatDate(selected.fechaEmision) },
                { label: "Monto", value: formatCurrency(selected.monto) },
                { label: "Numero de autorizacion", value: <span className="font-mono text-xs break-all">{selected.numeroAutorizacion}</span>, full: true },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
