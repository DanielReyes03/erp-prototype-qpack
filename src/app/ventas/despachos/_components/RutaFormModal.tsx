"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormDatePicker } from "@/components/patterns/form-fields";
import { useRutasStore } from "@/lib/store/rutas";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { rutaSchema, EMPTY_RUTA_FORM, type RutaFormValues } from "./ruta-schema";

interface RutaFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RutaFormModal({ isOpen, onOpenChange }: RutaFormModalProps) {
  const crearRuta = useRutasStore((s) => s.crearRuta);

  const form = useForm<RutaFormValues>({
    resolver: zodResolver(rutaSchema),
    defaultValues: EMPTY_RUTA_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_RUTA_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSubmit(values: RutaFormValues) {
    const ruta = await crearRuta(values);
    toast.success("Ruta creada", { description: `${ruta.id} · ${values.nombre}` });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nueva ruta"
      description="Programa una hoja de ruta y luego asígnale órdenes de venta."
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Crear ruta"
    >
      <FormTextField
        control={form.control}
        name="nombre"
        label="Nombre de la ruta"
        placeholder="Ruta Metropolitana — mañana"
        isRequired
      />
      <FormDatePicker control={form.control} name="fecha" label="Fecha" isRequired />
      <FormTextField
        control={form.control}
        name="vehiculo"
        label="Vehículo"
        placeholder="C-812BGT · Camión 3.5 t"
        isRequired
      />
      <FormSelect
        control={form.control}
        name="responsableId"
        label="Responsable"
        isRequired
        options={VENDEDORES_SEED.filter((v) => v.activo).map((v) => ({
          id: v.id,
          label: v.nombre,
          description: v.zonaAsignada,
        }))}
      />
    </FormModal>
  );
}
