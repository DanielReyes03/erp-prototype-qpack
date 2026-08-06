"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDateTime } from "@/lib/format";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import type { MovimientoBancario } from "@/lib/seed/tesoreria";

const TIPO_LABEL: Record<string, string> = {
  deposito: "Depósito",
  cheque: "Cheque emitido",
  "transferencia-entrada": "Transferencia recibida",
  "transferencia-salida": "Transferencia enviada",
};

function esEntrada(tipo: string) {
  return tipo === "deposito" || tipo === "transferencia-entrada";
}

export default function MovimientosTesoreriaPage() {
  const movimientos = useTesoreriaStore((s) => s.movimientos);
  const cuentas = useTesoreriaStore((s) => s.cuentas);
  const [search, setSearch] = useState("");
  const [cuentaFilter, setCuentaFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movimientos
      .filter((m) => !cuentaFilter || m.cuentaId === cuentaFilter)
      .filter(
        (m) =>
          !q ||
          m.descripcion.toLowerCase().includes(q) ||
          m.referencia?.toLowerCase().includes(q),
      );
  }, [movimientos, search, cuentaFilter]);

  const columns: DataTableColumn<MovimientoBancario>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (m) => <span className="font-data text-xs">{formatDateTime(m.fecha)}</span>,
    },
    { key: "cuenta", header: "Cuenta", cell: (m) => cuentas.find((c) => c.id === m.cuentaId)?.nombre ?? "—" },
    {
      key: "tipo",
      header: "Movimiento",
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          {esEntrada(m.tipo) ? (
            <ArrowDownRight className="size-3.5 text-[#059669]" />
          ) : (
            <ArrowUpRight className="size-3.5 text-[#DC2626]" />
          )}
          {TIPO_LABEL[m.tipo]}
        </div>
      ),
    },
    { key: "descripcion", header: "Descripción", cell: (m) => m.descripcion },
    { key: "referencia", header: "Referencia", cell: (m) => <span className="font-data">{m.referencia ?? "—"}</span> },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      cell: (m) => {
        const cuenta = cuentas.find((c) => c.id === m.cuentaId);
        return (
          <span className={esEntrada(m.tipo) ? "text-[#059669]" : "text-[#DC2626]"}>
            <MoneyCell amount={esEntrada(m.tipo) ? m.monto : -m.monto} currency={cuenta?.moneda} inline />
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Movimientos de tesorería"
        description="Depósitos, cheques y transferencias de todas las cuentas"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por descripción o referencia…"
      >
        <select
          className="h-8 rounded-xl border border-slate-200 bg-white shadow-surface px-2 text-sm text-slate-700"
          value={cuentaFilter}
          onChange={(e) => setCuentaFilter(e.target.value)}
        >
          <option value="">Todas las cuentas</option>
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        ariaLabel="Movimientos de tesorería"
        columns={columns}
        rows={filtered}
        getRowId={(m) => m.id}
        emptyTitle="Sin movimientos"
        emptyDescription="No se encontraron movimientos con los filtros actuales."
      />
    </div>
  );
}
