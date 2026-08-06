"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, PackageCheck, CheckCircle2, Ban, Save } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DocumentStepper } from "@/components/patterns/DocumentStepper";
import { StatusChip } from "@/components/patterns/StatusChip";
import { EmptyState } from "@/components/patterns/EmptyState";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { AnularDocumentoModal } from "@/components/patterns/AnularDocumentoModal";
import { formatDate } from "@/lib/format";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { clienteDe, vendedorDe, locacionDe, ovStepperProps } from "../_components/ov-helpers";

export default function OrdenVentaDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);
  const actualizarLineas = useOrdenesVentaStore((s) => s.actualizarLineas);
  const confirmarPedido = useOrdenesVentaStore((s) => s.confirmarPedido);
  const generarDespacho = useOrdenesVentaStore((s) => s.generarDespacho);
  const confirmarEntrega = useOrdenesVentaStore((s) => s.confirmarEntrega);
  const anular = useOrdenesVentaStore((s) => s.anular);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const orden = ordenes.find((o) => o.id === params.id);
  const [lineas, setLineas] = useState<LineItem[]>(orden?.lineas ?? []);
  const [isPending, setIsPending] = useState(false);
  const [anularOpen, setAnularOpen] = useState(false);

  useEffect(() => {
    setLineas(orden?.lineas ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden?.id]);

  const cliente = orden ? clienteDe(orden.clienteId) : undefined;
  const vendedor = orden ? vendedorDe(orden.vendedorId) : undefined;
  const locacion = orden ? locacionDe(orden.locacionId) : undefined;

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

  if (!orden || !cliente) {
    return (
      <EmptyState
        size="page"
        title="Orden no encontrada"
        description="La orden de venta solicitada no existe o fue eliminada."
      />
    );
  }

  const isBorrador = orden.estado === "borrador";
  const isDirty = isBorrador && JSON.stringify(lineas) !== JSON.stringify(orden.lineas);
  const { steps, currentKey, cancelled } = ovStepperProps(orden);

  async function runAction(fn: () => Promise<void>, successMsg: string) {
    setIsPending(true);
    try {
      await fn();
      toast.success(successMsg, { description: orden!.id });
    } catch (err) {
      toast.danger("No se pudo completar la acción", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <Link
        href="/ventas/ordenes"
        className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-3.5" />
        Órdenes de venta
      </Link>

      <PageHeader
        title={orden.id}
        description={`${cliente.nombreComercial} · ${vendedor?.nombre ?? "—"} · ${formatDate(orden.fecha)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusChip status={`ov:${orden.estado}`} />
          </div>
        }
      />

      <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-surface p-5">
        <DocumentStepper steps={steps} currentKey={currentKey} cancelled={cancelled} />
        {cancelled && orden.motivoAnulacion ? (
          <p className="mt-3 text-sm text-slate-500">
            Motivo: <span className="text-slate-900">{orden.motivoAnulacion}</span> ·{" "}
            {orden.fechaAnulacion ? formatDate(orden.fechaAnulacion) : ""}
          </p>
        ) : null}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white shadow-surface p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Cliente</p>
          <p className="text-sm font-medium text-slate-900">{cliente.nombreComercial}</p>
          <p className="text-xs text-slate-500">{cliente.razonSocial}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Vendedor</p>
          <p className="text-sm font-medium text-slate-900">{vendedor?.nombre ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Locación de despacho</p>
          <p className="text-sm font-medium text-slate-900">{locacion?.nombre ?? "—"}</p>
        </div>
      </div>

      <div className="mb-4">
        <LineItemsEditor
          items={lineas}
          onChange={setLineas}
          products={products}
          currency={orden.moneda}
          isDisabled={!isBorrador}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {isDirty ? (
          <Button
            variant="secondary"
            isPending={isPending}
            onPress={() =>
              runAction(async () => {
                await actualizarLineas(orden.id, lineas);
              }, "Líneas actualizadas")
            }
          >
            <Save className="size-4" />
            Guardar cambios
          </Button>
        ) : null}

        {orden.estado === "borrador" ? (
          <>
            <Button
              variant="danger-soft"
              isDisabled={isPending}
              onPress={() => setAnularOpen(true)}
            >
              <Ban className="size-4" />
              Anular
            </Button>
            <Button
              isPending={isPending}
              isDisabled={isDirty || lineas.length === 0}
              onPress={() => runAction(() => confirmarPedido(orden.id), "Pedido confirmado")}
            >
              <CheckCircle2 className="size-4" />
              Confirmar pedido
            </Button>
          </>
        ) : null}

        {orden.estado === "confirmado" ? (
          <>
            <Button
              variant="danger-soft"
              isDisabled={isPending}
              onPress={() => setAnularOpen(true)}
            >
              <Ban className="size-4" />
              Anular
            </Button>
            <Button
              isPending={isPending}
              onPress={() => runAction(() => generarDespacho(orden.id), "Despacho generado")}
            >
              <Truck className="size-4" />
              Generar despacho
            </Button>
          </>
        ) : null}

        {orden.estado === "despachado" ? (
          <Button
            isPending={isPending}
            onPress={() => runAction(() => confirmarEntrega(orden.id), "Entrega confirmada")}
          >
            <PackageCheck className="size-4" />
            Confirmar entrega
          </Button>
        ) : null}

        {orden.estado === "entregado" ? (
          <Button onPress={() => router.push(`/dte/nuevo?ovId=${orden.id}`)}>
            Facturar (emitir DTE)
          </Button>
        ) : null}
      </div>

      <AnularDocumentoModal
        isOpen={anularOpen}
        onOpenChange={setAnularOpen}
        documentoLabel={orden.id}
        onConfirm={async (motivo) => {
          await anular(orden.id, motivo);
        }}
      />
    </div>
  );
}
