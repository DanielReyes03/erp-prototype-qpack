"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect } from "@/components/patterns/form-fields";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import type { ListaPrecio } from "@/lib/seed/listas-precios";
import {
  listaPrecioSchema,
  EMPTY_LISTA_PRECIO_FORM,
  type ListaPrecioFormValues,
} from "./lista-precio-schema";

interface ListaPrecioFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lista?: ListaPrecio;
}

export function ListaPrecioFormModal({ isOpen, onOpenChange, lista }: ListaPrecioFormModalProps) {
  const createLista = useListasPreciosStore((s) => s.createLista);
  const updateLista = useListasPreciosStore((s) => s.updateLista);
  const isEditing = !!lista;

  const form = useForm<ListaPrecioFormValues>({
    resolver: zodResolver(listaPrecioSchema),
    defaultValues: lista
      ? { nombre: lista.nombre, moneda: lista.moneda, descripcion: lista.descripcion }
      : EMPTY_LISTA_PRECIO_FORM,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        lista
          ? { nombre: lista.nombre, moneda: lista.moneda, descripcion: lista.descripcion }
          : EMPTY_LISTA_PRECIO_FORM,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lista]);

  async function handleSubmit(values: ListaPrecioFormValues) {
    if (isEditing && lista) {
      await updateLista(lista.id, values);
      toast.success("Lista de precios actualizada", { description: values.nombre });
    } else {
      await createLista(values);
      toast.success("Lista de precios creada", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar lista de precios" : "Nueva lista de precios"}
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear lista"}
    >
      <FormTextField control={form.control} name="nombre" label="Nombre" isRequired />
      <FormSelect
        control={form.control}
        name="moneda"
        label="Moneda"
        isRequired
        options={[
          { id: "GTQ", label: "Quetzales (GTQ)" },
          { id: "USD", label: "Dólares (USD)" },
        ]}
      />
      <FormTextField control={form.control} name="descripcion" label="Descripción" isRequired />
    </FormModal>
  );
}
