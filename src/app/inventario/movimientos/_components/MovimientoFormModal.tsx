"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button, toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormTextField, FormNumberField } from "@/components/patterns/form-fields";
import { useInventarioStore } from "@/lib/store/inventario";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
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

  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: EMPTY_MOVIMIENTO_FORM,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lineas" });

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
      description: `${values.lineas.length} línea(s) aplicadas a ${LOCACIONES_SEED.find((l) => l.id === values.locacionId)?.nombre}`,
    });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo movimiento de inventario"
      description="Registrá una entrada, salida o ajuste con una o más líneas de producto."
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
          label="Locación"
          isRequired
          options={LOCACIONES_SEED.map((l) => ({ id: l.id, label: l.nombre }))}
        />
        <FormTextField
          control={form.control}
          name="documentoReferencia"
          label="Documento de referencia"
          placeholder="OC-000123"
        />
      </div>
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
