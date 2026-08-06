"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDateTime } from "@/lib/format";
import { useInventarioStore } from "@/lib/store/inventario";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import type { MovimientoInventario } from "@/lib/seed/kardex";
import { MovimientoFormModal } from "./_components/MovimientoFormModal";

const TIPO_LABEL: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  "ajuste-positivo": "Ajuste positivo",
  "ajuste-negativo": "Ajuste negativo",
};

function esEntrada(tipo: string) {
  return tipo === "entrada" || tipo === "ajuste-positivo";
}

export default function MovimientosPage() {
  const movimientos = useInventarioStore((s) => s.movimientos);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movimientos
      .filter((m) => m.tipo === "entrada" || m.tipo === "salida" || m.tipo.startsWith("ajuste"))
      .filter((m) => {
        const producto = PRODUCTOS_SEED.find((p) => p.id === m.productoId);
        return (
          !q ||
          producto?.nombre.toLowerCase().includes(q) ||
          producto?.sku.toLowerCase().includes(q) ||
          m.documentoReferencia?.toLowerCase().includes(q)
        );
      })
      .filter((m) => !tipoFilter || m.tipo === tipoFilter)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos, search, tipoFilter]);

  const columns: DataTableColumn<MovimientoInventario>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (m) => <span className="font-data text-xs">{formatDateTime(m.fecha)}</span>,
    },
    {
      key: "tipo",
      header: "Tipo",
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          {esEntrada(m.tipo) ? (
            <ArrowDownRight className="size-3.5 text-[#059669]" />
          ) : (
            <ArrowUpRight className="size-3.5 text-[#DC2626]" />
          )}
          {TIPO_LABEL[m.tipo] ?? m.tipo}
        </div>
      ),
    },
    {
      key: "producto",
      header: "Producto",
      cell: (m) => {
        const p = PRODUCTOS_SEED.find((pr) => pr.id === m.productoId);
        return (
          <div className="flex flex-col">
            <span>{p?.nombre}</span>
            <span className="font-data text-xs text-slate-500">{p?.sku}</span>
          </div>
        );
      },
    },
    { key: "locacion", header: "Locación", cell: (m) => LOCACIONES_SEED.find((l) => l.id === m.locacionId)?.nombre },
    { key: "documento", header: "Documento", cell: (m) => <span className="font-data">{m.documentoReferencia ?? "—"}</span> },
    { key: "motivo", header: "Motivo", cell: (m) => m.motivo },
    {
      key: "cantidad",
      header: "Cantidad",
      align: "right",
      cell: (m) => (
        <span className={`font-data ${esEntrada(m.tipo) ? "text-[#059669]" : "text-[#DC2626]"}`}>
          {esEntrada(m.tipo) ? "+" : "-"}
          {m.cantidad.toLocaleString("en-US")}
        </span>
      ),
    },
    {
      key: "costo",
      header: "Costo unitario",
      align: "right",
      cell: (m) => <MoneyCell amount={m.costoUnitario} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Entradas y salidas"
        description="Registro de movimientos de inventario: compras, ventas y ajustes"
        actions={
          <Button onPress={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo movimiento
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por producto, SKU o documento…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="ajuste-positivo">Ajuste positivo</option>
          <option value="ajuste-negativo">Ajuste negativo</option>
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Movimientos de inventario"
        columns={columns}
        rows={rows}
        getRowId={(m) => m.id}
        emptyTitle="Sin movimientos"
        emptyDescription="No se encontraron movimientos con los filtros actuales."
      />

      <MovimientoFormModal isOpen={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
