"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight, Phone, Users2, ListChecks, Mail, Check } from "lucide-react";
import { Tabs, Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { EntityAvatar } from "@/components/patterns/EntityAvatar";
import { cn } from "@/lib/cn";
import { formatDate, toLocalDate } from "@/lib/format";
import { useActividadesStore } from "@/lib/store/actividades";
import type { Actividad, TipoActividad } from "@/lib/seed/actividades";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { ActividadFormModal } from "./_components/ActividadFormModal";

const HOY = new Date(2026, 7, 5);

const TIPO_ICON: Record<TipoActividad, typeof Phone> = {
  llamada: Phone,
  reunion: Users2,
  tarea: ListChecks,
  email: Mail,
};

const TIPO_LABEL: Record<TipoActividad, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  tarea: "Tarea",
  email: "Correo",
};

function clienteNombre(id?: string) {
  if (!id) return "—";
  return CLIENTES_SEED.find((c) => c.id === id)?.nombreComercial ?? "—";
}
function vendedorNombre(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id)?.nombre ?? "—";
}

function estadoDe(actividad: Actividad): string {
  if (actividad.completada) return "act:completada";
  if (toLocalDate(actividad.fecha) < HOY) return "act:vencida";
  return "act:pendiente";
}

export default function ActividadesPage() {
  const actividades = useActividadesStore((s) => s.actividades);
  const completarActividad = useActividadesStore((s) => s.completarActividad);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [mesActual, setMesActual] = useState(startOfMonth(HOY));
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);

  const ordenadas = useMemo(
    () => [...actividades].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [actividades],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ordenadas;
    return ordenadas.filter(
      (a) => a.asunto.toLowerCase().includes(q) || clienteNombre(a.clienteId).toLowerCase().includes(q),
    );
  }, [ordenadas, search]);

  const columns: DataTableColumn<Actividad>[] = [
    {
      key: "tipo",
      header: "Tipo",
      cell: (a) => {
        const Icon = TIPO_ICON[a.tipo];
        return (
          <span className="flex items-center gap-1.5 text-slate-600">
            <Icon className="size-3.5" />
            {TIPO_LABEL[a.tipo]}
          </span>
        );
      },
    },
    { key: "asunto", header: "Asunto", cell: (a) => a.asunto },
    { key: "cliente", header: "Cliente", cell: (a) => clienteNombre(a.clienteId) },
    {
      key: "vendedor",
      header: "Responsable",
      cell: (a) => (
        <div className="flex items-center gap-2">
          <EntityAvatar name={vendedorNombre(a.vendedorId)} />
          <span>{vendedorNombre(a.vendedorId)}</span>
        </div>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      sortAccessor: (a) => a.fecha,
      cellClassName: "whitespace-nowrap",
      cell: (a) => <span className="font-data">{formatDate(a.fecha)}</span>,
    },
    { key: "estado", header: "Estado", cell: (a) => <StatusChip status={estadoDe(a)} /> },
  ];

  const diasCalendario = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 0 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const actividadesPorDia = useMemo(() => {
    const mapa = new Map<string, Actividad[]>();
    for (const a of actividades) {
      const key = format(toLocalDate(a.fecha), "yyyy-MM-dd");
      const lista = mapa.get(key) ?? [];
      lista.push(a);
      mapa.set(key, lista);
    }
    return mapa;
  }, [actividades]);

  const actividadesDelDiaSeleccionado = diaSeleccionado
    ? (actividadesPorDia.get(format(diaSeleccionado, "yyyy-MM-dd")) ?? [])
    : [];

  return (
    <div>
      <PageHeader
        title="Actividades"
        description="Llamadas, reuniones, tareas y correos de seguimiento comercial"
        actions={
          <Button onPress={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nueva actividad
          </Button>
        }
      />

      <Tabs defaultSelectedKey="lista">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Vistas de actividades">
            <Tabs.Tab id="lista">
              Lista
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="calendario">
              Calendario
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="lista" className="pt-4">
          <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar por asunto o cliente…" />
          <DataTable
            ariaLabel="Listado de actividades"
            columns={columns}
            rows={filtered}
            getRowId={(a) => a.id}
            pageSize={20}
            emptyTitle="Sin actividades"
            rowActions={[
              {
                key: "completar",
                label: "Marcar completada / pendiente",
                icon: Check,
                onSelect: async (a) => {
                  await completarActividad(a.id, !a.completada);
                  toast.success(a.completada ? "Actividad marcada como pendiente" : "Actividad completada", {
                    description: a.asunto,
                  });
                },
              },
            ]}
          />
        </Tabs.Panel>

        <Tabs.Panel id="calendario" className="pt-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-surface">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-slate-900 capitalize">
                {format(mesActual, "MMMM yyyy", { locale: es })}
              </p>
              <div className="flex gap-1">
                <Button isIconOnly variant="ghost" size="sm" onPress={() => setMesActual((m) => addMonths(m, -1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button isIconOnly variant="ghost" size="sm" onPress={() => setMesActual((m) => addMonths(m, 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-100 bg-slate-100 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                <div key={d} className="bg-slate-50 py-1.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border border-t-0 border-slate-100 bg-slate-100">
              {diasCalendario.map((dia) => {
                const key = format(dia, "yyyy-MM-dd");
                const items = actividadesPorDia.get(key) ?? [];
                const enMes = isSameMonth(dia, mesActual);
                const esHoy = isSameDay(dia, HOY);
                const seleccionado = diaSeleccionado && isSameDay(dia, diaSeleccionado);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDiaSeleccionado(dia)}
                    className={cn(
                      "flex min-h-[84px] flex-col items-start gap-1 bg-white p-1.5 text-left transition-colors hover:bg-slate-50",
                      !enMes && "bg-slate-50/50 text-slate-300",
                      seleccionado && "ring-2 ring-inset ring-blue-500",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
                        esHoy ? "bg-blue-700 text-white" : enMes ? "text-slate-700" : "text-slate-300",
                      )}
                    >
                      {format(dia, "d")}
                    </span>
                    <div className="flex w-full flex-col gap-0.5">
                      {items.slice(0, 2).map((a) => (
                        <span
                          key={a.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                            a.completada ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
                          )}
                        >
                          {a.asunto}
                        </span>
                      ))}
                      {items.length > 2 ? (
                        <span className="text-[10px] text-slate-400">+{items.length - 2} más</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {diaSeleccionado ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-900 capitalize">
                {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              {actividadesDelDiaSeleccionado.length === 0 ? (
                <p className="text-sm text-slate-500">Sin actividades programadas este día.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {actividadesDelDiaSeleccionado.map((a) => {
                    const Icon = TIPO_ICON[a.tipo];
                    return (
                      <li
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-surface"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="size-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{a.asunto}</p>
                            <p className="text-xs text-slate-500">
                              {clienteNombre(a.clienteId)} · {vendedorNombre(a.vendedorId)}
                            </p>
                          </div>
                        </div>
                        <StatusChip status={estadoDe(a)} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </Tabs.Panel>
      </Tabs>

      <ActividadFormModal isOpen={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
