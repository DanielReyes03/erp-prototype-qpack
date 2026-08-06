import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/status";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Color del badge del ícono. Por defecto "accent" (azul de marca). */
  tone?: StatusTone;
  trend?: { value: string; direction: "up" | "down"; positiveIsGood?: boolean };
  className?: string;
}

const BADGE_TONE_CLASSES: Record<StatusTone, string> = {
  default: "bg-slate-100 text-slate-600",
  accent: "bg-blue-50 text-blue-700",
  success: "bg-[#D1FAE5] text-[#059669]",
  warning: "bg-[#FEF3C7] text-[#D97706]",
  danger: "bg-[#FEE2E2] text-[#DC2626]",
};

/** Tarjeta de indicador clave (KPI) para dashboards y encabezados de módulo. */
export function KpiCard({ label, value, icon: Icon, tone = "accent", trend, className }: KpiCardProps) {
  const isGood = trend
    ? trend.positiveIsGood === false
      ? trend.direction === "down"
      : trend.direction === "up"
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {Icon ? (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              BADGE_TONE_CLASSES[tone],
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        ) : null}
      </div>
      <p className="font-data text-2xl font-semibold text-slate-900">{value}</p>
      {trend ? (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isGood ? "text-[#059669]" : "text-[#DC2626]",
          )}
        >
          {trend.direction === "up" ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          <span className="font-data">{trend.value}</span>
        </div>
      ) : null}
    </div>
  );
}
