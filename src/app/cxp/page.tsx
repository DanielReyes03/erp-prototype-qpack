"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { Landmark, AlertTriangle } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useCxpStore } from "@/lib/store/cxp";
import { bucketDe } from "@/lib/store/cxc";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { EstadoCuentaProveedorModal } from "./_components/EstadoCuentaProveedorModal";

interface FilaProveedor {
  proveedorId: string;
  nombre: string;
  corriente: number;
  b1_30: number;
  b31_60: number;
  b61_90: number;
  b90mas: number;
  total: number;
}

export default function CxpPage() {
  const documentos = useCxpStore((s) => s.documentos);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const filas = useMemo<FilaProveedor[]>(() => {
    const map = new Map<string, FilaProveedor>();
    for (const doc of documentos) {
      if (doc.saldoPendiente <= 0) continue;
      const proveedor = PROVEEDORES_SEED.find((p) => p.id === doc.proveedorId);
      if (!proveedor) continue;
      const fila = map.get(doc.proveedorId) ?? {
        proveedorId: doc.proveedorId,
        nombre: proveedor.nombreComercial,
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
      map.set(doc.proveedorId, fila);
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

  const columns: DataTableColumn<FilaProveedor>[] = [
    { key: "proveedor", header: "Proveedor", sortAccessor: (f) => f.nombre, cell: (f) => f.nombre },
    { key: "corriente", header: "Corriente", align: "right", cell: (f) => <MoneyCell amount={f.corriente} /> },
    { key: "b1_30", header: "1-30 días", align: "right", cell: (f) => <MoneyCell amount={f.b1_30} /> },
    { key: "b31_60", header: "31-60 días", align: "right", cell: (f) => <MoneyCell amount={f.b31_60} /> },
    { key: "b61_90", header: "61-90 días", align: "right", cell: (f) => <MoneyCell amount={f.b61_90} /> },
    { key: "b90mas", header: "+90 días", align: "right", cell: (f) => <MoneyCell amount={f.b90mas} /> },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortAccessor: (f) => f.total,
      cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" />,
    },
  ];

  const selectedProveedor = PROVEEDORES_SEED.find((p) => p.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Cuentas por pagar"
        description="Antigüedad de saldos por proveedor y programación de pagos"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Cartera total por pagar" value={formatMoney(totalCartera)} icon={Landmark} />
        <KpiCard label="Cartera vencida" value={formatMoney(totalVencida)} icon={AlertTriangle} />
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar proveedor…" />

      <DataTable
        ariaLabel="Antigüedad de saldos por proveedor"
        columns={columns}
        rows={filtered}
        getRowId={(f) => f.proveedorId}
        emptyTitle="Sin saldos pendientes"
        emptyDescription="Ningún proveedor tiene documentos de cuentas por pagar pendientes."
        onRowClick={(f) => setSelectedId(f.proveedorId)}
      />

      <EstadoCuentaProveedorModal
        isOpen={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(undefined)}
        proveedor={selectedProveedor}
      />
    </div>
  );
}
