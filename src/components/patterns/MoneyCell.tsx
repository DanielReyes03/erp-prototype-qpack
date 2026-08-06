import { cn } from "@/lib/cn";
import { formatMoney, type Currency } from "@/lib/format";

interface MoneyCellProps {
  amount: number;
  currency?: Currency;
  className?: string;
  /** Colorea en rojo los negativos (saldos vencidos, notas de crédito, etc.). */
  colorizeNegative?: boolean;
  /** Usar dentro de una oración (no ocupa todo el ancho de la celda). */
  inline?: boolean;
}

/** Celda monetaria: tipografía monoespaciada tabular alineada a la derecha. */
export function MoneyCell({
  amount,
  currency = "GTQ",
  className,
  colorizeNegative = false,
  inline = false,
}: MoneyCellProps) {
  return (
    <span
      className={cn(
        "font-data text-right tabular-nums",
        inline ? "inline" : "block",
        colorizeNegative && amount < 0 && "text-[#DC2626]",
        className,
      )}
    >
      {formatMoney(amount, currency)}
    </span>
  );
}
