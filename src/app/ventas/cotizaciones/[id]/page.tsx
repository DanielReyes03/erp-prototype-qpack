"use client";

import { useEffect, useState } from "react";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, XCircle, ArrowRightCircle } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusChip } from "@/components/patterns/StatusChip";
import { EmptyState } from "@/components/patterns/EmptyState";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { formatDate } from "@/lib/format";
import { useCotizacionesStore } from "@/lib/store/cotizaciones";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { clienteDe, vendedorDe } from "../_components/cot-helpers";

export default function CotizacionDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const actualizarLineas = useCotizacionesStore((s) => s.actualizarLineas);
  const enviar = useCotizacionesStore((s) => s.enviar);
  const marcarAceptada = useCotizacionesStore((s) => s.marcarAceptada);
  const marcarRechazada = useCotizacionesStore((s) => s.marcarRechazada);
  const convertirAPedido = useCotizacionesStore((s) => s.convertirAPedido);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const cot = cotizaciones.find((c) => c.id === params.id);
  const [lineas, setLineas] = useState<LineItem[]>(cot?.lineas ?? []);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setLineas(cot?.lineas ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cot?.id]);

  const cliente = cot ? clienteDe(cot.clienteId) : undefined;
  const vendedor = cot ? vendedorDe(cot.vendedorId) : undefined;

  const products: LineItemProduct[] = useMemo(() => {
    if (!cliente) return [];
    return PRODUCTOS_SEED.filter((p) => p.activo).map((p) => ({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      unidadMedida: p.unidadMedida,
      precio: getPrecio(cliente.listaPrecioId, p.id),
    }));
  }, [cliente, getPrecio]);

  if (!cot || !cliente) {
    return (
      <EmptyState size="page" title="Cotización no encontrada" description="El documento solicitado no existe." />
    );
  }

  const isBorrador = cot.estado === "borrador";
  const isDirty = isBorrador && JSON.stringify(lineas) !== JSON.stringify(cot.lineas);

  async function run(fn: () => Promise<void>, msg: string) {
    setIsPending(true);
    try {
      await fn();
      toast.success(msg, { description: cot!.id });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <Link
        href="/ventas/cotizaciones"
        className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-3.5" />
        Cotizaciones
      </Link>

      <PageHeader
        title={cot.id}
        description={`${cliente.nombreComercial} · ${vendedor?.nombre ?? "—"} · Emitida ${formatDate(cot.fecha)} · Válida hasta ${formatDate(cot.fechaValidez)}`}
        actions={<StatusChip status={`cot:${cot.estado}`} />}
      />

      {cot.estado === "convertida" && cot.ordenVentaId ? (
        <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Esta cotización fue convertida en el pedido{" "}
          <Link href={`/ventas/ordenes/${cot.ordenVentaId}`} className="font-medium underline">
            {cot.ordenVentaId}
          </Link>
          .
        </div>
      ) : null}

      <div className="mb-4">
        <LineItemsEditor
          items={lineas}
          onChange={setLineas}
          products={products}
          currency={cot.moneda}
          isDisabled={!isBorrador}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {isDirty ? (
          <Button
            variant="secondary"
            isPending={isPending}
            onPress={() => run(() => actualizarLineas(cot.id, lineas), "Líneas actualizadas")}
          >
            Guardar cambios
          </Button>
        ) : null}

        {cot.estado === "borrador" ? (
          <Button
            isPending={isPending}
            isDisabled={isDirty || lineas.length === 0}
            onPress={() => run(() => enviar(cot.id), "Cotización enviada")}
          >
            <Send className="size-4" />
            Enviar al cliente
          </Button>
        ) : null}

        {cot.estado === "enviada" ? (
          <>
            <Button
              variant="danger-soft"
              isPending={isPending}
              onPress={() => run(() => marcarRechazada(cot.id), "Cotización rechazada")}
            >
              <XCircle className="size-4" />
              Marcar rechazada
            </Button>
            <Button
              isPending={isPending}
              onPress={() => run(() => marcarAceptada(cot.id), "Cotización aceptada")}
            >
              <CheckCircle2 className="size-4" />
              Marcar aceptada
            </Button>
          </>
        ) : null}

        {cot.estado === "aceptada" ? (
          <Button
            isPending={isPending}
            onPress={async () => {
              setIsPending(true);
              try {
                const ovId = await convertirAPedido(cot.id);
                toast.success("Convertida a pedido", { description: ovId });
                router.push(`/ventas/ordenes/${ovId}`);
              } finally {
                setIsPending(false);
              }
            }}
          >
            <ArrowRightCircle className="size-4" />
            Convertir a pedido
          </Button>
        ) : null}
      </div>
    </div>
  );
}
