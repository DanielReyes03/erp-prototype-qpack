"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormNumberField, FormSwitch } from "@/components/patterns/form-fields";
import { useVendedoresStore } from "@/lib/store/vendedores";
import { ZONAS_VENTA, type Vendedor } from "@/lib/seed/vendedores";
import { vendedorSchema, EMPTY_VENDEDOR_FORM, type VendedorFormValues } from "./vendedor-schema";

interface VendedorFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vendedor?: Vendedor;
}

function toFormValues(v: Vendedor): VendedorFormValues {
  return {
    nombre: v.nombre,
    email: v.email,
    telefono: v.telefono,
    zonaAsignada: v.zonaAsignada,
    porcentajeComision: v.porcentajeComision,
    activo: v.activo,
  };
}

export function VendedorFormModal({ isOpen, onOpenChange, vendedor }: VendedorFormModalProps) {
  const createVendedor = useVendedoresStore((s) => s.createVendedor);
  const updateVendedor = useVendedoresStore((s) => s.updateVendedor);
  const isEditing = !!vendedor;

  const form = useForm<VendedorFormValues>({
    resolver: zodResolver(vendedorSchema),
    defaultValues: vendedor ? toFormValues(vendedor) : EMPTY_VENDEDOR_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(vendedor ? toFormValues(vendedor) : EMPTY_VENDEDOR_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vendedor]);

  async function handleSubmit(values: VendedorFormValues) {
    if (isEditing && vendedor) {
      await updateVendedor(vendedor.id, values);
      toast.success("Vendedor actualizado", { description: values.nombre });
    } else {
      await createVendedor(values);
      toast.success("Vendedor creado", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar vendedor" : "Nuevo vendedor"}
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear vendedor"}
    >
      <FormTextField control={form.control} name="nombre" label="Nombre completo" isRequired />
      <FormTextField control={form.control} name="email" label="Correo" type="email" isRequired />
      <FormTextField control={form.control} name="telefono" label="Teléfono" isRequired />
      <FormSelect
        control={form.control}
        name="zonaAsignada"
        label="Zona asignada"
        isRequired
        options={ZONAS_VENTA.map((z) => ({ id: z, label: z }))}
      />
      <FormNumberField
        control={form.control}
        name="porcentajeComision"
        label="% de comisión"
        minValue={0}
        maxValue={100}
        formatOptions={{ minimumFractionDigits: 2 }}
        isRequired
      />
      <FormSwitch control={form.control} name="activo" label="Vendedor activo" />
    </FormModal>
  );
}
