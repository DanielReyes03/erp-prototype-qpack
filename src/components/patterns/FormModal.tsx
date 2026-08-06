"use client";

import { useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Modal, Button, Spinner } from "@heroui/react";
import { ConfirmDialog } from "./ConfirmDialog";

type ModalSize = "xs" | "sm" | "md" | "lg" | "cover" | "full";

interface FormModalProps<TFieldValues extends FieldValues> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: ModalSize;
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * Modal estándar para formularios: envuelve react-hook-form, footer Cancelar/Guardar,
 * estado de envío, y bloqueo de cierre (con confirmación) si hay cambios sin guardar.
 */
export function FormModal<TFieldValues extends FieldValues>({
  isOpen,
  onOpenChange,
  title,
  description,
  size = "md",
  form,
  onSubmit,
  children,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
}: FormModalProps<TFieldValues>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  function requestClose(open: boolean) {
    if (!open && form.formState.isDirty && !isSubmitting) {
      setShowDiscardConfirm(true);
      return;
    }
    onOpenChange(open);
  }

  const submit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      // El formulario permanece abierto: se asume que onSubmit ya mostró
      // el feedback correspondiente (toast) para que el usuario corrija.
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={requestClose}>
        <Modal.Container size={size}>
          <Modal.Dialog aria-label={title}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
              {description ? <p className="text-sm text-slate-500">{description}</p> : null}
            </Modal.Header>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <Modal.Body className="flex flex-col gap-4">{children}</Modal.Body>
              <Modal.Footer>
                <Button
                  type="button"
                  variant="tertiary"
                  isDisabled={isSubmitting}
                  onPress={() => requestClose(false)}
                >
                  {cancelLabel}
                </Button>
                <Button type="submit" isPending={isSubmitting}>
                  {isSubmitting ? <Spinner color="current" size="sm" /> : null}
                  {submitLabel}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        status="warning"
        title="¿Descartar cambios sin guardar?"
        description="Perderás los cambios que has hecho en este formulario."
        confirmLabel="Descartar"
        onConfirm={() => {
          form.reset();
          onOpenChange(false);
        }}
      />
    </>
  );
}
