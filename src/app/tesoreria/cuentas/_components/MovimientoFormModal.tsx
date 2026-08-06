"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormNumberField, FormTextField } from "@/components/patterns/form-fields";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import { movimientoSchema, EMPTY_MOVIMIENTO_FORM, type MovimientoFormValues } from "./tesoreria-schema";

interface MovimientoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cuentaId?: string;
}

export function MovimientoFormModal({ isOpen, onOpenChange, cuentaId }: MovimientoFormModalProps) {
  const cuentas = useTesoreriaStore((s) => s.cuentas);
  const registrarMovimiento = useTesoreriaStore((s) => s.registrarMovimiento);

  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: { ...EMPTY_MOVIMIENTO_FORM, cuentaId: cuentaId ?? "" },
  });

  useEffect(() => {
    if (isOpen) form.reset({ ...EMPTY_MOVIMIENTO_FORM, cuentaId: cuentaId ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cuentaId]);

  async function handleSubmit(values: MovimientoFormValues) {
    await registrarMovimiento(values);
    toast.success(
      values.tipo === "deposito" ? "Depósito registrado" : "Cheque registrado",
      { description: values.descripcion },
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nuevo movimiento bancario"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar movimiento"
    >
      <FormSelect
        control={form.control}
        name="cuentaId"
        label="Cuenta"
        isRequired
        options={cuentas.map((c) => ({ id: c.id, label: c.nombre, description: `${c.banco} · ${c.moneda}` }))}
      />
      <FormSelect
        control={form.control}
        name="tipo"
        label="Tipo de movimiento"
        isRequired
        options={[
          { id: "deposito", label: "Depósito" },
          { id: "cheque", label: "Cheque emitido" },
        ]}
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
      <FormTextField control={form.control} name="referencia" label="Referencia (opcional)" placeholder="No. de cheque, boleta…" />
    </FormModal>
  );
}
