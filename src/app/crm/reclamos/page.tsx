"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Plus, PlayCircle, CheckCircle2, Archive, AlertTriangle, Clock, Inbox } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { StatusChip } from "@/components/patterns/StatusChip";
import { KpiCard } from "@/components/patterns/KpiCard";
import { cn } from "@/lib/cn";
import { formatDate, toLocalDate } from "@/lib/format";
import { useReclamosStore } from "@/lib/store/reclamos";
import type { Reclamo } from "@/lib/seed/reclamos";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { ReclamoFormModal } from "./_components/ReclamoFormModal";

const HOY = new Date(2026, 7, 5);

function clienteNombre(id: string) {
  return CLIENTES_SEED.find((c) => c.id === id)?.nombreComercial ?? "—";
}
function vendedorNombre(id: string) {
  return VENDEDORES_SEED.find((v) => v.id === id)?.nombre ?? "—";
}

function SlaCell({ reclamo }: { reclamo: Reclamo }) {
  if (reclamo.estado === "resuelto" || reclamo.estado === "cerrado") {
    return <span className="text-xs text-slate-400">—</span>;
  }
  const dias = differenceInCalendarDays(toLocalDate(reclamo.fechaLimiteSla), HOY);
  if (dias < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
        <AlertTriangle className="size-3.5" />
        Vencido hace {Math.abs(dias)}d
      </span>
    );
  }
  if (dias === 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
        <Clock className="size-3.5" />
        Vence hoy
      </span>
    );
  }
  return (
    <span className={cn("flex items-center gap-1 text-xs", dias <= 1 ? "font-medium text-amber-600" : "text-slate-500")}>
      <Clock className="size-3.5" />
      {dias}d restantes
    </span>
  );
}

export default function ReclamosPage() {
  const reclamos = useReclamosStore((s) => s.reclamos);
  const cambiarEstado = useReclamosStore((s) => s.cambiarEstado);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const abiertos = reclamos.filter((r) => r.estado === "abierto" || r.estado === "en-proceso").length;
  const vencidos = reclamos.filter(
    (r) =>
      (r.estado === "abierto" || r.estado === "en-proceso") &&
      differenceInCalendarDays(toLocalDate(r.fechaLimiteSla), HOY) < 0,
  ).length;
  const resueltosMes = reclamos.filter((r) => r.estado === "resuelto" || r.estado === "cerrado").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reclamos;
    return reclamos.filter(
      (r) => r.asunto.toLowerCase().includes(q) || clienteNombre(r.clienteId).toLowerCase().includes(q),
    );
  }, [reclamos, search]);

  const columns: DataTableColumn<Reclamo>[] = [
    { key: "cliente", header: "Cliente", cell: (r) => clienteNombre(r.clienteId) },
    { key: "asunto", header: "Asunto", cell: (r) => r.asunto },
    { key: "categoria", header: "Categoría", cell: (r) => r.categoria },
    { key: "prioridad", header: "Prioridad", cell: (r) => <StatusChip status={`prio:${r.prioridad}`} /> },
    {
      key: "asignado",
      header: "Asignado a",
      cell: (r) => vendedorNombre(r.asignadoAId),
    },
    {
      key: "createdAt",
      header: "Creado",
      cellClassName: "whitespace-nowrap",
      sortAccessor: (r) => r.createdAt,
      cell: (r) => <span className="font-data">{formatDate(r.createdAt)}</span>,
    },
    { key: "sla", header: "SLA", cell: (r) => <SlaCell reclamo={r} /> },
    { key: "estado", header: "Estado", cell: (r) => <StatusChip status={`recl:${r.estado}`} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Reclamos"
        description="Seguimiento de quejas de clientes con prioridad y SLA de atención"
        actions={
          <Button onPress={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nuevo reclamo
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Reclamos abiertos" value={String(abiertos)} icon={Inbox} tone="accent" />
        <KpiCard label="Vencidos (fuera de SLA)" value={String(vencidos)} icon={AlertTriangle} tone="danger" />
        <KpiCard label="Resueltos / cerrados" value={String(resueltosMes)} icon={CheckCircle2} tone="success" />
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Buscar por asunto o cliente…" />

      <DataTable
        ariaLabel="Listado de reclamos"
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        pageSize={20}
        emptyTitle="Sin reclamos"
        rowActions={[
          {
            key: "en-proceso",
            label: "Marcar en proceso",
            icon: PlayCircle,
            isDisabled: (r) => r.estado !== "abierto",
            onSelect: async (r) => {
              await cambiarEstado(r.id, "en-proceso");
              toast.success("Reclamo en proceso", { description: r.asunto });
            },
          },
          {
            key: "resuelto",
            label: "Marcar resuelto",
            icon: CheckCircle2,
            isDisabled: (r) => r.estado === "resuelto" || r.estado === "cerrado",
            onSelect: async (r) => {
              await cambiarEstado(r.id, "resuelto");
              toast.success("Reclamo resuelto", { description: r.asunto });
            },
          },
          {
            key: "cerrado",
            label: "Cerrar reclamo",
            icon: Archive,
            isDisabled: (r) => r.estado === "cerrado",
            onSelect: async (r) => {
              await cambiarEstado(r.id, "cerrado");
              toast.success("Reclamo cerrado", { description: r.asunto });
            },
          },
        ]}
      />

      <ReclamoFormModal isOpen={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
