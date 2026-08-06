"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormDatePicker, FormTextArea } from "@/components/patterns/form-fields";
import { useActividadesStore } from "@/lib/store/actividades";
import { TIPOS_ACTIVIDAD } from "@/lib/seed/actividades";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { actividadSchema, EMPTY_ACTIVIDAD_FORM, type ActividadFormValues } from "./actividad-schema";

interface ActividadFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActividadFormModal({ isOpen, onOpenChange }: ActividadFormModalProps) {
  const crearActividad = useActividadesStore((s) => s.crearActividad);

  const form = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadSchema),
    defaultValues: EMPTY_ACTIVIDAD_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_ACTIVIDAD_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSubmit(values: ActividadFormValues) {
    await crearActividad({
      ...values,
      oportunidadId: values.oportunidadId || undefined,
    });
    toast.success("Actividad creada", { description: values.asunto });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nueva actividad"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Crear actividad"
    >
      <FormSelect
        control={form.control}
        name="tipo"
        label="Tipo"
        isRequired
        options={TIPOS_ACTIVIDAD.map((t) => ({ id: t.key, label: t.label }))}
      />
      <FormTextField control={form.control} name="asunto" label="Asunto" isRequired />
      <FormSelect
        control={form.control}
        name="clienteId"
        label="Cliente"
        isRequired
        options={CLIENTES_SEED.filter((c) => c.activo).map((c) => ({ id: c.id, label: c.nombreComercial }))}
      />
      <FormSelect
        control={form.control}
        name="vendedorId"
        label="Vendedor"
        isRequired
        options={VENDEDORES_SEED.filter((v) => v.activo).map((v) => ({ id: v.id, label: v.nombre }))}
      />
      <FormDatePicker control={form.control} name="fecha" label="Fecha programada" isRequired />
      <FormTextArea control={form.control} name="notas" label="Notas" rows={2} />
    </FormModal>
  );
}
