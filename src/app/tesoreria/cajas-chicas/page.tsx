"use client";

import { useState } from "react";
import { Plus, RefreshCcw, Wallet } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDateTime } from "@/lib/format";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import type { MovimientoCajaChica } from "@/lib/seed/tesoreria";
import { GastoCajaFormModal } from "./_components/GastoCajaFormModal";

export default function CajasChicasPage() {
  const cajas = useTesoreriaStore((s) => s.cajas);
  const movimientosCaja = useTesoreriaStore((s) => s.movimientosCaja);
  const reponerCaja = useTesoreriaStore((s) => s.reponerCaja);
  const [gastoOpen, setGastoOpen] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<string | undefined>(undefined);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleReponer(cajaId: string, monto: number) {
    setPendingId(cajaId);
    try {
      await reponerCaja(cajaId, monto);
      toast.success("Fondo repuesto", { description: `Q ${monto.toFixed(2)}` });
    } finally {
      setPendingId(null);
    }
  }

  const columns: DataTableColumn<MovimientoCajaChica>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (m) => <span className="font-data text-xs">{formatDateTime(m.fecha)}</span>,
    },
    {
      key: "caja",
      header: "Caja",
      cell: (m) => cajas.find((c) => c.id === m.cajaId)?.nombre ?? "—",
    },
    {
      key: "tipo",
      header: "Tipo",
      cell: (m) => (
        <span className={m.tipo === "gasto" ? "text-[#DC2626]" : "text-[#059669]"}>
          {m.tipo === "gasto" ? "Gasto" : "Reposición"}
        </span>
      ),
    },
    { key: "concepto", header: "Concepto", cell: (m) => m.concepto },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      cell: (m) => (
        <span className={m.tipo === "gasto" ? "text-[#DC2626]" : "text-[#059669]"}>
          <MoneyCell amount={m.tipo === "gasto" ? -m.monto : m.monto} inline />
        </span>
      ),
    },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      cell: (m) => <MoneyCell amount={m.saldoResultante} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cajas chicas"
        description="Fondos fijos por responsable, gastos y reposición"
        actions={
          <Button
            onPress={() => {
              setCajaSeleccionada(undefined);
              setGastoOpen(true);
            }}
          >
            <Plus className="size-4" />
            Registrar gasto
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cajas.map((caja) => {
          const pct = Math.round((caja.saldoActual / caja.montoAsignado) * 100);
          return (
            <div key={caja.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-surface">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Wallet className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{caja.nombre}</p>
                    <p className="text-xs text-slate-500">{caja.responsable}</p>
                  </div>
                </div>
              </div>
              <div className="mb-1 flex items-end justify-between">
                <MoneyCell amount={caja.saldoActual} className="text-xl font-semibold text-blue-700" />
                <span className="font-data text-xs text-slate-500">de {caja.montoAsignado.toFixed(2)}</span>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${pct <= 25 ? "bg-[#DC2626]" : pct <= 50 ? "bg-[#D97706]" : "bg-[#059669]"}`}
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onPress={() => {
                    setCajaSeleccionada(caja.id);
                    setGastoOpen(true);
                  }}
                >
                  Registrar gasto
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isPending={pendingId === caja.id}
                  isDisabled={caja.saldoActual >= caja.montoAsignado}
                  onPress={() => handleReponer(caja.id, caja.montoAsignado - caja.saldoActual)}
                >
                  <RefreshCcw className="size-3.5" />
                  Reponer
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        ariaLabel="Movimientos de cajas chicas"
        columns={columns}
        rows={movimientosCaja}
        getRowId={(m) => m.id}
        emptyTitle="Sin movimientos"
        emptyDescription="No se han registrado gastos ni reposiciones."
      />

      <GastoCajaFormModal isOpen={gastoOpen} onOpenChange={setGastoOpen} cajaId={cajaSeleccionada} />
    </div>
  );
}
