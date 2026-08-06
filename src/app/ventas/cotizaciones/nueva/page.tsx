"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Select, ListBox, Label, DateField, Calendar, DatePicker, toast } from "@heroui/react";
import Link from "next/link";
import { PageHeader } from "@/components/patterns/PageHeader";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { useCotizacionesStore } from "@/lib/store/cotizaciones";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { toDateValue, fromDateValue } from "@/lib/date-value";
import { vendedorDe } from "../_components/cot-helpers";

const HOY = new Date(2026, 7, 5);
const VALIDEZ_DEFAULT = new Date(2026, 7, 20);

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const crearCotizacion = useCotizacionesStore((s) => s.crearCotizacion);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);

  const [clienteId, setClienteId] = useState<string | null>(null);
  const [fechaValidez, setFechaValidez] = useState(VALIDEZ_DEFAULT.toISOString());
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

  const canSave = !!clienteId && lineas.length > 0;

  async function handleSave() {
    if (!cliente) return;
    setIsSaving(true);
    try {
      const cot = await crearCotizacion({
        clienteId: cliente.id,
        vendedorId: cliente.vendedorId,
        moneda: "GTQ",
        lineas,
        fechaValidez,
      });
      toast.success("Cotización creada", { description: `${cot.id} guardada como borrador` });
      router.push(`/ventas/cotizaciones/${cot.id}`);
    } finally {
      setIsSaving(false);
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
        title="Nueva cotización"
        description="Se guarda como borrador; luego podés enviarla al cliente."
        actions={
          <Button isPending={isSaving} isDisabled={!canSave} onPress={handleSave}>
            Guardar borrador
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-3">
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

        <DatePicker
          className="flex flex-col gap-1"
          value={toDateValue(fechaValidez)}
          minValue={toDateValue(HOY.toISOString()) ?? undefined}
          onChange={(v) => {
            const iso = fromDateValue(v);
            if (iso) setFechaValidez(new Date(iso).toISOString());
          }}
        >
          <Label>Válida hasta</Label>
          <DateField.Group fullWidth>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            <DateField.Suffix>
              <DatePicker.Trigger>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DatePicker.Popover>
            <Calendar aria-label="Fecha de validez">
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" />
                <Calendar.NavButton slot="next" />
              </Calendar.Header>
              <Calendar.Grid>
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
          </DatePicker.Popover>
        </DatePicker>
      </div>

      {!cliente ? (
        <p className="mb-4 text-sm text-slate-500">
          Seleccioná un cliente para habilitar el detalle de productos.
        </p>
      ) : (
        <LineItemsEditor items={lineas} onChange={setLineas} products={products} currency="GTQ" />
      )}
    </div>
  );
}
