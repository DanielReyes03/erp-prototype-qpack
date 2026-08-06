import { cn } from "@/lib/cn";
import { getStatusDef, type StatusTone } from "@/lib/status";

const TONE_CLASSES: Record<StatusTone, string> = {
  default: "bg-slate-100 text-slate-700",
  accent: "bg-blue-50 text-blue-700",
  success: "bg-[#D1FAE5] text-[#059669]",
  warning: "bg-[#FEF3C7] text-[#D97706]",
  danger: "bg-[#FEE2E2] text-[#DC2626]",
};

interface StatusChipProps {
  /** Clave "dominio:estado" del registro central, ej. "ov:confirmado". */
  status: string;
  className?: string;
}

/** Chip de estado con color/etiqueta consistentes por tipo de documento. */
export function StatusChip({ status, className }: StatusChipProps) {
  const def = getStatusDef(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[def.tone],
        className,
      )}
    >
      {def.label}
    </span>
  );
}
