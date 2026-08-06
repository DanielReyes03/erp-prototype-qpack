"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormSwitch } from "@/components/patterns/form-fields";
import { useLocacionesStore } from "@/lib/store/locaciones";
import type { Locacion } from "@/lib/seed/locaciones";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/seed/geografia";
import { locacionSchema, EMPTY_LOCACION_FORM, type LocacionFormValues } from "./locacion-schema";

interface LocacionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locacion?: Locacion;
}

function toFormValues(l: Locacion): LocacionFormValues {
  return {
    nombre: l.nombre,
    tipo: l.tipo,
    departamentoId: l.departamentoId,
    municipioId: l.municipioId,
    direccion: l.direccion,
    activo: l.activo,
  };
}

export function LocacionFormModal({ isOpen, onOpenChange, locacion }: LocacionFormModalProps) {
  const createLocacion = useLocacionesStore((s) => s.createLocacion);
  const updateLocacion = useLocacionesStore((s) => s.updateLocacion);
  const isEditing = !!locacion;

  const form = useForm<LocacionFormValues>({
    resolver: zodResolver(locacionSchema),
    defaultValues: locacion ? toFormValues(locacion) : EMPTY_LOCACION_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(locacion ? toFormValues(locacion) : EMPTY_LOCACION_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, locacion]);

  const departamentoId = form.watch("departamentoId");
  const municipioOptions = municipiosDe(departamentoId).map((m) => ({ id: m.id, label: m.nombre }));

  async function handleSubmit(values: LocacionFormValues) {
    if (isEditing && locacion) {
      await updateLocacion(locacion.id, values);
      toast.success("Locación actualizada", { description: values.nombre });
    } else {
      await createLocacion(values);
      toast.success("Locación creada", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar locación" : "Nueva locación"}
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear locación"}
    >
      <FormTextField control={form.control} name="nombre" label="Nombre" isRequired />
      <FormSelect
        control={form.control}
        name="tipo"
        label="Tipo"
        isRequired
        options={[
          { id: "Bodega", label: "Bodega" },
          { id: "Sucursal", label: "Sucursal" },
          { id: "Tránsito", label: "Tránsito (aduanas)" },
        ]}
      />
      <FormSelect
        control={form.control}
        name="departamentoId"
        label="Departamento"
        isRequired
        options={DEPARTAMENTOS.map((d) => ({ id: d.id, label: d.nombre }))}
      />
      <FormSelect
        control={form.control}
        name="municipioId"
        label="Municipio"
        isRequired
        options={municipioOptions}
        placeholder={departamentoId ? "Seleccionar…" : "Elegí un departamento primero"}
      />
      <FormTextField control={form.control} name="direccion" label="Dirección" isRequired />
      <FormSwitch control={form.control} name="activo" label="Locación activa" />
    </FormModal>
  );
}
