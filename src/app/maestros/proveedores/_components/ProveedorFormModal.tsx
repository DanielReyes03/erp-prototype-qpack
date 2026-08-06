"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormNumberField, FormSwitch } from "@/components/patterns/form-fields";
import { useProveedoresStore } from "@/lib/store/proveedores";
import { BANCOS_GT, type Proveedor } from "@/lib/seed/proveedores";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/seed/geografia";
import { proveedorSchema, EMPTY_PROVEEDOR_FORM, type ProveedorFormValues } from "./proveedor-schema";

interface ProveedorFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor?: Proveedor;
}

function toFormValues(p: Proveedor): ProveedorFormValues {
  return {
    nit: p.nit,
    nombreComercial: p.nombreComercial,
    razonSocial: p.razonSocial,
    direccion: p.direccion,
    departamentoId: p.departamentoId,
    municipioId: p.municipioId,
    telefono: p.telefono,
    email: p.email,
    contactoNombre: p.contactoNombre,
    diasCredito: p.diasCredito,
    activo: p.activo,
    datosBancarios: { ...p.datosBancarios },
  };
}

export function ProveedorFormModal({ isOpen, onOpenChange, proveedor }: ProveedorFormModalProps) {
  const createProveedor = useProveedoresStore((s) => s.createProveedor);
  const updateProveedor = useProveedoresStore((s) => s.updateProveedor);
  const isEditing = !!proveedor;

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: proveedor ? toFormValues(proveedor) : EMPTY_PROVEEDOR_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(proveedor ? toFormValues(proveedor) : EMPTY_PROVEEDOR_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, proveedor]);

  const departamentoId = form.watch("departamentoId");
  const municipioOptions = municipiosDe(departamentoId).map((m) => ({ id: m.id, label: m.nombre }));

  async function handleSubmit(values: ProveedorFormValues) {
    if (isEditing && proveedor) {
      await updateProveedor(proveedor.id, values);
      toast.success("Proveedor actualizado", { description: values.nombreComercial });
    } else {
      await createProveedor(values);
      toast.success("Proveedor creado", { description: values.nombreComercial });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar proveedor" : "Nuevo proveedor"}
      description="Los campos marcados con * son obligatorios."
      size="lg"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear proveedor"}
    >
      <Tabs defaultSelectedKey="general">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Secciones del proveedor">
            <Tabs.Tab id="general">
              General
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="bancarios">
              Datos bancarios
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="general" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormTextField control={form.control} name="nit" label="NIT" placeholder="1234567-8" isRequired />
            <FormTextField control={form.control} name="nombreComercial" label="Nombre comercial" isRequired />
          </div>
          <FormTextField control={form.control} name="razonSocial" label="Razón social" isRequired />
          <FormTextField control={form.control} name="direccion" label="Dirección" isRequired />

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
              placeholder={departamentoId ? "Seleccionar…" : "Elegí un departamento primero"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormTextField control={form.control} name="telefono" label="Teléfono" isRequired />
            <FormTextField control={form.control} name="email" label="Correo" type="email" isRequired />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormTextField control={form.control} name="contactoNombre" label="Nombre de contacto" isRequired />
            <FormNumberField control={form.control} name="diasCredito" label="Días de crédito" minValue={0} isRequired />
          </div>

          <FormSwitch control={form.control} name="activo" label="Proveedor activo" />
        </Tabs.Panel>

        <Tabs.Panel id="bancarios" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="datosBancarios.banco"
              label="Banco"
              isRequired
              options={BANCOS_GT.map((b) => ({ id: b, label: b }))}
            />
            <FormSelect
              control={form.control}
              name="datosBancarios.tipoCuenta"
              label="Tipo de cuenta"
              isRequired
              options={[
                { id: "Monetaria", label: "Monetaria" },
                { id: "Ahorro", label: "Ahorro" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormTextField
              control={form.control}
              name="datosBancarios.numeroCuenta"
              label="Número de cuenta"
              isRequired
            />
            <FormSelect
              control={form.control}
              name="datosBancarios.moneda"
              label="Moneda"
              isRequired
              options={[
                { id: "GTQ", label: "Quetzales (GTQ)" },
                { id: "USD", label: "Dólares (USD)" },
              ]}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </FormModal>
  );
}
