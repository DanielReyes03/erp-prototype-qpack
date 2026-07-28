"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatNumber } from "@/lib/format";
import { contenedores, navieras, embarques } from "@/lib/mock";
import type { Contenedor } from "@/types";
import { useRouter } from "next/navigation";

const estadoOptions = ["En origen", "En transito", "En puerto", "Liberado", "Devuelto"].map((s) => ({ label: s, value: s }));

export default function ContenedoresPage() {
  const loading = useMockLoading();
  const router = useRouter();
  const [selected, setSelected] = React.useState<Contenedor | null>(null);

  const columns: DataTableColumn<Contenedor>[] = [
    { id: "numero", header: "Numero", cell: (c) => <span className="font-medium">{c.numero}</span> },
    { id: "tipo", header: "Tipo", cell: (c) => c.tipo },
    { id: "naviera", header: "Naviera", cell: (c) => navieras.find((n) => n.id === c.navieraId)?.nombre ?? "-" },
    { id: "embarque", header: "Embarque", cell: (c) => embarques.find((e) => e.id === c.embarqueId)?.folio ?? "-" },
    { id: "peso", header: "Peso", cell: (c) => `${formatNumber(c.pesoKg)} kg`, className: "text-right" },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Contenedores" description="Contenedores en uso para embarques de importacion." />

      <DataTable
        data={contenedores}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por numero de contenedor..."
        searchFn={(c, q) => c.numero.toLowerCase().includes(q)}
        filters={[{ id: "navieraId", label: "Naviera", options: navieras.map((n) => ({ label: n.nombre, value: n.id })) }]}
        getStatus={(c) => c.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(c) => setSelected(c)}
        exportFileName="contenedores"
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(c) },
              { label: "Ver embarque", icon: Eye, onSelect: () => router.push(`/compras/embarques/${c.embarqueId}`) },
            ]}
          />
        )}
        emptyTitle="Sin contenedores"
        emptyDescription="No hay contenedores registrados con estos filtros."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.numero} description={selected?.tipo}>
        {selected && (
          <DetailSection title="Detalle del contenedor">
            <DefinitionList
              items={[
                { label: "Naviera", value: navieras.find((n) => n.id === selected.navieraId)?.nombre ?? "-" },
                { label: "Embarque", value: embarques.find((e) => e.id === selected.embarqueId)?.folio ?? "-" },
                { label: "Peso", value: `${formatNumber(selected.pesoKg)} kg` },
                { label: "Numero de precinto", value: selected.precintoNumero },
                { label: "Estado", value: <StatusBadge status={selected.estado} /> },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
