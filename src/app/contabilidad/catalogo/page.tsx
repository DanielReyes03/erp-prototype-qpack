"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { cn } from "@/lib/cn";
import { CATALOGO_CUENTAS, hijosDe, type CuentaContable, type TipoCuenta } from "@/lib/seed/catalogo-cuentas";

const TIPO_COLOR: Record<TipoCuenta, string> = {
  Activo: "bg-blue-50 text-blue-700",
  Pasivo: "bg-[#FEF3C7] text-[#D97706]",
  Patrimonio: "bg-[#EDE9FE] text-[#6D28D9]",
  Ingreso: "bg-[#D1FAE5] text-[#059669]",
  Costo: "bg-[#FFE4E6] text-[#BE123C]",
  Gasto: "bg-[#FEE2E2] text-[#DC2626]",
};

function CuentaNode({ cuenta, depth }: { cuenta: CuentaContable; depth: number }) {
  const hijos = hijosDe(cuenta.codigo);
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = hijos.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50",
          cuenta.imputable && "cursor-default",
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
          >
            <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}
        <span className="font-data w-24 shrink-0 text-xs text-slate-500">{cuenta.codigo}</span>
        <span className={cn("truncate text-sm", cuenta.nivel === 1 ? "font-semibold text-slate-900" : "text-slate-700")}>
          {cuenta.nombre}
        </span>
        {cuenta.imputable ? (
          <span className={cn("ms-auto rounded-full px-2 py-0.5 text-[11px] font-medium", TIPO_COLOR[cuenta.tipo])}>
            {cuenta.tipo}
          </span>
        ) : null}
      </div>
      {hasChildren && open ? (
        <div>
          {hijos.map((hijo) => (
            <CuentaNode key={hijo.codigo} cuenta={hijo} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CatalogoCuentasPage() {
  const raices = CATALOGO_CUENTAS.filter((c) => !c.padreCodigo);

  return (
    <div>
      <PageHeader
        title="Catálogo de cuentas"
        description="Estructura contable jerárquica: mayor, submayor y cuentas de detalle"
      />

      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-surface">
        {raices.map((cuenta) => (
          <CuentaNode key={cuenta.codigo} cuenta={cuenta} depth={0} />
        ))}
      </div>
    </div>
  );
}
