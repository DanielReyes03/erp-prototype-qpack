"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Select, ListBox, Label, toast } from "@heroui/react";
import Link from "next/link";
import { PageHeader } from "@/components/patterns/PageHeader";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";

export default function NuevaOrdenCompraPage() {
  const router = useRouter();
  const crearOrden = useOrdenesCompraStore((s) => s.crearOrden);
  const locacionesActivas = useLocacionesStore((s) => s.locaciones).filter((l) => l.activo);

  const [proveedorId, setProveedorId] = useState<string | null>(null);
  const [locacionId, setLocacionId] = useState<string | null>(null);
  const [lineas, setLineas] = useState<LineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!locacionId && locacionesActivas.length > 0) setLocacionId(locacionesActivas[0].id);
  }, [locacionId, locacionesActivas]);

  const proveedor = PROVEEDORES_SEED.find((p) => p.id === proveedorId);

  const products: LineItemProduct[] = useMemo(() => {
    return PRODUCTOS_SEED.filter((p) => p.activo).map((p) => ({
      id: p.id,
      sku: p.sku,
      nombre: p.nombre,
      unidadMedida: p.unidadMedida,
      precio: p.costo,
    }));
  }, []);

  const canSave = !!proveedorId && !!locacionId && lineas.length > 0;

  async function handleSave() {
    if (!proveedor || !locacionId) return;
    setIsSaving(true);
    try {
      const orden = await crearOrden({
        proveedorId: proveedor.id,
        locacionId,
        moneda: "GTQ",
        lineas: lineas.map((l) => ({
          id: l.id,
          productoId: l.productoId,
          sku: l.sku,
          nombre: l.nombre,
          unidadMedida: l.unidadMedida,
          cantidad: l.cantidad,
          costoUnitario: l.precioUnitario,
        })),
      });
      toast.success("Orden de compra creada", { description: `${orden.id} guardada como borrador` });
      router.push(`/compras/ordenes/${orden.id}`);
    } finally {
      setIsSaving(false);
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
        title="Nueva orden de compra"
        description="Se guarda como borrador; luego puedes confirmarla y registrar la recepción."
        actions={
          <Button isPending={isSaving} isDisabled={!canSave} onPress={handleSave}>
            Guardar borrador
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white shadow-surface p-4 sm:grid-cols-2">
        <Select
          className="flex flex-col gap-1"
          placeholder="Seleccionar proveedor"
          value={proveedorId}
          onChange={(k) => setProveedorId(k ? String(k) : null)}
        >
          <Label>Proveedor</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PROVEEDORES_SEED.filter((p) => p.activo).map((p) => (
                <ListBox.Item key={p.id} id={p.id} textValue={p.nombreComercial}>
                  {p.nombreComercial}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          className="flex flex-col gap-1"
          placeholder="Seleccionar locación"
          value={locacionId}
          onChange={(k) => setLocacionId(k ? String(k) : null)}
        >
          <Label>Locación de recepción</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {locacionesActivas.map((l) => (
                <ListBox.Item key={l.id} id={l.id} textValue={l.nombre}>
                  {l.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {!proveedor ? (
        <p className="mb-4 text-sm text-slate-500">
          Selecciona un proveedor para habilitar el detalle de productos.
        </p>
      ) : (
        <LineItemsEditor items={lineas} onChange={setLineas} products={products} currency="GTQ" />
      )}
    </div>
  );
}
