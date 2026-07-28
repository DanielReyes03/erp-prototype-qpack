import { cn } from "@/lib/utils";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 border-red-500/20 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 border-blue-500/20 dark:text-blue-400",
};

const successKeywords = ["aprobad", "complet", "pagad", "certificad", "entregad", "cerrad", "activ", "contabilizad", "recibid", "surtid", "liberad", "ganada", "al dia", "disponible", "confirmada"];
const dangerKeywords = ["rechaz", "cancel", "vencid", "anulad", "danad", "critico", "perdida", "con diferencias", "con incidencia", "inactiv"];
const warningKeywords = ["pendient", "borrador", "revision", "por vencer", "alerta", "advertencia", "backorder", "parcial", "solicitad", "programad", "mantenimiento"];
const infoKeywords = ["proceso", "transito", "preparacion", "ruta", "tramite", "enviad", "reservad", "en curso", "produccion"];

export function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (successKeywords.some((k) => s.includes(k))) return "success";
  if (dangerKeywords.some((k) => s.includes(k))) return "danger";
  if (warningKeywords.some((k) => s.includes(k))) return "warning";
  if (infoKeywords.some((k) => s.includes(k))) return "info";
  return "neutral";
}

export function StatusBadge({ status, tone, className }: { status: string; tone?: Tone; className?: string }) {
  const resolvedTone = tone ?? statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
        toneClasses[resolvedTone],
        className
      )}
    >
      {status}
    </span>
  );
}
