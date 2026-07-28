"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, ScanBarcode } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatDate } from "@/lib/format";
import { recepciones, bodegas, embarques, ordenesCompraLocal, productos } from "@/lib/mock";
import type { Recepcion } from "@/types";

const estadoOptions = ["Pendiente", "En proceso", "Completa", "Con diferencias"].map((s) => ({ label: s, value: s }));

function origenLabel(r: Recepcion): string {
  if (r.origenTipo === "Embarque") return embarques.find((e) => e.id === r.origenId)?.folio ?? r.origenId;
  return ordenesCompraLocal.find((o) => o.id === r.origenId)?.folio ?? r.origenId;
}

export default function RecepcionesPage() {
  const loading = useMockLoading();
  const router = useRouter();
  const [selected, setSelected] = React.useState<Recepcion | null>(null);

  const columns: DataTableColumn<Recepcion>[] = [
    { id: "folio", header: "Folio", cell: (r) => <span className="font-medium">{r.folio}</span> },
    { id: "origenTipo", header: "Origen", cell: (r) => <Badge variant="outline">{r.origenTipo}</Badge> },
    { id: "origen", header: "Documento origen", cell: (r) => origenLabel(r) },
    { id: "bodega", header: "Bodega", cell: (r) => bodegas.find((b) => b.id === r.bodegaId)?.nombre ?? "-" },
    { id: "fecha", header: "Fecha", cell: (r) => formatDate(r.fecha) },
    { id: "recibidoPor", header: "Recibido por", cell: (r) => r.recibidoPor },
    { id: "estado", header: "Estado", cell: (r) => <StatusBadge status={r.estado} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Recepciones" description="Recepcion de mercaderia proveniente de embarques y ordenes locales." />

      <DataTable
        data={recepciones}
        getRowId={(r) => r.id}
        loading={loading}
        searchPlaceholder="Buscar por folio..."
        searchFn={(r, q) => r.folio.toLowerCase().includes(q)}
        filters={[
          { id: "origenTipo", label: "Origen", options: [{ label: "Embarque", value: "Embarque" }, { label: "Orden local", value: "Orden local" }] },
          { id: "bodegaId", label: "Bodega", options: bodegas.map((b) => ({ label: b.nombre, value: b.id })) },
        ]}
        getStatus={(r) => r.estado}
        statusOptions={estadoOptions}
        columns={columns}
        onRowClick={(r) => setSelected(r)}
        exportFileName="recepciones"
        rowActions={(r) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(r) },
              { label: "Abrir recepcion movil", icon: ScanBarcode, onSelect: () => router.push(`/compras/recepciones/${r.id}/movil`) },
            ]}
          />
        )}
        emptyTitle="Sin recepciones"
        emptyDescription="No hay recepciones registradas con estos filtros."
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.folio}
        description={selected ? origenLabel(selected) : ""}
        footer={
          selected && (
            <Button className="w-full" onClick={() => router.push(`/compras/recepciones/${selected.id}/movil`)}>
              <ScanBarcode />
              Abrir recepcion movil
            </Button>
          )
        }
      >
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Bodega", value: bodegas.find((b) => b.id === selected.bodegaId)?.nombre ?? "-" },
                  { label: "Fecha", value: formatDate(selected.fecha) },
                  { label: "Recibido por", value: selected.recibidoPor },
                  { label: "Estado", value: <StatusBadge status={selected.estado} /> },
                ]}
              />
            </DetailSection>
            <DetailSection title="Productos">
              <div className="divide-y">
                {selected.items.map((it, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 text-sm">
                    <span>{productos.find((p) => p.id === it.productoId)?.nombre ?? it.productoId}</span>
                    <span className="text-muted-foreground">
                      {it.cantidadRecibida} / {it.cantidadEsperada}
                    </span>
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
