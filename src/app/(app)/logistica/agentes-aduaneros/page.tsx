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
import { agentesAduaneros } from "@/lib/mock";
import type { AgenteAduanero } from "@/types";

export default function AgentesAduanerosPage() {
  const loading = useMockLoading();
  const [selected, setSelected] = React.useState<AgenteAduanero | null>(null);

  const columns: DataTableColumn<AgenteAduanero>[] = [
    { id: "nombre", header: "Agente", cell: (a) => <span className="font-medium">{a.nombre}</span> },
    { id: "colegiado", header: "No. Colegiado", cell: (a) => a.colegiado },
    { id: "empresa", header: "Agencia aduanal", cell: (a) => a.empresa },
    { id: "telefono", header: "Telefono", cell: (a) => a.telefono },
    { id: "aduanas", header: "Aduanas habituales", cell: (a) => a.aduanasHabituales.join(", ") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agentes aduaneros"
        description="Agentes autorizados para tramites de importacion y exportacion."
        actions={
          <QuickCreateDialog
            trigger={<Button size="sm"><Plus />Nuevo agente</Button>}
            title="Nuevo agente aduanero"
            fields={[
              { id: "nombre", label: "Nombre", required: true },
              { id: "colegiado", label: "No. Colegiado", required: true },
              { id: "empresa", label: "Agencia aduanal" },
              { id: "telefono", label: "Telefono" },
            ]}
          />
        }
      />

      <DataTable
        data={agentesAduaneros}
        getRowId={(a) => a.id}
        loading={loading}
        searchPlaceholder="Buscar agente..."
        searchFn={(a, q) => a.nombre.toLowerCase().includes(q) || a.empresa.toLowerCase().includes(q)}
        columns={columns}
        onRowClick={(a) => setSelected(a)}
        exportFileName="agentes_aduaneros"
        rowActions={(a) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(a) },
              { label: "Editar", icon: Pencil, onSelect: () => toast.info("Edicion simulada") },
            ]}
          />
        )}
        emptyTitle="Sin agentes"
        emptyDescription="No hay agentes aduaneros registrados."
      />

      <DetailSheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)} title={selected?.nombre} description={selected?.empresa}>
        {selected && (
          <DetailSection title="Informacion de contacto">
            <DefinitionList
              items={[
                { label: "No. Colegiado", value: selected.colegiado },
                { label: "Telefono", value: selected.telefono },
                { label: "Correo", value: selected.correo },
                { label: "Aduanas habituales", value: selected.aduanasHabituales.join(", "), full: true },
              ]}
            />
          </DetailSection>
        )}
      </DetailSheet>
    </div>
  );
}
