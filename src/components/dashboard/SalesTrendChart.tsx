"use client";

import { useId, useState } from "react";
import { formatMoney } from "@/lib/format";

interface SalesPoint {
  label: string;
  amount: number;
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

export function SalesTrendChart({ data }: { data: SalesPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gradientId = useId();

  const max = Math.max(...data.map((d) => d.amount), 1);
  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const barSlot = plotWidth / data.length;
  const barWidth = Math.min(40, barSlot * 0.5);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Ventas mensuales de los últimos 6 meses"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Línea base */}
        <line
          x1={PADDING_LEFT}
          x2={WIDTH - PADDING_RIGHT}
          y1={HEIGHT - PADDING_BOTTOM}
          y2={HEIGHT - PADDING_BOTTOM}
          stroke="#E2E8F0"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = Math.max(2, (d.amount / max) * plotHeight);
          const x = PADDING_LEFT + i * barSlot + (barSlot - barWidth) / 2;
          const y = HEIGHT - PADDING_BOTTOM - barHeight;
          const isHovered = hovered === i;

          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={isHovered ? "#1D4ED8" : `url(#${gradientId})`}
                opacity={isHovered ? 1 : 0.9}
              />
              <rect
                x={PADDING_LEFT + i * barSlot}
                y={PADDING_TOP}
                width={barSlot}
                height={plotHeight}
                fill="transparent"
              />
              <text
                x={x + barWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 16}
                textAnchor="middle"
                className="fill-slate-500"
                fontSize={11}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered !== null && (
        <div
          className="pointer-events-none absolute top-2 rounded-xl border border-slate-200 bg-white shadow-surface px-2.5 py-1.5 text-xs shadow-md"
          style={{
            left: `${((hovered + 0.5) / data.length) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-medium text-slate-900">{data[hovered].label}</p>
          <p className="font-data text-blue-700">{formatMoney(data[hovered].amount)}</p>
        </div>
      )}
    </div>
  );
}
