"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { formatDateTime } from "@/lib/format";
import { useInventarioStore } from "@/lib/store/inventario";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import { TrasladoFormModal } from "./_components/TrasladoFormModal";

interface TrasladoRow {
  id: string;
  fecha: string;
  productoId: string;
  origenId: string;
  destinoId: string;
  cantidad: number;
  documentoReferencia?: string;
  motivo: string;
}

function locacionNombre(id: string) {
  return LOCACIONES_SEED.find((l) => l.id === id)?.nombre ?? "—";
}

export default function TrasladosPage() {
  const movimientos = useInventarioStore((s) => s.movimientos);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const rows: TrasladoRow[] = useMemo(() => {
    const salidas = movimientos.filter((m) => m.tipo === "traslado-salida");
    return salidas
      .map((s) => ({
        id: s.id,
        fecha: s.fecha,
        productoId: s.productoId,
        origenId: s.locacionId,
        destinoId: s.locacionRelacionadaId ?? "",
        cantidad: s.cantidad,
        documentoReferencia: s.documentoReferencia,
        motivo: s.motivo,
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const p = PRODUCTOS_SEED.find((pr) => pr.id === r.productoId);
      return (
        p?.nombre.toLowerCase().includes(q) ||
        p?.sku.toLowerCase().includes(q) ||
        r.documentoReferencia?.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const columns: DataTableColumn<TrasladoRow>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (r) => <span className="font-data text-xs">{formatDateTime(r.fecha)}</span>,
    },
    {
      key: "producto",
      header: "Producto",
      cell: (r) => {
        const p = PRODUCTOS_SEED.find((pr) => pr.id === r.productoId);
        return (
          <div className="flex flex-col">
            <span>{p?.nombre}</span>
            <span className="font-data text-xs text-slate-500">{p?.sku}</span>
          </div>
        );
      },
    },
    {
      key: "ruta",
      header: "Ruta",
      cell: (r) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span>{locacionNombre(r.origenId)}</span>
          <ArrowRight className="size-3.5 text-slate-400" />
          <span>{locacionNombre(r.destinoId)}</span>
        </div>
      ),
    },
    {
      key: "cantidad",
      header: "Cantidad",
      align: "right",
      cell: (r) => <span className="font-data">{r.cantidad.toLocaleString("en-US")}</span>,
    },
    { key: "documento", header: "Documento", cell: (r) => <span className="font-data">{r.documentoReferencia ?? "—"}</span> },
    { key: "motivo", header: "Motivo", cell: (r) => r.motivo },
  ];

  return (
    <div>
      <PageHeader
        title="Traslados"
        description="Movimientos de producto entre bodegas y sucursales"
        actions={
          <Button onPress={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo traslado
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por producto, SKU o documento…"
      />

      <DataTable
        ariaLabel="Traslados entre locaciones"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        emptyTitle="Sin traslados"
        emptyDescription="No se encontraron traslados con los filtros actuales."
      />

      <TrasladoFormModal isOpen={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
