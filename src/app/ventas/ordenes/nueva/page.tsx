"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { Button, Select, ListBox, Label, TextArea, Modal, Spinner, toast } from "@heroui/react";
import Link from "next/link";
import { PageHeader } from "@/components/patterns/PageHeader";
import { LineItemsEditor, type LineItem, type LineItemProduct } from "@/components/patterns/LineItemsEditor";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { useRutasStore } from "@/lib/store/rutas";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { formatDate } from "@/lib/format";
import { vendedorDe } from "../_components/ov-helpers";

export default function NuevaOrdenVentaPage() {
  const router = useRouter();
  const crearOrden = useOrdenesVentaStore((s) => s.crearOrden);
  const facturar = useOrdenesVentaStore((s) => s.facturar);
  const getPrecio = useListasPreciosStore((s) => s.getPrecio);
  const rutas = useRutasStore((s) => s.rutas);
  const agregarOrdenRuta = useRutasStore((s) => s.agregarOrden);
  const locaciones = useLocacionesStore((s) => s.locaciones);
  const locacionesActivas = locaciones.filter((l) => l.activo);

  const [clienteId, setClienteId] = useState<string | null>(null);
  const [locacionId, setLocacionId] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<LineItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const [creada, setCreada] = useState<{ id: string; facturada: boolean } | null>(null);
  const [rutaSel, setRutaSel] = useState<string | null>(null);

  useEffect(() => {
    if (!locacionId && locacionesActivas.length > 0) setLocacionId(locacionesActivas[0].id);
  }, [locacionId, locacionesActivas]);

  const cliente = CLIENTES_SEED.find((c) => c.id === clienteId);
  const vendedor = cliente ? vendedorDe(cliente.vendedorId) : undefined;
  const rutasProgramadas = rutas.filter((r) => r.estado === "programada" || r.estado === "en-ruta");

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

  async function crear(): Promise<string | null> {
    if (!cliente || !locacionId) return null;
    const orden = await crearOrden({
      clienteId: cliente.id,
      vendedorId: cliente.vendedorId,
      locacionId,
      moneda: "GTQ",
      lineas,
      notas: notas || undefined,
    });
    return orden.id;
  }

  async function handleCrearPedido() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const id = await crear();
      if (!id) return;
      toast.success("Pedido recibido", { description: `${id} · pendiente de facturar` });
      finalizar(id, false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCrearYFacturar() {
    if (!canSave || !cliente) return;
    setCertifying(true);
    try {
      const id = await crear();
      if (!id) return;
      await facturar(id); // emite DTE + descarga inventario (con latencia SAT simulada)
      toast.success("Orden facturada", { description: id });
      finalizar(id, true);
    } catch (err) {
      toast.danger("No se pudo facturar", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setCertifying(false);
    }
  }

  function finalizar(id: string, facturada: boolean) {
    // Solo se ofrece agregar a una ruta cuando la orden ya está facturada.
    if (facturada && rutasProgramadas.length > 0) {
      setCreada({ id, facturada });
    } else {
      router.push(`/ventas/ordenes/${id}`);
    }
  }

  async function confirmarAgregarARuta() {
    if (creada && rutaSel) {
      await agregarOrdenRuta(rutaSel, creada.id);
      toast.success("Pedido agregado a la ruta", { description: `${creada.id} → ${rutaSel}` });
    }
    const id = creada?.id;
    setCreada(null);
    if (id) router.push(`/ventas/ordenes/${id}`);
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
        description="El pedido nace en estado Recibido (mercadería reservada). Al facturar se emite el DTE y se descarga el inventario."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              isPending={isSaving}
              isDisabled={!canSave || certifying}
              onPress={handleCrearPedido}
            >
              Crear pedido
            </Button>
            <Button isDisabled={!canSave || isSaving} isPending={certifying} onPress={handleCrearYFacturar}>
              <FileCheck2 className="size-4" />
              Crear y facturar
            </Button>
          </div>
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
          <Label>Almacén</Label>
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

      {!cliente ? (
        <p className="mb-4 text-sm text-slate-500">
          Selecciona un cliente para habilitar el detalle de productos.
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

      {/* Overlay de certificación SAT simulada */}
      {certifying ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-surface">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-slate-900">Certificando con SAT…</p>
            <p className="text-xs text-slate-500">Generando el DTE de la factura</p>
          </div>
        </div>
      ) : null}

      {/* Preguntar si se agrega a una ruta existente */}
      <Modal.Backdrop isOpen={!!creada} onOpenChange={(open) => !open && confirmarAgregarARuta()}>
        <Modal.Container size="sm">
          <Modal.Dialog aria-label="Agregar a una ruta">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>¿Agregar el pedido a una ruta?</Modal.Heading>
              <p className="text-sm text-slate-500">
                {creada?.id} · facturada. Al asignarla a una ruta pasará a estado «Programado».
              </p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <Select
                className="flex flex-col gap-1"
                placeholder="Sin ruta por ahora"
                value={rutaSel}
                onChange={(k) => setRutaSel(k ? String(k) : null)}
              >
                <Label>Ruta</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {rutasProgramadas.map((r) => (
                      <ListBox.Item key={r.id} id={r.id} textValue={r.nombre}>
                        <div className="flex flex-col">
                          <span className="text-sm">{r.nombre}</span>
                          <span className="text-xs text-slate-500">
                            {r.id} · {formatDate(r.fecha)}
                          </span>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => confirmarAgregarARuta()}>
                {rutaSel ? "Agregar y continuar" : "Omitir"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
