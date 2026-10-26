"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button, Select, ListBox, Label, toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormTextField, FormNumberField } from "@/components/patterns/form-fields";
import { useInventarioStore } from "@/lib/store/inventario";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import {
  movimientoSchema,
  EMPTY_MOVIMIENTO_FORM,
  TIPOS_MOVIMIENTO,
  type MovimientoFormValues,
} from "./movimiento-schema";

interface MovimientoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovimientoFormModal({ isOpen, onOpenChange }: MovimientoFormModalProps) {
  const registrarEntrada = useInventarioStore((s) => s.registrarEntrada);
  const registrarSalida = useInventarioStore((s) => s.registrarSalida);
  const registrarAjuste = useInventarioStore((s) => s.registrarAjuste);
  const getExistencia = useInventarioStore((s) => s.getExistencia);
  const getCostoPromedio = useInventarioStore((s) => s.getCostoPromedio);
  const ordenesCompra = useOrdenesCompraStore((s) => s.ordenes);
  const locaciones = useLocacionesStore((s) => s.locaciones);
  const locacionesActivas = locaciones.filter((l) => l.activo);

  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: EMPTY_MOVIMIENTO_FORM,
  });

  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "lineas" });

  const ordenesEntrada = ordenesCompra.filter(
    (o) => o.estado === "confirmada" || o.estado === "recibida-parcial",
  );

  function aplicarOrdenCompra(ocId: string | null) {
    form.setValue("ordenCompraId", ocId ?? "");
    if (!ocId) return;
    const oc = ordenesCompra.find((o) => o.id === ocId);
    if (!oc) return;
    const pendientes = oc.lineas
      .filter((l) => l.cantidad - l.cantidadRecibida > 0)
      .map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad - l.cantidadRecibida,
        costoUnitario: l.costoUnitario,
      }));
    if (pendientes.length > 0) replace(pendientes);
    form.setValue("locacionId", oc.locacionId, { shouldValidate: true });
    form.setValue("documentoReferencia", oc.id);
    const prov = PROVEEDORES_SEED.find((p) => p.id === oc.proveedorId);
    form.setValue("motivo", `Recepción de compra ${oc.id}${prov ? ` — ${prov.nombreComercial}` : ""}`, {
      shouldValidate: true,
    });
  }

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_MOVIMIENTO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const tipo = form.watch("tipo");
  const locacionId = form.watch("locacionId");
  const esEntradaLike = tipo === "entrada" || tipo === "ajuste-positivo";

  async function handleSubmit(values: MovimientoFormValues) {
    // Pre-validar existencia suficiente para salidas / ajustes negativos antes de aplicar nada.
    if (!esEntradaLike) {
      for (const linea of values.lineas) {
        const actual = getExistencia(linea.productoId, values.locacionId);
        if (!actual || actual.cantidad < linea.cantidad) {
          const producto = PRODUCTOS_SEED.find((p) => p.id === linea.productoId);
          toast.danger("Existencia insuficiente", {
            description: `${producto?.nombre ?? "Producto"}: disponible ${actual?.cantidad ?? 0}, solicitado ${linea.cantidad}`,
          });
          throw new Error("Existencia insuficiente");
        }
      }
    }

    for (const linea of values.lineas) {
      const base = {
        productoId: linea.productoId,
        locacionId: values.locacionId,
        cantidad: linea.cantidad,
        motivo: values.motivo,
        documentoReferencia: values.documentoReferencia || undefined,
      };
      if (tipo === "entrada") {
        await registrarEntrada({ ...base, costoUnitario: linea.costoUnitario ?? 0 });
      } else if (tipo === "salida") {
        await registrarSalida(base);
      } else {
        await registrarAjuste({ ...base, tipo: tipo === "ajuste-positivo" ? "positivo" : "negativo" });
      }
    }

    toast.success("Movimiento registrado", {
      description: `${values.lineas.length} línea(s) aplicadas a ${locaciones.find((l) => l.id === values.locacionId)?.nombre}`,
    });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo movimiento de inventario"
      description="Registra una entrada, salida o ajuste con una o más líneas de producto."
      size="lg"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar movimiento"
    >
      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          control={form.control}
          name="tipo"
          label="Tipo de movimiento"
          isRequired
          options={TIPOS_MOVIMIENTO.map((t) => ({ id: t.id, label: t.label }))}
        />
        <FormSelect
          control={form.control}
          name="locacionId"
          label="Almacén"
          isRequired
          options={locacionesActivas.map((l) => ({ id: l.id, label: l.nombre }))}
        />
        <FormTextField
          control={form.control}
          name="documentoReferencia"
          label="Documento de referencia"
          placeholder="OC-000123"
        />
      </div>

      {tipo === "entrada" ? (
        <Select
          className="flex flex-col gap-1"
          placeholder={
            ordenesEntrada.length ? "Sin orden asociada" : "No hay órdenes de compra pendientes"
          }
          value={form.watch("ordenCompraId") || null}
          isDisabled={ordenesEntrada.length === 0}
          onChange={(k) => aplicarOrdenCompra(k ? String(k) : null)}
        >
          <Label>Orden de compra (opcional)</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {ordenesEntrada.map((o) => {
                const prov = PROVEEDORES_SEED.find((p) => p.id === o.proveedorId);
                return (
                  <ListBox.Item key={o.id} id={o.id} textValue={o.id}>
                    <div className="flex flex-col">
                      <span className="font-data text-sm">{o.id}</span>
                      <span className="text-xs text-slate-500">{prov?.nombreComercial}</span>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : null}

      <FormTextField
        control={form.control}
        name="motivo"
        label="Motivo"
        placeholder="Compra a proveedor, conteo físico, merma…"
        isRequired
      />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Líneas</p>
        {fields.map((field, index) => {
          const productoId = form.watch(`lineas.${index}.productoId`);
          const existenciaActual = locacionId ? getExistencia(productoId, locacionId)?.cantidad ?? 0 : 0;
          return (
            <div key={field.id} className="grid grid-cols-12 items-start gap-2 rounded-md border border-slate-200 p-2">
              <div className="col-span-5">
                <FormSelect
                  control={form.control}
                  name={`lineas.${index}.productoId`}
                  label="Producto"
                  isRequired
                  options={PRODUCTOS_SEED.map((p) => ({ id: p.id, label: p.nombre, description: p.sku }))}
                  className="gap-0"
                />
                {!esEntradaLike && productoId && locacionId ? (
                  <p className="font-data mt-0.5 text-[11px] text-slate-500">
                    Disponible: {existenciaActual.toLocaleString("en-US")}
                  </p>
                ) : null}
              </div>
              <div className="col-span-3">
                <FormNumberField
                  control={form.control}
                  name={`lineas.${index}.cantidad`}
                  label="Cantidad"
                  minValue={0}
                  isRequired
                  className="gap-0"
                />
              </div>
              <div className="col-span-3">
                {esEntradaLike ? (
                  <FormNumberField
                    control={form.control}
                    name={`lineas.${index}.costoUnitario`}
                    label="Costo unitario"
                    minValue={0}
                    formatOptions={{ minimumFractionDigits: 2 }}
                    className="gap-0"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-end pb-2">
                    <p className="font-data text-xs text-slate-500">
                      Costo prom.: {getCostoPromedio(productoId, locacionId).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              <div className="col-span-1 flex justify-end pt-6">
                {fields.length > 1 ? (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label="Quitar línea"
                    onPress={() => remove(index)}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onPress={() => append({ productoId: "", cantidad: 1, costoUnitario: 0 })}
        >
          <Plus className="size-4" />
          Agregar línea
        </Button>
      </div>
    </FormModal>
  );
}
