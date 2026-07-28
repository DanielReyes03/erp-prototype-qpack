"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate } from "@/lib/format";
import { costeosImportacion, embarques, gastosEmbarque } from "@/lib/mock";
import type { CosteoImportacion } from "@/types";

const metodoLabel: Record<string, string> = { valor: "Por valor", peso: "Por peso", volumen: "Por volumen" };

export default function CosteoImportacionPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<CosteoImportacion>[] = [
    { id: "embarque", header: "Embarque", cell: (c) => <span className="font-medium">{embarques.find((e) => e.id === c.embarqueId)?.folio ?? c.embarqueId}</span> },
    { id: "metodo", header: "Metodo de prorrateo", cell: (c) => <Badge variant="outline">{metodoLabel[c.metodoProrrateo]}</Badge> },
    { id: "fecha", header: "Fecha de costeo", cell: (c) => formatDate(c.fechaCosteo) },
    { id: "items", header: "Productos", cell: (c) => c.items.length, className: "text-right" },
    {
      id: "gastos",
      header: "Gastos reales",
      cell: (c) => formatCurrency(gastosEmbarque.filter((g) => g.embarqueId === c.embarqueId).reduce((s, g) => s + g.montoRealGTQ, 0)),
      className: "text-right",
    },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Costeo de importacion" description="Prorrateo de gastos de embarque y costo unitario resultante por producto." />

      <DataTable
        data={costeosImportacion}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por embarque..."
        searchFn={(c, q) => (embarques.find((e) => e.id === c.embarqueId)?.folio.toLowerCase().includes(q) ?? false)}
        getStatus={(c) => c.estado}
        statusOptions={[
          { label: "Estimado", value: "Estimado" },
          { label: "Cerrado", value: "Cerrado" },
        ]}
        columns={columns}
        onRowClick={(c) => router.push(`/compras/costeo/${c.id}`)}
        exportFileName="costeo_importacion"
        rowActions={(c) => <RowActionsMenu actions={[{ label: "Ver costeo", icon: Eye, onSelect: () => router.push(`/compras/costeo/${c.id}`) }]} />}
        emptyTitle="Sin costeos"
        emptyDescription="No hay costeos de importacion registrados."
      />
    </div>
  );
}
