"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Eye, Code2, FileText, Ban } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { dtesEmitidos, clientes } from "@/lib/mock";
import type { DteEmitido } from "@/types";

const estadoOptions = ["Certificado", "Pendiente", "Rechazado", "Anulado"].map((s) => ({ label: s, value: s }));

export default function DteListPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<DteEmitido>[] = [
    { id: "documento", header: "Documento", cell: (d) => <span className="font-medium">{d.serie}-{d.numero}</span> },
    { id: "tipo", header: "Tipo", cell: (d) => <Badge variant="outline">{d.tipo}</Badge> },
    { id: "receptor", header: "Receptor", cell: (d) => clientes.find((c) => c.id === d.clienteId)?.nombreComercial ?? d.receptorNombre },
    { id: "nit", header: "NIT", cell: (d) => d.receptorNit },
    { id: "fecha", header: "Fecha emision", cell: (d) => formatDate(d.fechaEmision) },
    { id: "total", header: "Total", cell: (d) => formatCurrency(d.total, d.moneda), className: "text-right" },
    { id: "estado", header: "Estado", cell: (d) => <StatusBadge status={d.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="DTE emitidos"
        description="Documentos tributarios electronicos certificados ante la SAT via FEL."
        actions={
          <Button size="sm" onClick={() => router.push("/facturacion/dte/nueva")}>
            <Plus />
            Nueva factura
          </Button>
        }
      />

      <DataTable
        data={dtesEmitidos}
        getRowId={(d) => d.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por serie, numero o receptor..."
        searchFn={(d, q) => `${d.serie}-${d.numero}`.toLowerCase().includes(q) || d.receptorNombre.toLowerCase().includes(q) || d.receptorNit.includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: ["FACT", "FCAM", "NABN"].map((t) => ({ label: t, value: t })) }]}
        getStatus={(d) => d.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(d) => router.push(`/facturacion/dte/${d.id}`)}
        exportFileName="dte_emitidos"
        exportRow={(d) => ({
          Documento: `${d.serie}-${d.numero}`,
          Tipo: d.tipo,
          Receptor: d.receptorNombre,
          NIT: d.receptorNit,
          Total: d.total,
          Estado: d.estado,
        })}
        rowActions={(d) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => router.push(`/facturacion/dte/${d.id}`) },
              { label: "Ver XML", icon: Code2, onSelect: () => router.push(`/facturacion/dte/${d.id}`) },
              { label: "Ver PDF", icon: FileText, onSelect: () => router.push(`/facturacion/dte/${d.id}`) },
              {
                label: "Anular",
                icon: Ban,
                destructive: true,
                separatorBefore: true,
                onSelect: () => toast.error("DTE anulado (simulado)", { description: `${d.serie}-${d.numero}` }),
              },
            ]}
          />
        )}
        emptyTitle="Sin documentos"
        emptyDescription="No se encontraron DTE con los filtros seleccionados."
      />
    </div>
  );
}
