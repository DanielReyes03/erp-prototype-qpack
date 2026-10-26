"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextArea } from "@/components/patterns/form-fields";

const schema = z.object({
  motivo: z.string().min(5, "Indica el motivo de anulación (mínimo 5 caracteres)"),
});
type FormValues = z.infer<typeof schema>;

interface AnularDocumentoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentoLabel: string;
  onConfirm: (motivo: string) => Promise<void>;
}

/** Anulación con motivo obligatorio, reutilizada por órdenes de venta, compra y DTE. */
export function AnularDocumentoModal({
  isOpen,
  onOpenChange,
  documentoLabel,
  onConfirm,
}: AnularDocumentoModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { motivo: "" },
  });

  async function handleSubmit(values: FormValues) {
    await onConfirm(values.motivo);
    toast.success("Documento anulado", { description: documentoLabel });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Anular ${documentoLabel}`}
      description="Esta acción no se puede deshacer. El motivo quedará registrado en el historial."
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Anular documento"
    >
      <FormTextArea
        control={form.control}
        name="motivo"
        label="Motivo de anulación"
        placeholder="Ej. Cliente canceló el pedido"
        isRequired
      />
    </FormModal>
  );
}
