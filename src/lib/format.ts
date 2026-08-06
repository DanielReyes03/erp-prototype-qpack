import { format as formatDateFns, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export type Currency = "GTQ" | "USD";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  GTQ: "Q",
  USD: "$",
};

/** Formatea montos como "Q 12,450.00" o "$ 1,596.15". */
export function formatMoney(amount: number, currency: Currency = "GTQ"): string {
  const symbol = CURRENCY_SYMBOL[currency];
  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol} ${number}`;
}

/** Formatea cantidades (existencias, unidades) con separador de miles, sin símbolo monetario. */
export function formatQuantity(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formatea porcentajes, ej. 12.5 -> "12.5%". */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Convierte un string "YYYY-MM-DD" (o Date) a Date local a medianoche.
 * `new Date("YYYY-MM-DD")` lo interpreta como UTC y desfasa el día en zonas
 * horarias detrás de UTC (todo Centroamérica) — por eso se parsean los
 * componentes a mano en vez de delegar en el constructor de Date.
 */
export function toLocalDate(date: Date | string): Date {
  if (typeof date !== "string") return date;
  // Solo re-interpretar como fecha local cuando el string es "YYYY-MM-DD" puro
  // (sin hora). Los timestamps completos sí llevan información de instante real.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(date);
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy"): string {
  return formatDateFns(toLocalDate(date), pattern, { locale: es });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function formatDateLong(date: Date | string): string {
  return formatDate(date, "d 'de' MMMM 'de' yyyy");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(toLocalDate(date), { locale: es, addSuffix: true });
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
