import { CalendarDate, parseDate, type DateValue } from "@internationalized/date";

/** Convierte un string "YYYY-MM-DD" (o Date) al DateValue que esperan los campos de fecha de HeroUI. */
export function toDateValue(date: string | Date | null | undefined): DateValue | null {
  if (!date) return null;
  if (typeof date === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    if (!match) return null;
    return parseDate(match[0]);
  }
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Convierte un DateValue de HeroUI a un string ISO "YYYY-MM-DD" para guardar en el store. */
export function fromDateValue(value: DateValue | null): string | undefined {
  if (!value) return undefined;
  const y = String(value.year).padStart(4, "0");
  const m = String(value.month).padStart(2, "0");
  const d = String(value.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
