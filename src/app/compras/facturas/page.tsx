"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Tabs, Button, Modal } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { PolizaCard } from "@/components/patterns/PolizaCard";
import { formatDate } from "@/lib/format";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import type { FacturaProveedor, NotaCreditoProveedor } from "@/lib/seed/facturas-proveedor";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { FacturaFormModal } from "./_components/FacturaFormModal";
import { NotaCreditoFormModal } from "./_components/NotaCreditoFormModal";

function proveedorNombre(id: string) {
  return PROVEEDORES_SEED.find((p) => p.id === id)?.nombreComercial ?? "—";
}

export default function FacturasProveedorPage() {
  const facturas = useFacturasProveedorStore((s) => s.facturas);
  const notasCredito = useFacturasProveedorStore((s) => s.notasCredito);
  const getPolizasPorOrigen = useContabilidadStore((s) => s.getPolizasPorOrigen);
  const [facturaOpen, setFacturaOpen] = useState(false);
  const [notaOpen, setNotaOpen] = useState(false);
  const [facturaVista, setFacturaVista] = useState<FacturaProveedor | undefined>(undefined);
  const polizasVista = facturaVista ? getPolizasPorOrigen(facturaVista.id) : [];

  const columnsFacturas: DataTableColumn<FacturaProveedor>[] = [
    {
      key: "id",
      header: "Factura",
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data font-medium text-blue-700">{f.numeroFactura}</span>,
    },
    { key: "proveedor", header: "Proveedor", cell: (f) => proveedorNombre(f.proveedorId) },
    { key: "oc", header: "Orden de compra", cell: (f) => f.ordenCompraId ?? "—" },
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (f) => f.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (f) => <span className="font-data">{formatDate(f.fecha)}</span>,
    },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      sortAccessor: (f) => f.monto,
      cell: (f) => <MoneyCell amount={f.monto} currency={f.moneda} />,
    },
  ];

  const columnsNotas: DataTableColumn<NotaCreditoProveedor>[] = [
    {
      key: "id",
      header: "Nota de crédito",
      cellClassName: "whitespace-nowrap",
      cell: (n) => <span className="font-data font-medium text-blue-700">{n.id}</span>,
    },
    { key: "factura", header: "Factura relacionada", cell: (n) => n.facturaId },
    { key: "proveedor", header: "Proveedor", cell: (n) => proveedorNombre(n.proveedorId) },
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (n) => <span className="font-data">{formatDate(n.fecha)}</span>,
    },
    { key: "motivo", header: "Motivo", cell: (n) => n.motivo },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      cell: (n) => <MoneyCell amount={n.monto} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Facturas de proveedor"
        description="Facturación y notas de crédito de compras a proveedores"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onPress={() => setNotaOpen(true)}>
              <Plus className="size-4" />
              Nota de crédito
            </Button>
            <Button onPress={() => setFacturaOpen(true)}>
              <Plus className="size-4" />
              Nueva factura
            </Button>
          </div>
        }
      />

      <Tabs defaultSelectedKey="facturas">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Secciones de facturación de proveedores">
            <Tabs.Tab id="facturas">
              Facturas
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="notas">
              Notas de crédito
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="facturas" className="pt-4">
          <DataTable
            ariaLabel="Facturas de proveedor"
            columns={columnsFacturas}
            rows={facturas}
            getRowId={(f) => f.id}
            emptyTitle="Sin facturas registradas"
            rowActions={[
              {
                key: "poliza",
                label: "Ver póliza contable",
                icon: FileText,
                onSelect: (f) => setFacturaVista(f),
              },
            ]}
          />
        </Tabs.Panel>
        <Tabs.Panel id="notas" className="pt-4">
          <DataTable
            ariaLabel="Notas de crédito de proveedor"
            columns={columnsNotas}
            rows={notasCredito}
            getRowId={(n) => n.id}
            emptyTitle="Sin notas de crédito"
          />
        </Tabs.Panel>
      </Tabs>

      <FacturaFormModal isOpen={facturaOpen} onOpenChange={setFacturaOpen} />
      <NotaCreditoFormModal isOpen={notaOpen} onOpenChange={setNotaOpen} />

      <Modal.Backdrop
        isOpen={!!facturaVista}
        onOpenChange={(open) => !open && setFacturaVista(undefined)}
      >
        <Modal.Container size="md">
          <Modal.Dialog aria-label="Póliza contable de la factura">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Póliza — {facturaVista?.numeroFactura}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              {polizasVista.length === 0 ? (
                <p className="text-sm text-slate-500">No se encontró una póliza asociada.</p>
              ) : (
                polizasVista.map((p) => <PolizaCard key={p.id} poliza={p} />)
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
