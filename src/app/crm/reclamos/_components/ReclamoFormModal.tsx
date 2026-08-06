"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormTextArea } from "@/components/patterns/form-fields";
import { useReclamosStore } from "@/lib/store/reclamos";
import { CATEGORIAS_RECLAMO, PRIORIDADES_RECLAMO } from "@/lib/seed/reclamos";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { reclamoSchema, EMPTY_RECLAMO_FORM, type ReclamoFormValues } from "./reclamo-schema";

interface ReclamoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReclamoFormModal({ isOpen, onOpenChange }: ReclamoFormModalProps) {
  const crearReclamo = useReclamosStore((s) => s.crearReclamo);

  const form = useForm<ReclamoFormValues>({
    resolver: zodResolver(reclamoSchema),
    defaultValues: EMPTY_RECLAMO_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_RECLAMO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSubmit(values: ReclamoFormValues) {
    await crearReclamo(values);
    toast.success("Reclamo registrado", { description: values.asunto });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo reclamo"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar reclamo"
    >
      <FormSelect
        control={form.control}
        name="clienteId"
        label="Cliente"
        isRequired
        options={CLIENTES_SEED.filter((c) => c.activo).map((c) => ({ id: c.id, label: c.nombreComercial }))}
      />
      <FormTextField control={form.control} name="asunto" label="Asunto" isRequired />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={form.control}
          name="categoria"
          label="Categoría"
          isRequired
          options={CATEGORIAS_RECLAMO.map((c) => ({ id: c, label: c }))}
        />
        <FormSelect
          control={form.control}
          name="prioridad"
          label="Prioridad"
          isRequired
          options={PRIORIDADES_RECLAMO.map((p) => ({ id: p.key, label: `${p.label} (SLA ${p.slaDias}d)` }))}
        />
      </div>
      <FormTextArea control={form.control} name="descripcion" label="Descripción" rows={3} isRequired />
      <FormSelect
        control={form.control}
        name="asignadoAId"
        label="Asignado a"
        isRequired
        options={VENDEDORES_SEED.filter((v) => v.activo).map((v) => ({ id: v.id, label: v.nombre }))}
      />
    </FormModal>
  );
}
