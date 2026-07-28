"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Eye, FileText, Handshake, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { QuickCreateDialog } from "@/components/shared/quick-create-dialog";
import { DetailSheet, DetailSection, DefinitionList } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import { clientes, vendedores, listasPrecios } from "@/lib/mock";
import type { Cliente } from "@/types";
import { useRouter } from "next/navigation";

const segmentoOptions = ["Distribuidor", "Mayorista", "Minorista", "Institucional", "Industrial"].map((s) => ({ label: s, value: s }));

export default function ClientesPage() {
  const loading = useMockLoading();
  const router = useRouter();
  const [selected, setSelected] = React.useState<Cliente | null>(null);

  const vendedorOptions = vendedores.map((v) => ({ label: v.nombre, value: v.id }));

  const columns: DataTableColumn<Cliente>[] = [
    {
      id: "cliente",
      header: "Cliente",
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(c.nombreComercial)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{c.nombreComercial}</p>
            <p className="truncate text-xs text-muted-foreground">{c.codigo} · NIT {c.nit}</p>
          </div>
        </div>
      ),
    },
    { id: "segmento", header: "Segmento", cell: (c) => <Badge variant="outline">{c.segmento}</Badge> },
    {
      id: "vendedor",
      header: "Vendedor",
      cell: (c) => vendedores.find((v) => v.id === c.vendedorId)?.nombre ?? "-",
    },
    { id: "ubicacion", header: "Ubicacion", cell: (c) => `${c.direccion.municipio}, ${c.direccion.departamento}` },
    { id: "limite", header: "Limite de credito", cell: (c) => formatCurrency(c.limiteCreditoGTQ), className: "text-right" },
    {
      id: "cartera",
      header: "Cartera vencida",
      cell: (c) =>
        c.carteraVencidaGTQ > 0 ? (
          <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(c.carteraVencidaGTQ)}</span>
        ) : (
          <span className="text-muted-foreground">Q0.00</span>
        ),
      className: "text-right",
    },
    { id: "estado", header: "Estado", cell: (c) => <StatusBadge status={c.activo ? "Activo" : "Inactivo"} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Cartera de clientes activos e inactivos de la compania."
        actions={
          <QuickCreateDialog
            trigger={
              <Button size="sm">
                <Plus />
                Nuevo cliente
              </Button>
            }
            title="Nuevo cliente"
            description="Registra un cliente para asignarle vendedor, lista de precios y condiciones de credito."
            fields={[
              { id: "razonSocial", label: "Razon social", required: true, placeholder: "Comercializadora Ejemplo, S.A." },
              { id: "nombreComercial", label: "Nombre comercial", required: true, placeholder: "Nombre comercial" },
              { id: "nit", label: "NIT", required: true, placeholder: "1234567-8" },
              { id: "segmento", label: "Segmento", type: "select", required: true, options: segmentoOptions },
              { id: "vendedorId", label: "Vendedor asignado", type: "select", required: true, options: vendedorOptions },
              { id: "listaPreciosId", label: "Lista de precios", type: "select", options: listasPrecios.map((l) => ({ label: l.nombre, value: l.id })) },
              { id: "limiteCredito", label: "Limite de credito (GTQ)", type: "number", placeholder: "0.00" },
              { id: "correo", label: "Correo de contacto", placeholder: "contacto@empresa.com" },
            ]}
          />
        }
      />

      <DataTable
        data={clientes}
        getRowId={(c) => c.id}
        loading={loading}
        searchPlaceholder="Buscar por nombre, codigo o NIT..."
        searchFn={(c, q) => [c.nombreComercial, c.razonSocial, c.codigo, c.nit].some((v) => v.toLowerCase().includes(q))}
        filters={[
          { id: "segmento", label: "Segmento", options: segmentoOptions },
          { id: "vendedorId", label: "Vendedor", options: vendedorOptions },
        ]}
        getStatus={(c) => (c.activo ? "Activo" : "Inactivo")}
        statusOptions={[
          { label: "Activo", value: "Activo" },
          { label: "Inactivo", value: "Inactivo" },
        ]}
        columns={columns}
        onRowClick={(c) => setSelected(c)}
        exportFileName="clientes"
        exportRow={(c) => ({
          Codigo: c.codigo,
          RazonSocial: c.razonSocial,
          NIT: c.nit,
          Segmento: c.segmento,
          LimiteCredito: c.limiteCreditoGTQ,
          SaldoActual: c.saldoActualGTQ,
          CarteraVencida: c.carteraVencidaGTQ,
          Estado: c.activo ? "Activo" : "Inactivo",
        })}
        rowActions={(c) => (
          <RowActionsMenu
            actions={[
              { label: "Ver detalle", icon: Eye, onSelect: () => setSelected(c) },
              { label: "Nueva cotizacion", icon: FileText, onSelect: () => router.push("/ventas/cotizaciones") },
              { label: "Nueva oportunidad", icon: Handshake, onSelect: () => router.push("/crm/oportunidades") },
              { label: "Editar cliente", icon: Pencil, onSelect: () => toast.info("Edicion de cliente", { description: "Formulario completo disponible en la version productiva." }) },
              {
                label: c.activo ? "Desactivar cliente" : "Activar cliente",
                icon: c.activo ? Ban : CheckCircle2,
                destructive: c.activo,
                separatorBefore: true,
                onSelect: () =>
                  toast.success(c.activo ? "Cliente desactivado (simulado)" : "Cliente activado (simulado)", {
                    description: c.nombreComercial,
                  }),
              },
            ]}
          />
        )}
        emptyTitle="Sin clientes"
        emptyDescription="No se encontraron clientes con los filtros seleccionados."
      />

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nombreComercial}
        description={selected?.razonSocial}
        headerExtra={
          selected && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline">{selected.segmento}</Badge>
              <StatusBadge status={selected.activo ? "Activo" : "Inactivo"} />
            </div>
          )
        }
        footer={
          selected && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => router.push("/ventas/cotizaciones")}>
                <FileText />
                Nueva cotizacion
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => toast.info("Edicion de cliente disponible en version productiva")}>
                <Pencil />
                Editar
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <>
            <DetailSection title="Informacion general">
              <DefinitionList
                items={[
                  { label: "Codigo", value: selected.codigo },
                  { label: "NIT", value: selected.nit },
                  { label: "Vendedor asignado", value: vendedores.find((v) => v.id === selected.vendedorId)?.nombre ?? "-" },
                  { label: "Lista de precios", value: listasPrecios.find((l) => l.id === selected.listaPreciosId)?.nombre ?? "-" },
                  { label: "Fecha de alta", value: formatDate(selected.fechaAlta) },
                  { label: "Dias de credito", value: `${selected.diasCredito} dias` },
                ]}
              />
            </DetailSection>
            <DetailSection title="Direccion y contacto">
              <DefinitionList
                items={[
                  { label: "Direccion", value: selected.direccion.linea1, full: true },
                  { label: "Municipio", value: selected.direccion.municipio },
                  { label: "Departamento", value: selected.direccion.departamento },
                  { label: "Telefono", value: selected.telefono },
                  { label: "Correo", value: selected.correo },
                ]}
              />
            </DetailSection>
            <DetailSection title="Condiciones comerciales">
              <DefinitionList
                items={[
                  { label: "Limite de credito", value: formatCurrency(selected.limiteCreditoGTQ) },
                  { label: "Saldo actual", value: formatCurrency(selected.saldoActualGTQ) },
                  {
                    label: "Cartera vencida",
                    value: (
                      <span className={selected.carteraVencidaGTQ > 0 ? "text-red-600 dark:text-red-400" : ""}>
                        {formatCurrency(selected.carteraVencidaGTQ)}
                      </span>
                    ),
                  },
                  {
                    label: "Credito disponible",
                    value: formatCurrency(Math.max(0, selected.limiteCreditoGTQ - selected.saldoActualGTQ)),
                  },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
