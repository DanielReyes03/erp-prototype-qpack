"use client";

import { useState } from "react";
import { AlertDialog, Button, Spinner } from "@heroui/react";

export type ConfirmDialogStatus = "accent" | "success" | "warning" | "danger";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  status?: ConfirmDialogStatus;
  /** Si es async, el diálogo muestra spinner y se cierra solo al resolver. */
  onConfirm: () => void | Promise<void>;
}

/** Confirmación estándar para acciones destructivas o irreversibles. */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  status = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !isPending && onOpenChange(open)}
    >
      <AlertDialog.Container size="sm">
        <AlertDialog.Dialog>
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status={status} />
            <AlertDialog.Heading>{title}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <div className="text-sm text-slate-500">{description}</div>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button variant="tertiary" isDisabled={isPending} onPress={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={status === "danger" ? "danger" : "primary"}
              isPending={isPending}
              onPress={handleConfirm}
            >
              {isPending ? <Spinner color="current" size="sm" /> : null}
              {confirmLabel}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
