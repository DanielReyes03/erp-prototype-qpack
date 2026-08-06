"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useCxcStore, bucketDe } from "@/lib/store/cxc";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { EstadoCuentaModal } from "./_components/EstadoCuentaModal";

interface FilaCliente {
  clienteId: string;
  nombre: string;
  corriente: number;
  b1_30: number;
  b31_60: number;
  b61_90: number;
  b90mas: number;
  total: number;
}

export default function CxcPage() {
  const documentos = useCxcStore((s) => s.documentos);
  const [search, setSearch] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState<string | undefined>(undefined);

  const filas = useMemo<FilaCliente[]>(() => {
    const map = new Map<string, FilaCliente>();
    for (const doc of documentos) {
      if (doc.saldoPendiente <= 0) continue;
      const cliente = CLIENTES_SEED.find((c) => c.id === doc.clienteId);
      if (!cliente) continue;
      const fila = map.get(doc.clienteId) ?? {
        clienteId: doc.clienteId,
        nombre: cliente.nombreComercial,
        corriente: 0,
        b1_30: 0,
        b31_60: 0,
        b61_90: 0,
        b90mas: 0,
        total: 0,
      };
      const bucket = bucketDe(doc.fechaVencimiento);
      if (bucket === "corriente") fila.corriente += doc.saldoPendiente;
      else if (bucket === "1-30") fila.b1_30 += doc.saldoPendiente;
      else if (bucket === "31-60") fila.b31_60 += doc.saldoPendiente;
      else if (bucket === "61-90") fila.b61_90 += doc.saldoPendiente;
      else fila.b90mas += doc.saldoPendiente;
      fila.total += doc.saldoPendiente;
      map.set(doc.clienteId, fila);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [documentos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter((f) => f.nombre.toLowerCase().includes(q));
  }, [filas, search]);

  const totalCartera = filas.reduce((s, f) => s + f.total, 0);
  const totalVencida = filas.reduce((s, f) => s + f.b1_30 + f.b31_60 + f.b61_90 + f.b90mas, 0);
  const clientesConSaldo = filas.length;

  const columns: DataTableColumn<FilaCliente>[] = [
    { key: "cliente", header: "Cliente", sortAccessor: (f) => f.nombre, cell: (f) => f.nombre },
    {
      key: "corriente",
      header: "Corriente",
      align: "right",
      cell: (f) => <MoneyCell amount={f.corriente} />,
    },
    { key: "b1_30", header: "1-30 días", align: "right", cell: (f) => <MoneyCell amount={f.b1_30} /> },
    { key: "b31_60", header: "31-60 días", align: "right", cell: (f) => <MoneyCell amount={f.b31_60} /> },
    { key: "b61_90", header: "61-90 días", align: "right", cell: (f) => <MoneyCell amount={f.b61_90} /> },
    {
      key: "b90mas",
      header: "+90 días",
      align: "right",
      cell: (f) => <MoneyCell amount={f.b90mas} colorizeNegative={false} className={f.b90mas > 0 ? "text-[#DC2626]" : ""} />,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (f) => f.total,
      cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" />,
    },
  ];

  const selectedCliente = CLIENTES_SEED.find((c) => c.id === selectedClienteId);

  return (
    <div>
      <PageHeader
        title="Cuentas por cobrar"
        description="Antigüedad de saldos por cliente y aplicación de pagos"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Cartera total" value={formatMoney(totalCartera)} icon={Wallet} />
        <KpiCard label="Cartera vencida" value={formatMoney(totalVencida)} icon={AlertTriangle} />
        <KpiCard label="Clientes con saldo" value={String(clientesConSaldo)} icon={TrendingUp} />
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar cliente…" />

      <DataTable
        ariaLabel="Antigüedad de saldos por cliente"
        columns={columns}
        rows={filtered}
        getRowId={(f) => f.clienteId}
        emptyTitle="Sin saldos pendientes"
        emptyDescription="Ningún cliente tiene documentos de cuentas por cobrar pendientes."
        onRowClick={(f) => setSelectedClienteId(f.clienteId)}
      />

      <EstadoCuentaModal
        isOpen={!!selectedClienteId}
        onOpenChange={(open) => !open && setSelectedClienteId(undefined)}
        cliente={selectedCliente}
      />
    </div>
  );
}
