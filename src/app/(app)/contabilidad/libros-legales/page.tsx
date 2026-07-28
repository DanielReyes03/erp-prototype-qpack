"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { librosLegales } from "@/lib/mock";
import type { LibroLegal } from "@/types";

export default function LibrosLegalesPage() {
  const loading = useMockLoading();

  const columns: DataTableColumn<LibroLegal>[] = [
    { id: "nombre", header: "Libro", cell: (l) => <span className="font-medium">{l.nombre}</span> },
    { id: "periodo", header: "Periodo", cell: (l) => l.periodo },
    { id: "limite", header: "Fecha limite", cell: (l) => formatDate(l.fechaLimite) },
    { id: "estado", header: "Estado", cell: (l) => <StatusBadge status={l.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Libros legales" description="Libros contables obligatorios ante la Superintendencia de Administracion Tributaria." />

      <DataTable
        data={librosLegales}
        getRowId={(l) => l.id}
        loading={loading}
        columns={columns}
        exportFileName="libros_legales"
        rowActions={(l) => (
          <RowActionsMenu
            actions={[{ label: "Descargar libro", icon: Download, onSelect: () => toast.info("Descarga simulada", { description: l.nombre }) }]}
          />
        )}
        emptyTitle="Sin libros"
        emptyDescription="No hay libros legales configurados."
      />
    </div>
  );
}
