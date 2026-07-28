"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { partidasArancelarias, productos } from "@/lib/mock";
import type { PartidaArancelaria } from "@/types";

export default function PartidasArancelariasPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<PartidaArancelaria | null>(null);

  const columns: DataTableColumn<PartidaArancelaria>[] = [
    { id: "codigo", header: "Codigo SAC", cell: (p) => <span className="font-medium">{p.codigo}</span> },
    { id: "descripcion", header: "Descripcion", cell: (p) => p.descripcion },
    { id: "derecho", header: "Derecho arancelario", cell: (p) => `${p.derechoArancelarioPct}%`, className: "text-right" },
    { id: "unidad", header: "Unidad oficial", cell: (p) => p.unidadMedidaOficial },
    { id: "productos", header: "Productos asociados", cell: (p) => productos.filter((prod) => prod.partidaArancelariaId === p.id).length, className: "text-right" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Partidas arancelarias"
        description="Clasificacion arancelaria utilizada para tramites de importacion."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nueva partida</Button>}
            title="Nueva partida arancelaria"
            fields={[
              { id: "codigo", label: "Codigo SAC", required: true, placeholder: "3923.21.00" },
              { id: "descripcion", label: "Descripcion", required: true, type: "textarea" },
              { id: "derecho", label: "Derecho arancelario (%)", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={partidasArancelarias}
        getRowId={(p) => p.id}
        loading={loading}
        searchPlaceholder="Buscar por codigo o descripcion..."
        searchFn={(p, q) => p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)}
        columns={columns}
        onRowClick={(p) => setSelected(p)}
        exportFileName="partidas_arancelarias"
        rowActions={(p) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(p) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin partidas"
        emptyDescription="No hay partidas arancelarias registradas."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.codigo} description={selected?.descripcion}>
        {selected && (
          <>
            <DetailSection title="Informacion arancelaria">
              <DefinitionList
                items={[
                  { label: "Derecho arancelario", value: `${selected.derechoArancelarioPct}%` },
                  { label: "Unidad de medida oficial", value: selected.unidadMedidaOficial },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos asociados">
              <div className="divide-y">
                {productos.filter((p) => p.partidaArancelariaId === selected.id).map((p) => (
                  <div key={p.id} className="p-3.5 text-sm">
                    {p.nombre}
                  </div>
                ))}
              </div>
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
