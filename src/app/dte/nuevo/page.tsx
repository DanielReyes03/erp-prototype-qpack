"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { Button, Select, ListBox, Label, Tabs, toast } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { LineItemsEditor, type LineItem, type LineItemProduct, computeTotals } from "@/components/patterns/LineItemsEditor";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { useDteStore } from "@/lib/store/dte";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import type { TipoDte } from "@/lib/seed/dte";
import { clienteDe } from "../_components/dte-helpers";

const TIPOS: { id: TipoDte; label: string }[] = [
  { id: "FACT", label: "Factura" },
  { id: "NCRE", label: "Nota de crédito" },
  { id: "NDEB", label: "Nota de débito" },
];

export default function NuevoDtePage() {
  return (
    <Suspense fallback={null}>
      <NuevoDteContent />
    </Suspense>
  );
}

function NuevoDteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ovId = searchParams.get("ovId");

  const emitir = useDteStore((s) => s.emitir);
  const documentos = useDteStore((s) => s.documentos);
  const ordenes = useOrdenesVentaStore((s) => s.ordenes);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const ordenOrigen = ovId ? ordenes.find((o) => o.id === ovId) : undefined;

  const [tipo, setTipo] = useState<TipoDte>("FACT");
  const [clienteId, setClienteId] = useState<string | null>(ordenOrigen?.clienteId ?? null);
  const [dteRelacionadoId, setDteRelacionadoId] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineItem[]>(ordenOrigen?.lineas ?? []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ordenOrigen) {
      setClienteId(ordenOrigen.clienteId);
      setLineas(ordenOrigen.lineas);
    }
  }, [ordenOrigen]);

  const cliente = CLIENTES_SEED.find((c) => c.id === clienteId);

  const facturasDisponibles = documentos.filter(
    (d) => d.tipo === "FACT" && d.estado === "certificado",
  );
  const dteRelacionado = documentos.find((d) => d.id === dteRelacionadoId);

  const products: LineItemProduct[] = useMemo(() => {
    return PRODUCTOS_SEED.filter((p) => p.activo).map((p) => ({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      unidadMedida: p.unidadMedida,
      precio: cliente ? getPrecio(cliente.listaPrecioId, p.id) : p.precioBase,
    }));
  }, [cliente, getPrecio]);

  const isNota = tipo === "NCRE" || tipo === "NDEB";
  const effectiveClienteId = isNota ? dteRelacionado?.clienteId : clienteId;
  const canEmit = isNota
    ? !!dteRelacionadoId && lineas.length > 0
    : !!clienteId && lineas.length > 0;

  async function handleEmitir() {
    if (!effectiveClienteId) return;
    setIsSaving(true);
    try {
      const dte = await emitir({
        tipo,
        clienteId: effectiveClienteId,
        lineas,
        ordenVentaId: ordenOrigen?.id,
        dteRelacionadoId: isNota ? (dteRelacionadoId ?? undefined) : undefined,
        moneda: ordenOrigen?.moneda ?? dteRelacionado?.moneda ?? "GTQ",
      });
      toast.success("DTE certificado", { description: `${dte.serie}-${dte.numero}` });
      router.push(`/dte/${dte.id}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Link href="/dte" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700">
        <ArrowLeft className="size-3.5" />
        Documentos DTE
      </Link>

      <PageHeader
        title="Emitir DTE"
        description={
          ordenOrigen
            ? `Se generará a partir de la orden de venta ${ordenOrigen.id}`
            : "Emisión directa o nota de crédito/débito sobre una factura existente"
        }
        actions={
          <Button isPending={isSaving} isDisabled={!canEmit} onPress={handleEmitir}>
            <FileCheck2 className="size-4" />
            Certificar DTE
          </Button>
        }
      />

      {!ordenOrigen ? (
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
          <Tabs
            selectedKey={tipo}
            onSelectionChange={(k) => {
              setTipo(k as TipoDte);
              setLineas([]);
              setDteRelacionadoId(null);
            }}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Tipo de documento">
                {TIPOS.map((t) => (
                  <Tabs.Tab key={t.id} id={t.id}>
                    {t.label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-2">
        {isNota ? (
          <Select
            className="flex flex-col gap-1"
            placeholder="Seleccionar factura relacionada"
            value={dteRelacionadoId}
            onChange={(k) => setDteRelacionadoId(k ? String(k) : null)}
          >
            <Label>Factura relacionada</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {facturasDisponibles.map((d) => (
                  <ListBox.Item
                    key={d.id}
                    id={d.id}
                    textValue={`${d.serie}-${d.numero}`}
                  >
                    {d.serie}-{d.numero} — {clienteDe(d.clienteId)?.nombreComercial}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : ordenOrigen ? (
          <div>
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="text-sm font-medium text-slate-900">{cliente?.nombreComercial}</p>
          </div>
        ) : (
          <Select
            className="flex flex-col gap-1"
            placeholder="Seleccionar cliente"
            value={clienteId}
            onChange={(k) => setClienteId(k ? String(k) : null)}
          >
            <Label>Cliente</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {CLIENTES_SEED.filter((c) => c.activo).map((c) => (
                  <ListBox.Item key={c.id} id={c.id} textValue={c.nombreComercial}>
                    {c.nombreComercial}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      </div>

      {ordenOrigen ? (
        <div className="mb-4 overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="h-10 border-b border-slate-200 bg-navy-900 text-left text-[11px] font-medium tracking-wide text-white/90 uppercase">
                <th className="px-3">Producto</th>
                <th className="px-3 text-right">Cantidad</th>
                <th className="px-3 text-right">Precio unit.</th>
                <th className="px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l) => (
                <tr key={l.id} className="h-11 border-b border-slate-200 last:border-0">
                  <td className="px-3 text-slate-900">{l.nombre}</td>
                  <td className="font-data px-3 text-right">{l.cantidad}</td>
                  <td className="px-3 text-right">
                    <MoneyCell amount={l.precioUnitario} currency={ordenOrigen.moneda} />
                  </td>
                  <td className="px-3 text-right">
                    <MoneyCell
                      amount={l.cantidad * l.precioUnitario * (1 - l.descuentoPorcentaje / 100)}
                      currency={ordenOrigen.moneda}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-slate-200 p-4">
            <div className="w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVA (12%)</span>
                <MoneyCell amount={computeTotals(lineas).iva} currency={ordenOrigen.moneda} />
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="font-data text-blue-700">
                  <MoneyCell amount={computeTotals(lineas).total} currency={ordenOrigen.moneda} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (effectiveClienteId || isNota) ? (
        <LineItemsEditor
          items={lineas}
          onChange={setLineas}
          products={products}
          currency={dteRelacionado?.moneda ?? "GTQ"}
        />
      ) : (
        <p className="text-sm text-slate-500">Seleccioná un cliente para agregar productos.</p>
      )}
    </div>
  );
}
