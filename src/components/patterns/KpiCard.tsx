import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down"; positiveIsGood?: boolean };
  className?: string;
}

/** Tarjeta de indicador clave (KPI) para dashboards y encabezados de módulo. */
export function KpiCard({ label, value, icon: Icon, trend, className }: KpiCardProps) {
  const isGood = trend
    ? trend.positiveIsGood === false
      ? trend.direction === "down"
      : trend.direction === "up"
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {Icon ? <Icon className="size-4 text-blue-700" aria-hidden /> : null}
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
