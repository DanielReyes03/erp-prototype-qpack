import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

export interface DocumentStep {
  key: string;
  label: string;
  /** Fecha real en que se completó esta etapa (ISO). Si se omite, se muestra sin fecha. */
  date?: string;
}

interface DocumentStepperProps {
  steps: DocumentStep[];
  currentKey: string;
  /** Si el documento fue anulado/rechazado, se muestra un riel interrumpido en rojo. */
  cancelled?: boolean;
  cancelledLabel?: string;
  className?: string;
}

/**
 * Riel horizontal de etapas del documento (Pedido → Despacho → Entrega, etc.).
 * Es el único elemento con peso visual fuerte en el detalle de un documento.
 */
export function DocumentStepper({
  steps,
  currentKey,
  cancelled = false,
  cancelledLabel = "Anulado",
  className,
}: DocumentStepperProps) {
  // Si currentKey no coincide con ninguna etapa (ej. "completado"), se asume que
  // el documento terminó su flujo y todas las etapas se muestran completadas.
  const matchedIndex = steps.findIndex((s) => s.key === currentKey);
  const currentIndex = matchedIndex === -1 ? steps.length : matchedIndex;

  if (cancelled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3",
          className,
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-white">
          <X className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#DC2626]">{cancelledLabel}</p>
          <p className="text-xs text-slate-500">
            Este documento fue anulado y no continúa el flujo normal de etapas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ol className="flex w-full items-start">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === steps.length - 1;

          return (
            <li key={step.key} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isCompleted && "bg-blue-700 text-white",
                    isCurrent && "bg-blue-700 text-white ring-4 ring-blue-50",
                    !isCompleted && !isCurrent && "border border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : i + 1}
                </div>
                <p
                  className={cn(
                    "mt-2 max-w-[110px] text-center text-xs font-medium",
                    isCompleted || isCurrent ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
                <p className="font-data mt-0.5 text-center text-[11px] text-slate-500">
                  {(isCompleted || isCurrent) && step.date ? formatDate(step.date) : " "}
                </p>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-2 mt-[-20px] h-px flex-1",
                    isCompleted ? "bg-blue-700" : "bg-slate-200",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
