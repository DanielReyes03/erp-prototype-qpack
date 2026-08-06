"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormNumberField, FormTextField } from "@/components/patterns/form-fields";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import { gastoCajaSchema, EMPTY_GASTO_FORM, type GastoCajaFormValues } from "./caja-schema";

interface GastoCajaFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cajaId?: string;
}

export function GastoCajaFormModal({ isOpen, onOpenChange, cajaId }: GastoCajaFormModalProps) {
  const cajas = useTesoreriaStore((s) => s.cajas);
  const registrarGastoCaja = useTesoreriaStore((s) => s.registrarGastoCaja);

  const form = useForm<GastoCajaFormValues>({
    resolver: zodResolver(gastoCajaSchema),
    defaultValues: { ...EMPTY_GASTO_FORM, cajaId: cajaId ?? "" },
  });

  useEffect(() => {
    if (isOpen) form.reset({ ...EMPTY_GASTO_FORM, cajaId: cajaId ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cajaId]);

  async function handleSubmit(values: GastoCajaFormValues) {
    try {
      await registrarGastoCaja(values);
      toast.success("Gasto registrado", { description: values.concepto });
    } catch (err) {
      toast.danger("No se pudo registrar el gasto", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
      throw err;
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Registrar gasto de caja chica"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar gasto"
    >
      <FormSelect
        control={form.control}
        name="cajaId"
        label="Caja chica"
        isRequired
        options={cajas.map((c) => ({ id: c.id, label: c.nombre, description: c.responsable }))}
      />
      <FormTextField control={form.control} name="concepto" label="Concepto" isRequired />
      <FormNumberField
        control={form.control}
        name="monto"
        label="Monto"
        minValue={0}
        formatOptions={{ minimumFractionDigits: 2 }}
        isRequired
      />
    </FormModal>
  );
}
