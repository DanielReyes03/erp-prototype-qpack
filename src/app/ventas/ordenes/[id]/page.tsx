"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, Ban, Save, FileCheck2 } from "lucide-react";
import { Button, Spinner, toast } from "@heroui/react";
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
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);
  const actualizarLineas = useOrdenesVentaStore((s) => s.actualizarLineas);
  const facturar = useOrdenesVentaStore((s) => s.facturar);
  const confirmarEntrega = useOrdenesVentaStore((s) => s.confirmarEntrega);
  const anular = useOrdenesVentaStore((s) => s.anular);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const orden = ordenes.find((o) => o.id === params.id);
  const [lineas, setLineas] = useState<LineItem[]>(orden?.lineas ?? []);
  const [isPending, setIsPending] = useState(false);
  const [certifying, setCertifying] = useState(false);
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

  const isRecibido = orden.estado === "recibido";
  const isDirty = isRecibido && JSON.stringify(lineas) !== JSON.stringify(orden.lineas);
  const puedeAnular = orden.estado !== "anulado";
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

  async function handleFacturar() {
    setCertifying(true);
    try {
      await facturar(orden!.id);
      toast.success("Orden facturada", { description: orden!.id });
    } catch (err) {
      toast.danger("No se pudo facturar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setCertifying(false);
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
          <p className="text-xs text-slate-500">Almacén</p>
          <p className="text-sm font-medium text-slate-900">{locacion?.nombre ?? "—"}</p>
        </div>
      </div>

      <div className="mb-4">
        <LineItemsEditor
          items={lineas}
          onChange={setLineas}
          products={products}
          currency={orden.moneda}
          isDisabled={!isRecibido}
        />
      </div>

      {orden.estado === "facturado" ? (
        <p className="mb-4 text-sm text-slate-500">
          Programa esta orden agregándola a una ruta en{" "}
          <Link href="/ventas/despachos" className="text-blue-700 hover:underline">
            Despachos y rutas
          </Link>
          , o márcala como entregada directamente.
        </p>
      ) : null}

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

        {puedeAnular ? (
          <Button variant="danger-soft" isDisabled={isPending || certifying} onPress={() => setAnularOpen(true)}>
            <Ban className="size-4" />
            Anular
          </Button>
        ) : null}

        {orden.estado === "recibido" ? (
          <Button
            isPending={certifying}
            isDisabled={isDirty || lineas.length === 0}
            onPress={handleFacturar}
          >
            <FileCheck2 className="size-4" />
            Facturar
          </Button>
        ) : null}

        {orden.estado === "facturado" || orden.estado === "programado" ? (
          <Button
            isPending={isPending}
            onPress={() => runAction(() => confirmarEntrega(orden.id), "Entrega confirmada")}
          >
            <PackageCheck className="size-4" />
            Marcar entregado
          </Button>
        ) : null}
      </div>

      {certifying ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-surface">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-slate-900">Certificando con SAT…</p>
            <p className="text-xs text-slate-500">Generando el DTE y descargando el inventario</p>
          </div>
        </div>
      ) : null}

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
