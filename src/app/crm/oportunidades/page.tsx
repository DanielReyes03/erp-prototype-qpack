"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Calendar, Trash2 } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { EntityAvatar } from "@/components/patterns/EntityAvatar";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useOportunidadesStore } from "@/lib/store/oportunidades";
import { ETAPAS_OPORTUNIDAD, type EtapaOportunidad, type Oportunidad } from "@/lib/seed/oportunidades";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { OportunidadFormModal } from "./_components/OportunidadFormModal";

function clienteNombre(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id)?.nombreComercial ?? "—";
}
function vendedorNombre(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id)?.nombre ?? "—";
}

const COLUMN_ACCENT: Record<EtapaOportunidad, string> = {
  nuevo: "border-t-slate-400",
  calificado: "border-t-blue-500",
  propuesta: "border-t-blue-700",
  negociacion: "border-t-amber-500",
  ganado: "border-t-emerald-500",
  perdido: "border-t-rose-500",
};

export default function OportunidadesPage() {
  const oportunidades = useOportunidadesStore((s) => s.oportunidades);
  const moverEtapa = useOportunidadesStore((s) => s.moverEtapa);
  const eliminarOportunidad = useOportunidadesStore((s) => s.eliminarOportunidad);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Oportunidad | undefined>(undefined);
  const [deleting, setDeleting] = useState<Oportunidad | undefined>(undefined);
  const [dragOverEtapa, setDragOverEtapa] = useState<EtapaOportunidad | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columnas = useMemo(() => {
    return ETAPAS_OPORTUNIDAD.map((etapa) => ({
      ...etapa,
      items: oportunidades.filter((o) => o.etapa === etapa.key),
    }));
  }, [oportunidades]);

  const pipelineAbierto = oportunidades
    .filter((o) => o.etapa !== "ganado" && o.etapa !== "perdido")
    .reduce((s, o) => s + o.valorEstimado, 0);

  async function handleDrop(etapa: EtapaOportunidad) {
    setDragOverEtapa(null);
    if (!draggingId) return;
    const oportunidad = oportunidades.find((o) => o.id === draggingId);
    setDraggingId(null);
    if (!oportunidad || oportunidad.etapa === etapa) return;
    await moverEtapa(oportunidad.id, etapa);
    toast.success("Oportunidad movida", {
      description: `${oportunidad.nombre} → ${ETAPAS_OPORTUNIDAD.find((e) => e.key === etapa)?.label}`,
    });
  }

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        description={
          <>
            Pipeline comercial · valor abierto{" "}
            <MoneyCell amount={pipelineAbierto} inline className="font-semibold text-slate-700" />
          </>
        }
        actions={
          <Button
            onPress={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nueva oportunidad
          </Button>
        }
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columnas.map((col) => {
          const totalCol = col.items.reduce((s, o) => s + o.valorEstimado, 0);
          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverEtapa(col.key);
              }}
              onDragLeave={() => setDragOverEtapa((prev) => (prev === col.key ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                void handleDrop(col.key);
              }}
              className={cn(
                "flex w-[280px] shrink-0 flex-col gap-2 rounded-xl border-t-2 bg-slate-50/60 p-2.5",
                COLUMN_ACCENT[col.key],
                dragOverEtapa === col.key && "bg-blue-50 ring-2 ring-blue-200",
              )}
            >
              <div className="flex items-center justify-between px-1 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-slate-700">{col.label}</span>
                  <span className="font-data rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {col.items.length}
                  </span>
                </div>
              </div>
              {col.items.length > 0 ? (
                <p className="px-1 text-xs text-slate-500">
                  <MoneyCell amount={totalCol} inline />
                </p>
              ) : null}

              <div className="flex min-h-[60px] flex-col gap-2">
                {col.items.map((o) => (
                  <div
                    key={o.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(o.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      "group cursor-grab rounded-lg border border-slate-200 bg-white p-2.5 shadow-surface active:cursor-grabbing",
                      draggingId === o.id && "opacity-40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="line-clamp-2 text-[13px] font-medium text-slate-900">{o.nombre}</p>
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label="Editar oportunidad"
                          onClick={() => {
                            setEditing(o);
                            setFormOpen(true);
                          }}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar oportunidad"
                          onClick={() => setDeleting(o)}
                          className="rounded p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{clienteNombre(o.clienteId)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <MoneyCell amount={o.valorEstimado} className="text-[13px] font-semibold text-slate-900" />
                      <span className="text-[11px] font-medium text-slate-500">{o.probabilidad}%</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <div className="flex items-center gap-1">
                        <EntityAvatar name={vendedorNombre(o.vendedorId)} size="sm" />
                        <span className="truncate text-[11px] text-slate-500">{vendedorNombre(o.vendedorId)}</span>
                      </div>
                      <span className="flex items-center gap-0.5 text-[11px] text-slate-400">
                        <Calendar className="size-3" />
                        {formatDate(o.fechaCierreEstimada)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <OportunidadFormModal isOpen={formOpen} onOpenChange={setFormOpen} oportunidad={editing} />

      <ConfirmDialog
        isOpen={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        status="danger"
        title="¿Eliminar oportunidad?"
        description={`Se eliminará permanentemente "${deleting?.nombre}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          await eliminarOportunidad(deleting.id);
          toast.success("Oportunidad eliminada", { description: deleting.nombre });
        }}
      />
    </div>
  );
}
