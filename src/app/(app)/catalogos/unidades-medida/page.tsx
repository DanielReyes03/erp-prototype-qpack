"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { unidadesMedida } from "@/lib/mock";
import type { UnidadMedida } from "@/types";

export default function UnidadesMedidaPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<UnidadMedida | null>(null);

  const columns: DataTableColumn<UnidadMedida>[] = [
    { id: "codigo", header: "Codigo", cell: (u) => <span className="font-medium">{u.codigo}</span> },
    { id: "nombre", header: "Nombre", cell: (u) => u.nombre },
    { id: "tipo", header: "Tipo", cell: (u) => <Badge variant="outline">{u.tipo}</Badge> },
    { id: "factor", header: "Factor de conversion", cell: (u) => u.factorConversionBase, className: "text-right" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Unidades de medida"
        description="Catalogo de unidades utilizadas en productos, compras y ventas."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nueva unidad</Button>}
            title="Nueva unidad de medida"
            fields={[
              { id: "codigo", label: "Codigo", required: true, placeholder: "CJA" },
              { id: "nombre", label: "Nombre", required: true, placeholder: "Caja" },
              { id: "tipo", label: "Tipo", type: "select", options: ["peso", "volumen", "conteo", "longitud"].map((t) => ({ label: t, value: t })) },
              { id: "factor", label: "Factor de conversion", type: "number" },
            ]}
          />
        }
      />

      <DataTable
        data={unidadesMedida}
        getRowId={(u) => u.id}
        loading={loading}
        searchPlaceholder="Buscar unidad..."
        searchFn={(u, q) => u.nombre.toLowerCase().includes(q) || u.codigo.toLowerCase().includes(q)}
        filters={[{ id: "tipo", label: "Tipo", options: ["peso", "volumen", "conteo", "longitud"].map((t) => ({ label: t, value: t })) }]}
        columns={columns}
        onRowClick={(u) => setSelected(u)}
        exportFileName="unidades_medida"
        rowActions={(u) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(u) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin unidades"
        emptyDescription="No hay unidades de medida registradas."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.codigo}>
        {selected && (
          <DetailSection title="Detalle de la unidad">
            <DefinitionList
              items={[
                { label: "Tipo", value: selected.tipo },
                { label: "Factor de conversion a base", value: String(selected.factorConversionBase) },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
