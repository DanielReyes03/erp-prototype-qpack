"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormTextField, FormNumberField } from "@/components/patterns/form-fields";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import {
  notaCreditoSchema,
  EMPTY_NOTA_CREDITO_FORM,
  type NotaCreditoFormValues,
} from "./factura-schema";

interface NotaCreditoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotaCreditoFormModal({ isOpen, onOpenChange }: NotaCreditoFormModalProps) {
  const crearNotaCredito = useFacturasProveedorStore((s) => s.crearNotaCredito);
  const facturas = useFacturasProveedorStore((s) => s.facturas);

  const form = useForm<NotaCreditoFormValues>({
    resolver: zodResolver(notaCreditoSchema),
    defaultValues: EMPTY_NOTA_CREDITO_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_NOTA_CREDITO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleSubmit(values: NotaCreditoFormValues) {
    await crearNotaCredito(values);
    toast.success("Nota de crédito registrada", { description: values.facturaId });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Nueva nota de crédito de proveedor"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar nota de crédito"
    >
      <FormSelect
        control={form.control}
        name="facturaId"
        label="Factura"
        isRequired
        options={facturas.map((f) => ({
          id: f.id,
          label: `${f.numeroFactura} — ${PROVEEDORES_SEED.find((p) => p.id === f.proveedorId)?.nombreComercial ?? ""}`,
        }))}
      />
      <FormTextField control={form.control} name="motivo" label="Motivo" isRequired />
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
