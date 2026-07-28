"use client";

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ventasMensuales } from "@/lib/mock";

const chartConfig = {
  ventasGTQ: {
    label: "Ventas reales",
    color: "var(--chart-1)",
  },
  metaGTQ: {
    label: "Meta mensual",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function SalesChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <ComposedChart data={ventasMensuales} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={56}
          tickFormatter={(v: number) => `Q${(v / 1000000).toFixed(1)}M`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                `Q${Number(value).toLocaleString("es-GT", { maximumFractionDigits: 0 })}`,
                name === "ventasGTQ" ? "Ventas reales" : "Meta mensual",
              ]}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="ventasGTQ" fill="var(--color-ventasGTQ)" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Line
          dataKey="metaGTQ"
          type="monotone"
          stroke="var(--color-metaGTQ)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-metaGTQ)", strokeWidth: 0 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
