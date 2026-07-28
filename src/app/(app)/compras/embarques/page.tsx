"use client";

import { useRouter } from "next/navigation";
import { Eye, Calculator } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { embarques, navieras, contenedores } from "@/lib/mock";
import type { Embarque } from "@/types";

const estadoOptions = [
  "Reservado",
  "Cargado",
  "En transito maritimo",
  "Arribado a puerto",
  "En tramite aduanal",
  "Liberado",
  "En transito terrestre",
  "Recibido en bodega",
].map((s) => ({ label: s, value: s }));

export default function EmbarquesPage() {
  const loading = useMockLoading();
  const router = useRouter();

  const columns: DataTableColumn<Embarque>[] = [
    { id: "folio", header: "Folio", cell: (e) => <span className="font-medium">{e.folio}</span> },
    { id: "naviera", header: "Naviera", cell: (e) => navieras.find((n) => n.id === e.navieraId)?.nombre ?? "-" },
    { id: "contenedor", header: "Contenedor", cell: (e) => contenedores.find((c) => c.id === e.contenedorId)?.numero ?? "-" },
    { id: "bl", header: "BL", cell: (e) => e.numeroBl },
    { id: "incoterm", header: "Incoterm", cell: (e) => <Badge variant="outline">{e.incoterm}</Badge> },
    { id: "ruta", header: "Ruta", cell: (e) => `${e.puertoOrigen} → ${e.puertoDestino}` },
    { id: "etd", header: "ETD", cell: (e) => formatDate(e.etd) },
    { id: "eta", header: "ETA", cell: (e) => formatDate(e.eta) },
    { id: "estado", header: "Estado", cell: (e) => <StatusBadge status={e.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Embarques" description="Expedientes de embarques de importacion desde origen hasta bodega." />

      <DataTable
        data={embarques}
        getRowId={(e) => e.id}
        loading={loading}
        searchPlaceholder="Buscar por folio o BL..."
        searchFn={(e, q) => e.folio.toLowerCase().includes(q) || e.numeroBl.toLowerCase().includes(q)}
        filters={[{ id: "navieraId", label: "Naviera", options: navieras.map((n) => ({ label: n.nombre, value: n.id })) }]}
        getStatus={(e) => e.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(e) => router.push(`/compras/embarques/${e.id}`)}
        exportFileName="embarques"
        rowActions={(e) => (
          <RowActionsMenu
            actions={[
              { label: "Ver expediente", icon: Eye, onSelect: () => router.push(`/compras/embarques/${e.id}`) },
              { label: "Ver costeo de importacion", icon: Calculator, onSelect: () => router.push(`/compras/costeo/cst-${e.id}`) },
            ]}
          />
        )}
        emptyTitle="Sin embarques"
        emptyDescription="No hay embarques registrados con estos filtros."
      />
    </div>
  );
}
