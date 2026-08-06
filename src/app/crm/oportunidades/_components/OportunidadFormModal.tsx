"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import {
  FormTextField,
  FormSelect,
  FormNumberField,
  FormDatePicker,
  FormTextArea,
} from "@/components/patterns/form-fields";
import { useOportunidadesStore } from "@/lib/store/oportunidades";
import { ETAPAS_OPORTUNIDAD, ORIGENES_OPORTUNIDAD, type Oportunidad } from "@/lib/seed/oportunidades";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { oportunidadSchema, EMPTY_OPORTUNIDAD_FORM, type OportunidadFormValues } from "./oportunidad-schema";

interface OportunidadFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  oportunidad?: Oportunidad;
}

function toFormValues(o: Oportunidad): OportunidadFormValues {
  return {
    nombre: o.nombre,
    clienteId: o.clienteId,
    vendedorId: o.vendedorId,
    etapa: o.etapa,
    valorEstimado: o.valorEstimado,
    moneda: o.moneda,
    probabilidad: o.probabilidad,
    fechaCierreEstimada: o.fechaCierreEstimada,
    origen: o.origen,
    notas: o.notas ?? "",
  };
}

export function OportunidadFormModal({ isOpen, onOpenChange, oportunidad }: OportunidadFormModalProps) {
  const crearOportunidad = useOportunidadesStore((s) => s.crearOportunidad);
  const actualizarOportunidad = useOportunidadesStore((s) => s.actualizarOportunidad);
  const isEditing = !!oportunidad;

  const form = useForm<OportunidadFormValues>({
    resolver: zodResolver(oportunidadSchema),
    defaultValues: oportunidad ? toFormValues(oportunidad) : EMPTY_OPORTUNIDAD_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(oportunidad ? toFormValues(oportunidad) : EMPTY_OPORTUNIDAD_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, oportunidad]);

  async function handleSubmit(values: OportunidadFormValues) {
    if (isEditing && oportunidad) {
      await actualizarOportunidad(oportunidad.id, values);
      toast.success("Oportunidad actualizada", { description: values.nombre });
    } else {
      await crearOportunidad(values);
      toast.success("Oportunidad creada", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar oportunidad" : "Nueva oportunidad"}
      size="md"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear oportunidad"}
    >
      <FormTextField control={form.control} name="nombre" label="Nombre de la oportunidad" isRequired />

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={form.control}
          name="etapa"
          label="Etapa"
          isRequired
          options={ETAPAS_OPORTUNIDAD.map((e) => ({ id: e.key, label: e.label }))}
        />
        <FormSelect
          control={form.control}
          name="origen"
          label="Origen"
          isRequired
          options={ORIGENES_OPORTUNIDAD.map((o) => ({ id: o, label: o }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormNumberField
          control={form.control}
          name="valorEstimado"
          label="Valor estimado (Q)"
          minValue={0}
          formatOptions={{ minimumFractionDigits: 2 }}
          isRequired
        />
        <FormNumberField
          control={form.control}
          name="probabilidad"
          label="Probabilidad (%)"
          minValue={0}
          maxValue={100}
          isRequired
        />
      </div>

      <FormDatePicker control={form.control} name="fechaCierreEstimada" label="Fecha de cierre estimada" isRequired />
      <FormTextArea control={form.control} name="notas" label="Notas" rows={2} />
    </FormModal>
  );
}
