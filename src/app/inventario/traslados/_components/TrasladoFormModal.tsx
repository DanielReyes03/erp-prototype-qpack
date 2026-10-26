"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormNumberField, FormTextField } from "@/components/patterns/form-fields";
import { useInventarioStore } from "@/lib/store/inventario";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { trasladoSchema, EMPTY_TRASLADO_FORM, type TrasladoFormValues } from "./traslado-schema";

interface TrasladoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrasladoFormModal({ isOpen, onOpenChange }: TrasladoFormModalProps) {
  const registrarTraslado = useInventarioStore((s) => s.registrarTraslado);
  const getExistencia = useInventarioStore((s) => s.getExistencia);
  const locacionesActivas = useLocacionesStore((s) => s.locaciones).filter((l) => l.activo);

  const form = useForm<TrasladoFormValues>({
    resolver: zodResolver(trasladoSchema),
    defaultValues: EMPTY_TRASLADO_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_TRASLADO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const productoId = form.watch("productoId");
  const locacionOrigenId = form.watch("locacionOrigenId");
  const existenciaOrigen = getExistencia(productoId, locacionOrigenId)?.cantidad ?? 0;

  async function handleSubmit(values: TrasladoFormValues) {
    const actual = getExistencia(values.productoId, values.locacionOrigenId);
    if (!actual || actual.cantidad < values.cantidad) {
      toast.danger("Existencia insuficiente", {
        description: `Disponible en origen: ${actual?.cantidad ?? 0}`,
      });
      throw new Error("Existencia insuficiente");
    }
    await registrarTraslado(values);
    const producto = PRODUCTOS_SEED.find((p) => p.id === values.productoId);
    toast.success("Traslado registrado", { description: producto?.nombre });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo traslado entre almacenes"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar traslado"
    >
      <FormSelect
        control={form.control}
        name="productoId"
        label="Producto"
        isRequired
        options={PRODUCTOS_SEED.map((p) => ({ id: p.id, label: p.nombre, description: p.sku }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={form.control}
          name="locacionOrigenId"
          label="Almacén de origen"
          isRequired
          options={locacionesActivas.map((l) => ({ id: l.id, label: l.nombre }))}
          description={
            productoId && locacionOrigenId
              ? `Disponible: ${existenciaOrigen.toLocaleString("en-US")}`
              : undefined
          }
        />
        <FormSelect
          control={form.control}
          name="locacionDestinoId"
          label="Almacén de destino"
          isRequired
          options={locacionesActivas.map((l) => ({ id: l.id, label: l.nombre }))}
        />
      </div>
      <FormNumberField control={form.control} name="cantidad" label="Cantidad" minValue={0} isRequired />
      <FormTextField control={form.control} name="motivo" label="Motivo" isRequired />
      <FormTextField
        control={form.control}
        name="documentoReferencia"
        label="Documento de referencia"
        placeholder="TR-000123"
      />
    </FormModal>
  );
}
