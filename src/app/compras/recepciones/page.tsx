"use client";

import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDate } from "@/lib/format";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import type { OrdenCompra } from "@/lib/seed/ordenes-compra";
import { proveedorDe } from "../ordenes/_components/oc-helpers";
import { RecepcionModal } from "../ordenes/_components/RecepcionModal";

export default function RecepcionesPage() {
  const ordenes = useOrdenesCompraStore((s) => s.ordenes);
  const [search, setSearch] = useState("");
  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const target = ordenes.find((o) => o.id === targetId);

  const pendientes = useMemo(
    () => ordenes.filter((o) => o.estado === "confirmada" || o.estado === "recibida-parcial"),
    [ordenes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendientes;
    return pendientes.filter((o) => {
      const prov = proveedorDe(o.proveedorId);
      return o.id.toLowerCase().includes(q) || prov?.nombreComercial.toLowerCase().includes(q);
    });
  }, [pendientes, search]);

  const columns: DataTableColumn<OrdenCompra>[] = [
    {
      key: "id",
      header: "Orden",
      cellClassName: "whitespace-nowrap",
      cell: (o) => <span className="font-data font-medium text-blue-700">{o.id}</span>,
    },
    { key: "proveedor", header: "Proveedor", cell: (o) => proveedorDe(o.proveedorId)?.nombreComercial ?? "—" },
    {
      key: "fecha",
      header: "Confirmada",
      cellClassName: "whitespace-nowrap",
      cell: (o) => <span className="font-data">{o.fechaConfirmacion ? formatDate(o.fechaConfirmacion) : "—"}</span>,
    },
    {
      key: "lineas",
      header: "Líneas pendientes",
      align: "right",
      cell: (o) => (
        <span className="font-data">
          {o.lineas.filter((l) => l.cantidadRecibida < l.cantidad).length} de {o.lineas.length}
        </span>
      ),
    },
    { key: "estado", header: "Estado", cell: (o) => <StatusChip status={`oc:${o.estado}`} /> },
    {
      key: "accion",
      header: "",
      align: "right",
      cell: (o) => (
        <Button size="sm" onPress={() => setTargetId(o.id)}>
          <PackageCheck className="size-3.5" />
          Recibir mercadería
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Recepciones"
        description="Órdenes de compra confirmadas pendientes de recibir, total o parcialmente"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número de orden o proveedor…"
      />

      <DataTable
        ariaLabel="Órdenes de compra pendientes de recepción"
        columns={columns}
        rows={filtered}
        getRowId={(o) => o.id}
        emptyTitle="Sin recepciones pendientes"
        emptyDescription="Todas las órdenes de compra confirmadas ya fueron recibidas."
      />

      {target ? (
        <RecepcionModal
          isOpen={!!target}
          onOpenChange={(open) => !open && setTargetId(undefined)}
          orden={target}
        />
      ) : null}
    </div>
  );
}
