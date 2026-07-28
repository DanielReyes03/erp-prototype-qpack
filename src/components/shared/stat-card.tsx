import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
  deltaLabel = "vs. mes anterior",
  invertDelta = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  deltaPct?: number;
  deltaLabel?: string;
  invertDelta?: boolean;
}) {
  const isPositive = deltaPct !== undefined ? (invertDelta ? deltaPct < 0 : deltaPct > 0) : undefined;
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {deltaPct !== undefined && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(deltaPct).toFixed(1)}%
            <span className="font-normal text-muted-foreground">{deltaLabel}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
