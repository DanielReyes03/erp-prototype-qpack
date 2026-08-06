"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, Button, toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import {
  FormTextField,
  FormSelect,
  FormNumberField,
  FormSwitch,
} from "@/components/patterns/form-fields";
import { useClientesStore } from "@/lib/store/clientes";
import type { Cliente } from "@/lib/seed/clientes";
import { DEPARTAMENTOS, municipiosDe } from "@/lib/seed/geografia";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { LISTAS_PRECIOS_SEED } from "@/lib/seed/listas-precios";
import { clienteSchema, EMPTY_CLIENTE_FORM, type ClienteFormValues } from "./cliente-schema";

interface ClienteFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
}

function clienteToFormValues(cliente: Cliente): ClienteFormValues {
  return {
    nit: cliente.nit,
    nombreComercial: cliente.nombreComercial,
    razonSocial: cliente.razonSocial,
    direccion: cliente.direccion,
    departamentoId: cliente.departamentoId,
    municipioId: cliente.municipioId,
    zona: cliente.zona,
    vendedorId: cliente.vendedorId,
    listaPrecioId: cliente.listaPrecioId,
    limiteCredito: cliente.limiteCredito,
    diasCredito: cliente.diasCredito,
    activo: cliente.activo,
    contactos: cliente.contactos.map((c) => ({
      nombre: c.nombre,
      cargo: c.cargo,
      telefono: c.telefono,
      email: c.email,
    })),
  };
}

export function ClienteFormModal({ isOpen, onOpenChange, cliente }: ClienteFormModalProps) {
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);
  const isEditing = !!cliente;

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? clienteToFormValues(cliente) : EMPTY_CLIENTE_FORM,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "contactos" });

  useEffect(() => {
    if (isOpen) {
      form.reset(cliente ? clienteToFormValues(cliente) : EMPTY_CLIENTE_FORM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cliente]);

  const departamentoId = form.watch("departamentoId");
  const municipioOptions = municipiosDe(departamentoId).map((m) => ({ id: m.id, label: m.nombre }));

  async function handleSubmit(values: ClienteFormValues) {
    if (isEditing && cliente) {
      await updateCliente(cliente.id, values);
      toast.success("Cliente actualizado", { description: values.nombreComercial });
    } else {
      await createCliente(values);
      toast.success("Cliente creado", { description: values.nombreComercial });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar cliente" : "Nuevo cliente"}
      description="Los campos marcados con * son obligatorios."
      size="lg"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear cliente"}
    >
      <Tabs defaultSelectedKey="general">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Secciones del cliente">
            <Tabs.Tab id="general">
              General
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="contactos">
              Contactos ({fields.length})
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="general" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormTextField control={form.control} name="nit" label="NIT" placeholder="1234567-8" isRequired />
            <FormTextField
              control={form.control}
              name="nombreComercial"
              label="Nombre comercial"
              isRequired
            />
          </div>
          <FormTextField control={form.control} name="razonSocial" label="Razón social" isRequired />
          <FormTextField control={form.control} name="direccion" label="Dirección fiscal" isRequired />

          <div className="grid grid-cols-3 gap-4">
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
            <FormTextField control={form.control} name="zona" label="Zona" placeholder="Zona 10" isRequired />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="vendedorId"
              label="Vendedor asignado"
              isRequired
              options={VENDEDORES_SEED.filter((v) => v.activo).map((v) => ({
                id: v.id,
                label: v.nombre,
                description: v.zonaAsignada,
              }))}
            />
            <FormSelect
              control={form.control}
              name="listaPrecioId"
              label="Lista de precios"
              isRequired
              options={LISTAS_PRECIOS_SEED.map((l) => ({
                id: l.id,
                label: l.nombre,
                description: l.moneda,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormNumberField
              control={form.control}
              name="limiteCredito"
              label="Límite de crédito (GTQ)"
              minValue={0}
              formatOptions={{ minimumFractionDigits: 2 }}
              isRequired
            />
            <FormNumberField
              control={form.control}
              name="diasCredito"
              label="Días de crédito"
              minValue={0}
              isRequired
            />
          </div>

          <FormSwitch control={form.control} name="activo" label="Cliente activo" />
        </Tabs.Panel>

        <Tabs.Panel id="contactos" className="flex flex-col gap-4 pt-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-md border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Contacto {index + 1}
                </p>
                {fields.length > 1 ? (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label="Quitar contacto"
                    onPress={() => remove(index)}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormTextField
                  control={form.control}
                  name={`contactos.${index}.nombre`}
                  label="Nombre"
                  isRequired
                />
                <FormTextField
                  control={form.control}
                  name={`contactos.${index}.cargo`}
                  label="Cargo"
                  isRequired
                />
                <FormTextField
                  control={form.control}
                  name={`contactos.${index}.telefono`}
                  label="Teléfono"
                  isRequired
                />
                <FormTextField
                  control={form.control}
                  name={`contactos.${index}.email`}
                  label="Correo"
                  type="email"
                  isRequired
                />
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onPress={() => append({ nombre: "", cargo: "", telefono: "", email: "" })}
          >
            <Plus className="size-4" />
            Agregar contacto
          </Button>
        </Tabs.Panel>
      </Tabs>
    </FormModal>
  );
}
