"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, CheckCircle2, Ban, Save, FileText } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DocumentStepper } from "@/components/patterns/DocumentStepper";
import { StatusChip } from "@/components/patterns/StatusChip";
import { EmptyState } from "@/components/patterns/EmptyState";
import { AnularDocumentoModal } from "@/components/patterns/AnularDocumentoModal";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { formatDate } from "@/lib/format";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { proveedorDe, locacionDe, ocStepperProps } from "../_components/oc-helpers";
import { RecepcionModal } from "../_components/RecepcionModal";

export default function OrdenCompraDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ordenes = useOrdenesCompraStore((s) => s.ordenes);
  const actualizarLineas = useOrdenesCompraStore((s) => s.actualizarLineas);
  const confirmar = useOrdenesCompraStore((s) => s.confirmar);
  const anular = useOrdenesCompraStore((s) => s.anular);

  const orden = ordenes.find((o) => o.id === params.id);
  const [lineas, setLineas] = useState<LineItem[]>(
    orden?.lineas.map((l) => ({
      id: l.id,
      productoId: l.productoId,
      sku: l.sku,
      nombre: l.nombre,
      unidadMedida: l.unidadMedida,
      cantidad: l.cantidad,
      precioUnitario: l.costoUnitario,
      descuentoPorcentaje: 0,
    })) ?? [],
  );
  const [isPending, setIsPending] = useState(false);
  const [anularOpen, setAnularOpen] = useState(false);
  const [recepcionOpen, setRecepcionOpen] = useState(false);

  useEffect(() => {
    setLineas(
      orden?.lineas.map((l) => ({
        id: l.id,
        productoId: l.productoId,
        sku: l.sku,
        nombre: l.nombre,
        unidadMedida: l.unidadMedida,
        cantidad: l.cantidad,
        precioUnitario: l.costoUnitario,
        descuentoPorcentaje: 0,
      })) ?? [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden?.id]);

  const proveedor = orden ? proveedorDe(orden.proveedorId) : undefined;
  const locacion = orden ? locacionDe(orden.locacionId) : undefined;

  const products: LineItemProduct[] = PRODUCTOS_SEED.filter((p) => p.activo).map((p) => ({
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    unidadMedida: p.unidadMedida,
    precio: p.costo,
  }));

  if (!orden || !proveedor) {
    return (
      <EmptyState size="page" title="Orden no encontrada" description="La orden de compra solicitada no existe." />
    );
  }

  const isBorrador = orden.estado === "borrador";
  const { steps, currentKey, cancelled } = ocStepperProps(orden);

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
        href="/compras/ordenes"
        className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700"
      >
        <ArrowLeft className="size-3.5" />
        Órdenes de compra
      </Link>

      <PageHeader
        title={orden.id}
        description={`${proveedor.nombreComercial} · ${formatDate(orden.fecha)}`}
        actions={<StatusChip status={`oc:${orden.estado}`} />}
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

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white shadow-surface p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Proveedor</p>
          <p className="text-sm font-medium text-slate-900">{proveedor.nombreComercial}</p>
          <p className="text-xs text-slate-500">{proveedor.razonSocial}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Locación de recepción</p>
          <p className="text-sm font-medium text-slate-900">{locacion?.nombre ?? "—"}</p>
        </div>
      </div>

      {isBorrador ? (
        <div className="mb-4">
          <LineItemsEditor items={lineas} onChange={setLineas} products={products} currency={orden.moneda} />
        </div>
      ) : (
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="h-10 border-b border-slate-200 border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-3">Producto</th>
                <th className="px-3 text-right">Ordenado</th>
                <th className="px-3 text-right">Recibido</th>
                <th className="px-3 text-right">Pendiente</th>
                <th className="px-3 text-right">Costo unit.</th>
                <th className="px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.lineas.map((l) => (
                <tr key={l.id} className="h-11 border-b border-slate-200 last:border-0">
                  <td className="px-3">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{l.nombre}</span>
                      <span className="font-data text-xs text-slate-500">{l.sku}</span>
                    </div>
                  </td>
                  <td className="font-data px-3 text-right">{l.cantidad.toLocaleString("en-US")}</td>
                  <td className="font-data px-3 text-right text-[#059669]">
                    {l.cantidadRecibida.toLocaleString("en-US")}
                  </td>
                  <td className="font-data px-3 text-right text-[#D97706]">
                    {(l.cantidad - l.cantidadRecibida).toLocaleString("en-US")}
                  </td>
                  <td className="px-3 text-right">
                    <MoneyCell amount={l.costoUnitario} currency={orden.moneda} />
                  </td>
                  <td className="px-3 text-right">
                    <MoneyCell amount={l.cantidad * l.costoUnitario} currency={orden.moneda} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {isBorrador ? (
          <>
            <Button variant="danger-soft" isDisabled={isPending} onPress={() => setAnularOpen(true)}>
              <Ban className="size-4" />
              Anular
            </Button>
            <Button
              variant="secondary"
              isPending={isPending}
              isDisabled={lineas.length === 0}
              onPress={() =>
                runAction(
                  () =>
                    actualizarLineas(
                      orden.id,
                      lineas.map((l) => ({
                        id: l.id,
                        productoId: l.productoId,
                        sku: l.sku,
                        nombre: l.nombre,
                        unidadMedida: l.unidadMedida,
                        cantidad: l.cantidad,
                        costoUnitario: l.precioUnitario,
                      })),
                    ),
                  "Líneas guardadas",
                )
              }
            >
              <Save className="size-4" />
              Guardar líneas
            </Button>
            <Button
              isPending={isPending}
              isDisabled={lineas.length === 0}
              onPress={() => runAction(() => confirmar(orden.id), "Orden confirmada")}
            >
              <CheckCircle2 className="size-4" />
              Confirmar orden
            </Button>
          </>
        ) : null}

        {orden.estado === "confirmada" || orden.estado === "recibida-parcial" ? (
          <>
            <Button variant="danger-soft" isDisabled={isPending} onPress={() => setAnularOpen(true)}>
              <Ban className="size-4" />
              Anular
            </Button>
            <Button isPending={isPending} onPress={() => setRecepcionOpen(true)}>
              <PackageCheck className="size-4" />
              Registrar recepción
            </Button>
          </>
        ) : null}

        {orden.estado === "recibida-total" ? (
          <Button onPress={() => router.push("/compras/facturas")}>
            <FileText className="size-4" />
            Ir a facturar
          </Button>
        ) : null}
      </div>

      <RecepcionModal isOpen={recepcionOpen} onOpenChange={setRecepcionOpen} orden={orden} />

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
