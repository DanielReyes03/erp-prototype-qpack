"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ventasPorCategoria } from "@/lib/mock";

const chartConfig = {
  ventasGTQ: {
    label: "Ventas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CategoryChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={ventasPorCategoria} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v: number) => `Q${(v / 1000).toFixed(0)}k`} />
        <YAxis
          type="category"
          dataKey="categoria"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [`Q${Number(value).toLocaleString("es-GT", { maximumFractionDigits: 0 })}`, "Ventas"]}
            />
          }
        />
        <Bar dataKey="ventasGTQ" fill="var(--color-ventasGTQ)" radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ChartContainer>
  );
}
