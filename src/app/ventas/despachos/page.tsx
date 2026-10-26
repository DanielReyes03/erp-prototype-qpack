"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Truck,
  PackageCheck,
  CheckCircle2,
  Play,
  Flag,
  X,
} from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { StatusChip } from "@/components/patterns/StatusChip";
import { formatDate } from "@/lib/format";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useRutasStore } from "@/lib/store/rutas";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import type { EstadoRuta } from "@/lib/seed/rutas";
import { clienteDe } from "../ordenes/_components/ov-helpers";
import { RutaFormModal } from "./_components/RutaFormModal";
import { AgregarOrdenModal } from "./_components/AgregarOrdenModal";
import { EntregaModal } from "./_components/EntregaModal";

const SIGUIENTE_ESTADO: Record<EstadoRuta, { estado: EstadoRuta; label: string; icon: typeof Play } | null> = {
  programada: { estado: "en-ruta", label: "Iniciar ruta", icon: Play },
  "en-ruta": { estado: "finalizada", label: "Finalizar ruta", icon: Flag },
  finalizada: null,
};

export default function DespachosRutasPage() {
  const rutas = useRutasStore((s) => s.rutas);
  const setEstado = useRutasStore((s) => s.setEstado);
  const quitarOrden = useRutasStore((s) => s.quitarOrden);
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);

  const [nuevaRutaOpen, setNuevaRutaOpen] = useState(false);
  const [agregarARuta, setAgregarARuta] = useState<string | null>(null);
  const [entrega, setEntrega] = useState<{ rutaId: string; ordenId: string } | null>(null);
  const [pendingEstado, setPendingEstado] = useState<string | null>(null);

  const ordenById = useMemo(() => new Map(ordenes.map((o) => [o.id, o])), [ordenes]);

  const rutasOrdenadas = useMemo(
    () =>
      [...rutas].sort((a, b) => {
        const rank: Record<EstadoRuta, number> = { "en-ruta": 0, programada: 1, finalizada: 2 };
        return rank[a.estado] - rank[b.estado] || new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }),
    [rutas],
  );

  async function cambiarEstado(rutaId: string, estado: EstadoRuta, label: string) {
    setPendingEstado(rutaId);
    try {
      await setEstado(rutaId, estado);
      toast.success(label, { description: rutaId });
    } finally {
      setPendingEstado(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Despachos y rutas"
        description="Hojas de ruta: asignación de órdenes, seguimiento de estado y confirmación de entregas"
        actions={
          <Button onPress={() => setNuevaRutaOpen(true)}>
            <Plus className="size-4" />
            Nueva ruta
          </Button>
        }
      />

      {rutasOrdenadas.length === 0 ? (
        <EmptyState
          size="page"
          title="No hay rutas"
          description="Crea una ruta y agrégale órdenes de venta confirmadas o despachadas para gestionar el reparto."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rutasOrdenadas.map((ruta) => {
            const responsable = VENDEDORES_SEED.find((v) => v.id === ruta.responsableId);
            const siguiente = SIGUIENTE_ESTADO[ruta.estado];
            const entregadas = ruta.ordenIds.filter((id) => ruta.entregas[id]).length;
            return (
              <div key={ruta.id} className="rounded-xl border border-slate-200 bg-white shadow-surface">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{ruta.nombre}</p>
                      <StatusChip status={`ruta:${ruta.estado}`} />
                    </div>
                    <p className="font-data text-xs text-slate-500">{ruta.id}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Truck className="size-3" />
                        {ruta.vehiculo}
                      </span>
                      <span>{responsable?.nombre ?? "—"}</span>
                      <span className="font-data">{formatDate(ruta.fecha)}</span>
                    </p>
                  </div>
                  <span className="font-data shrink-0 rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {entregadas}/{ruta.ordenIds.length} entregadas
                  </span>
                </div>

                {ruta.ordenIds.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Sin órdenes asignadas todavía.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {ruta.ordenIds.map((ordenId) => {
                      const orden = ordenById.get(ordenId);
                      if (!orden) return null;
                      const cliente = clienteDe(orden.clienteId);
                      const entregada = ruta.entregas[ordenId];
                      return (
                        <li key={ordenId} className="p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                href={`/ventas/ordenes/${orden.id}`}
                                className="font-data text-sm font-medium text-blue-700 hover:underline"
                              >
                                {orden.id}
                              </Link>
                              <p className="truncate text-sm text-slate-900">
                                {cliente?.nombreComercial}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="size-3" />
                                {cliente?.direccion}, {cliente?.zona}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <MoneyCell
                                amount={computeTotals(orden.lineas).total}
                                currency={orden.moneda}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            {entregada ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-[#059669]">
                                <CheckCircle2 className="size-3.5" />
                                Entregada · {formatDate(entregada.fecha)}
                                {entregada.fotoNombre ? " · con foto" : ""}
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                isDisabled={ruta.estado === "finalizada"}
                                onPress={() => setEntrega({ rutaId: ruta.id, ordenId })}
                              >
                                <PackageCheck className="size-3.5" />
                                Marcar entregado
                              </Button>
                            )}
                            {!entregada ? (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Quitar de la ruta"
                                onPress={() => void quitarOrden(ruta.id, ordenId)}
                              >
                                <X className="size-4 text-slate-400" />
                              </Button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 p-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    isDisabled={ruta.estado === "finalizada"}
                    onPress={() => setAgregarARuta(ruta.id)}
                  >
                    <Plus className="size-4" />
                    Agregar orden
                  </Button>
                  {siguiente ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      isPending={pendingEstado === ruta.id}
                      onPress={() => cambiarEstado(ruta.id, siguiente.estado, siguiente.label)}
                    >
                      <siguiente.icon className="size-4" />
                      {siguiente.label}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RutaFormModal isOpen={nuevaRutaOpen} onOpenChange={setNuevaRutaOpen} />
      <AgregarOrdenModal rutaId={agregarARuta} onOpenChange={() => setAgregarARuta(null)} />
      {entrega ? (
        <EntregaModal
          rutaId={entrega.rutaId}
          ordenId={entrega.ordenId}
          onOpenChange={(open) => !open && setEntrega(null)}
        />
      ) : null}
    </div>
  );
}
