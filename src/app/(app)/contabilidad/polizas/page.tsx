"use client";

import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { polizas } from "@/lib/mock";
import type { Poliza } from "@/types";

const estadoOptions = ["Borrador", "Contabilizada", "Anulada"].map((s) => ({ label: s, value: s }));

function totalPoliza(p: Poliza): number {
  return p.lineas.reduce((s, l) => s + l.debe, 0);
}

export default function PolizasPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<Poliza>[] = [
    { id: "folio", header: "Folio", cell: (p) => <span className="font-medium">{p.folio}</span> },
    { id: "tipo", header: "Tipo", cell: (p) => <Badge variant="outline">{p.tipo}</Badge> },
    { id: "concepto", header: "Concepto", cell: (p) => p.concepto },
    { id: "origen", header: "Origen", cell: (p) => p.origenModulo },
    { id: "fecha", header: "Fecha", cell: (p) => formatDate(p.fecha) },
    { id: "total", header: "Total", cell: (p) => formatCurrency(totalPoliza(p)), className: "text-right" },
    { id: "elaborado", header: "Elaborado por", cell: (p) => p.elaboradoPor },
    { id: "estado", header: "Estado", cell: (p) => <StatusBadge status={p.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Polizas contables"
        description="Registro de polizas de diario, ingreso y egreso."
        actions={
          <Button size="sm" onClick={() => router.push("/contabilidad/polizas/nueva")}>
            <Plus />
            Nueva poliza
          </Button>
        }
      />

      <DataTable
        data={polizas}
        getRowId={(p) => p.id}
        loading={loading}
        pageSize={12}
        searchPlaceholder="Buscar por folio o concepto..."
        searchFn={(p, q) => p.folio.toLowerCase().includes(q) || p.concepto.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: ["Ingreso", "Egreso", "Diario"].map((t) => ({ label: t, value: t })) }]}
        getStatus={(p) => p.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(p) => router.push(`/contabilidad/polizas/${p.id}`)}
        exportFileName="polizas"
        rowActions={(p) => <RowActionsMenu actions={[{ label: "Ver / editar", icon: Eye, onSelect: () => router.push(`/contabilidad/polizas/${p.id}`) }]} />}
        emptyTitle="Sin polizas"
        emptyDescription="No hay polizas registradas con estos filtros."
      />
    </div>
  );
}
