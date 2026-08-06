"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageCheck, MapPin } from "lucide-react";
import { Button, Input, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { clienteDe } from "../ordenes/_components/ov-helpers";

export default function DespachosRutasPage() {
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);
  const confirmarEntrega = useOrdenesVentaStore((s) => s.confirmarEntrega);
  const asignarVehiculo = useOrdenesVentaStore((s) => s.asignarVehiculo);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const enRuta = useMemo(() => ordenes.filter((o) => o.estado === "despachado"), [ordenes]);

  const grupos = useMemo(() => {
    const map = new Map<string, typeof enRuta>();
    for (const orden of enRuta) {
      const arr = map.get(orden.vendedorId) ?? [];
      arr.push(orden);
      map.set(orden.vendedorId, arr);
    }
    return Array.from(map.entries())
      .map(([vendedorId, ordenesRuta]) => ({
        vendedor: VENDEDORES_SEED.find((v) => v.id === vendedorId),
        ordenes: ordenesRuta,
      }))
      .sort((a, b) => (a.vendedor?.nombre ?? "").localeCompare(b.vendedor?.nombre ?? ""));
  }, [enRuta]);

  async function handleEntrega(id: string) {
    setPendingId(id);
    try {
      await confirmarEntrega(id);
      toast.success("Entrega confirmada", { description: id });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Despachos y rutas"
        description="Hojas de ruta por vendedor: asignación de vehículo y confirmación de entrega"
      />

      {grupos.length === 0 ? (
        <EmptyState
          size="page"
          title="No hay despachos en ruta"
          description="Cuando generes un despacho desde una orden de venta confirmada, aparecerá aquí para asignarle vehículo y confirmar la entrega."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {grupos.map(({ vendedor, ordenes: ordenesRuta }) => (
            <div key={vendedor?.id} className="rounded-xl border border-slate-200 bg-white shadow-surface">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{vendedor?.nombre}</p>
                  <p className="text-xs text-slate-500">{vendedor?.zonaAsignada}</p>
                </div>
                <span className="font-data rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {ordenesRuta.length} entrega(s)
                </span>
              </div>
              <ul className="divide-y divide-slate-200">
                {ordenesRuta.map((orden) => {
                  const cliente = clienteDe(orden.clienteId);
                  return (
                    <li key={orden.id} className="p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/ventas/ordenes/${orden.id}`}
                            className="font-data text-sm font-medium text-blue-700 hover:underline"
                          >
                            {orden.id}
                          </Link>
                          <p className="text-sm text-slate-900">{cliente?.nombreComercial}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="size-3" />
                            {cliente?.direccion}, {cliente?.zona}
                          </p>
                        </div>
                        <div className="text-right">
                          <MoneyCell amount={computeTotals(orden.lineas).total} currency={orden.moneda} />
                          <p className="font-data text-xs text-slate-500">
                            {orden.fechaDespacho ? formatDate(orden.fechaDespacho) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          aria-label="Vehículo asignado"
                          placeholder="Placa / vehículo"
                          defaultValue={orden.vehiculoAsignado ?? ""}
                          className="h-8 flex-1"
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (value && value !== orden.vehiculoAsignado) {
                              void asignarVehiculo(orden.id, value);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          isPending={pendingId === orden.id}
                          onPress={() => handleEntrega(orden.id)}
                        >
                          <PackageCheck className="size-3.5" />
                          Confirmar entrega
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
