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
import { almacenSchema, EMPTY_ALMACEN_FORM, type AlmacenFormValues } from "./almacen-schema";

interface AlmacenFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  almacen?: Locacion;
}

function toFormValues(l: Locacion): AlmacenFormValues {
  return {
    codigo: l.codigo,
    nombre: l.nombre,
    tipo: l.tipo,
    responsable: l.responsable,
    departamentoId: l.departamentoId,
    municipioId: l.municipioId,
    direccion: l.direccion,
    activo: l.activo,
  };
}

export function AlmacenFormModal({ isOpen, onOpenChange, almacen }: AlmacenFormModalProps) {
  const createLocacion = useLocacionesStore((s) => s.createLocacion);
  const updateLocacion = useLocacionesStore((s) => s.updateLocacion);
  const isEditing = !!almacen;

  const form = useForm<AlmacenFormValues>({
    resolver: zodResolver(almacenSchema),
    defaultValues: almacen ? toFormValues(almacen) : EMPTY_ALMACEN_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(almacen ? toFormValues(almacen) : EMPTY_ALMACEN_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, almacen]);

  const departamentoId = form.watch("departamentoId");
  const municipioOptions = municipiosDe(departamentoId).map((m) => ({ id: m.id, label: m.nombre }));

  async function handleSubmit(values: AlmacenFormValues) {
    if (isEditing && almacen) {
      await updateLocacion(almacen.id, values);
      toast.success("Almacén actualizado", { description: values.nombre });
    } else {
      await createLocacion(values);
      toast.success("Almacén creado", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar almacén" : "Nuevo almacén"}
      description="Bodegas, sucursales y ubicaciones de tránsito donde se controla existencia."
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear almacén"}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormTextField
          control={form.control}
          name="codigo"
          label="Código"
          placeholder="BOD-01"
          isRequired
        />
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
      </div>
      <FormTextField control={form.control} name="nombre" label="Nombre" isRequired />
      <FormTextField control={form.control} name="responsable" label="Responsable / encargado" isRequired />
      <div className="grid grid-cols-2 gap-4">
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
          placeholder={departamentoId ? "Seleccionar…" : "Elige un departamento primero"}
        />
      </div>
      <FormTextField control={form.control} name="direccion" label="Dirección" isRequired />
      <FormSwitch control={form.control} name="activo" label="Almacén activo" />
    </FormModal>
  );
}
