"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Tabs } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { cn } from "@/lib/cn";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/seed/geografia";

const ZONAS_CAPITAL = Array.from({ length: 25 }, (_, i) => i + 1);

function DepartamentosMunicipios() {
  const [selected, setSelected] = useState(DEPARTAMENTOS[0].id);
  const municipios = municipiosDe(selected);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white shadow-surface">
        <ul className="max-h-[520px] overflow-y-auto py-1" data-scrollbar="thin">
          {DEPARTAMENTOS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelected(d.id)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                  selected === d.id
                    ? "bg-blue-700 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span>{d.nombre}</span>
                <span
                  className={cn(
                    "font-data text-xs",
                    selected === d.id ? "text-white/80" : "text-slate-400",
                  )}
                >
                  {municipiosDe(d.id).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
        <div className="border-b border-slate-200 px-4 py-2.5">
          <p className="text-sm font-semibold text-slate-900">
            Municipios de {DEPARTAMENTOS.find((d) => d.id === selected)?.nombre}
          </p>
        </div>
        <ul className="grid max-h-[470px] grid-cols-1 gap-0 overflow-y-auto sm:grid-cols-2" data-scrollbar="thin">
          {municipios.map((m) => (
            <li key={m.id} className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm text-slate-700">
              <MapPin className="size-3.5 shrink-0 text-slate-400" />
              {m.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ZonasCapital() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-surface p-4">
      <p className="mb-3 text-sm text-slate-500">
        Zonas de referencia para direcciones fiscales en Guatemala y Mixco. Se usan como campo
        libre en clientes, proveedores y almacenes.
      </p>
      <div className="flex flex-wrap gap-2">
        {ZONAS_CAPITAL.map((z) => (
          <span
            key={z}
            className="font-data rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
          >
            Zona {z}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GeografiaPage() {
  return (
    <div>
      <PageHeader
        title="Geografía"
        description="Departamentos, municipios y zonas de referencia. Las bodegas y sucursales se gestionan en Almacenes."
      />

      <Tabs defaultSelectedKey="deptos">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Secciones de geografía">
            <Tabs.Tab id="deptos">
              Departamentos y municipios
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="zonas">
              Zonas
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="deptos" className="pt-4">
          <DepartamentosMunicipios />
        </Tabs.Panel>
        <Tabs.Panel id="zonas" className="pt-4">
          <ZonasCapital />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
