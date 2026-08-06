"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormNumberField, FormTextField } from "@/components/patterns/form-fields";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import {
  transferenciaSchema,
  EMPTY_TRANSFERENCIA_FORM,
  type TransferenciaFormValues,
} from "./tesoreria-schema";

interface TransferenciaFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferenciaFormModal({ isOpen, onOpenChange }: TransferenciaFormModalProps) {
  const cuentas = useTesoreriaStore((s) => s.cuentas);
  const registrarTransferencia = useTesoreriaStore((s) => s.registrarTransferencia);

  const form = useForm<TransferenciaFormValues>({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: EMPTY_TRANSFERENCIA_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_TRANSFERENCIA_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSubmit(values: TransferenciaFormValues) {
    await registrarTransferencia(values);
    toast.success("Transferencia registrada", { description: values.descripcion });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nueva transferencia entre cuentas"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar transferencia"
    >
      <FormSelect
        control={form.control}
        name="cuentaOrigenId"
        label="Cuenta de origen"
        isRequired
        options={cuentas.map((c) => ({ id: c.id, label: c.nombre, description: `${c.banco} · ${c.moneda}` }))}
      />
      <FormSelect
        control={form.control}
        name="cuentaDestinoId"
        label="Cuenta de destino"
        isRequired
        options={cuentas.map((c) => ({ id: c.id, label: c.nombre, description: `${c.banco} · ${c.moneda}` }))}
      />
      <FormNumberField
        control={form.control}
        name="monto"
        label="Monto"
        minValue={0}
        formatOptions={{ minimumFractionDigits: 2 }}
        isRequired
      />
      <FormTextField control={form.control} name="descripcion" label="Descripción" isRequired />
    </FormModal>
  );
}
