"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Select, ListBox, Label, TextArea, toast } from "@heroui/react";
import Link from "next/link";
import { PageHeader } from "@/components/patterns/PageHeader";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import { vendedorDe } from "../_components/ov-helpers";

export default function NuevaOrdenVentaPage() {
  const router = useRouter();
  const crearOrden = useOrdenesVentaStore((s) => s.crearOrden);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const [clienteId, setClienteId] = useState<string | null>(null);
  const [locacionId, setLocacionId] = useState<string | null>(LOCACIONES_SEED[0].id);
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<LineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const cliente = CLIENTES_SEED.find((c) => c.id === clienteId);
  const vendedor = cliente ? vendedorDe(cliente.vendedorId) : undefined;

  const products: LineItemProduct[] = useMemo(() => {
    return PRODUCTOS_SEED.filter((p) => p.activo).map((p) => ({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      unidadMedida: p.unidadMedida,
      precio: cliente ? getPrecio(cliente.listaPrecioId, p.id) : p.precioBase,
    }));
  }, [cliente, getPrecio]);

  const canSave = !!clienteId && !!locacionId && lineas.length > 0;

  async function handleSave() {
    if (!cliente || !locacionId) return;
    setIsSaving(true);
    try {
      const orden = await crearOrden({
        clienteId: cliente.id,
        vendedorId: cliente.vendedorId,
        locacionId,
        moneda: "GTQ",
        lineas,
        notas: notas || undefined,
      });
      toast.success("Orden creada", { description: `${orden.id} guardada como borrador` });
      router.push(`/ventas/ordenes/${orden.id}`);
    } finally {
      setIsSaving(false);
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
        title="Nueva orden de venta"
        description="Se guarda como borrador; luego podés confirmar, despachar y entregar."
        actions={
          <Button isPending={isSaving} isDisabled={!canSave} onPress={handleSave}>
            Guardar borrador
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white shadow-surface p-4 sm:grid-cols-3">
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

        <div className="flex flex-col gap-1">
          <Label>Vendedor</Label>
          <p className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
            {vendedor?.nombre ?? "—"}
          </p>
        </div>

        <Select
          className="flex flex-col gap-1"
          placeholder="Seleccionar locación"
          value={locacionId}
          onChange={(k) => setLocacionId(k ? String(k) : null)}
        >
          <Label>Locación de despacho</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {LOCACIONES_SEED.map((l) => (
                <ListBox.Item key={l.id} id={l.id} textValue={l.nombre}>
                  {l.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {!cliente ? (
        <p className="mb-4 text-sm text-slate-500">
          Seleccioná un cliente para habilitar el detalle de productos.
        </p>
      ) : (
        <div className="mb-4">
          <LineItemsEditor items={lineas} onChange={setLineas} products={products} currency="GTQ" />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-surface p-4">
        <Label>Notas</Label>
        <TextArea
          className="mt-1"
          fullWidth
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Instrucciones especiales de entrega, referencias, etc."
        />
      </div>
    </div>
  );
}
