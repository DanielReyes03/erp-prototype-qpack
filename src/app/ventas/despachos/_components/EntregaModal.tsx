"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, PackageCheck } from "lucide-react";
import { Modal, Button, toast } from "@heroui/react";
import { useRutasStore } from "@/lib/store/rutas";

interface EntregaModalProps {
  rutaId: string;
  ordenId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function EntregaModal({ rutaId, ordenId, onOpenChange }: EntregaModalProps) {
  const marcarEntregada = useRutasStore((s) => s.marcarEntregada);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotoNombre, setFotoNombre] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // La imagen solo vive en la sesión: se revoca el object URL al cerrar.
  useEffect(() => {
    if (!ordenId) {
      setFotoNombre(undefined);
      setPreviewUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    }
  }, [ordenId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFotoNombre(file.name);
  }

  async function handleConfirm() {
    if (!ordenId) return;
    setIsPending(true);
    try {
      await marcarEntregada(rutaId, ordenId, fotoNombre);
      toast.success("Entrega registrada", { description: ordenId });
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Modal.Backdrop isOpen={!!ordenId} onOpenChange={(open) => !open && onOpenChange(false)}>
      <Modal.Container size="sm">
        <Modal.Dialog aria-label="Confirmar entrega">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Marcar entregado — {ordenId}</Modal.Heading>
            <p className="text-sm text-slate-500">
              Adjunta una foto como evidencia de la entrega.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Evidencia de entrega"
                className="max-h-64 w-full rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 hover:border-slate-400 hover:bg-white"
              >
                <Camera className="size-6" />
                Tomar / seleccionar foto
              </button>
            )}
            {fotoNombre ? (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{fotoNombre}</span>
                <button
                  type="button"
                  className="text-blue-700 hover:underline"
                  onClick={() => inputRef.current?.click()}
                >
                  Cambiar
                </button>
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" isDisabled={isPending} onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button isPending={isPending} isDisabled={!fotoNombre} onPress={handleConfirm}>
              <PackageCheck className="size-4" />
              Confirmar entrega
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
