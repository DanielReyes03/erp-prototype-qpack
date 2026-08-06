"use client";

import { useState } from "react";
import { Plus, ArrowLeftRight, Landmark } from "lucide-react";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import type { CuentaBancaria } from "@/lib/seed/tesoreria";
import { CuentaDetalleModal } from "./_components/CuentaDetalleModal";
import { MovimientoFormModal } from "./_components/MovimientoFormModal";
import { TransferenciaFormModal } from "./_components/TransferenciaFormModal";

export default function CuentasBancariasPage() {
  const cuentas = useTesoreriaStore((s) => s.cuentas);
  const [detalle, setDetalle] = useState<CuentaBancaria | undefined>(undefined);
  const [movOpen, setMovOpen] = useState(false);
  const [transfOpen, setTransfOpen] = useState(false);

  const totalGTQ = cuentas.filter((c) => c.moneda === "GTQ").reduce((s, c) => s + c.saldo, 0);
  const totalUSD = cuentas.filter((c) => c.moneda === "USD").reduce((s, c) => s + c.saldo, 0);

  return (
    <div>
      <PageHeader
        title="Cuentas bancarias"
        description="Saldos y movimientos de las cuentas de la empresa"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onPress={() => setTransfOpen(true)}>
              <ArrowLeftRight className="size-4" />
              Transferencia
            </Button>
            <Button onPress={() => setMovOpen(true)}>
              <Plus className="size-4" />
              Depósito / cheque
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total en quetzales</p>
          <p className="font-data mt-1 text-2xl font-semibold text-slate-900">{`Q ${totalGTQ.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total en dólares</p>
          <p className="font-data mt-1 text-2xl font-semibold text-slate-900">{`$ ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cuentas.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setDetalle(c)}
            className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 text-left hover:border-blue-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Landmark className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {c.banco} · {c.tipoCuenta}
                  </p>
                </div>
              </div>
              <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {c.moneda}
              </span>
            </div>
            <p className="font-data text-xs text-slate-500">{c.numeroCuenta}</p>
            <MoneyCell amount={c.saldo} currency={c.moneda} className="text-xl font-semibold text-blue-700" />
          </button>
        ))}
      </div>

      <CuentaDetalleModal isOpen={!!detalle} onOpenChange={(o) => !o && setDetalle(undefined)} cuenta={detalle} />
      <MovimientoFormModal isOpen={movOpen} onOpenChange={setMovOpen} />
      <TransferenciaFormModal isOpen={transfOpen} onOpenChange={setTransfOpen} />
    </div>
  );
}
