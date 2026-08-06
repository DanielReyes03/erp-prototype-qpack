/**
 * Validación de NIT guatemalteco (formato SAT clásico: dígitos + dígito verificador).
 * Algoritmo: cada dígito de la base se multiplica por un peso descendente
 * (empezando en n+1 para el primer dígito), se suman los productos, y el
 * dígito verificador es 11 - (suma mod 11); 11 -> 0, 10 -> 'K'.
 */
export function computeNitCheckDigit(base: string): string {
  const digits = base.split("").map(Number);
  const n = digits.length;
  const sum = digits.reduce((acc, d, i) => acc + d * (n + 1 - i), 0);
  const mod = sum % 11;
  const check = 11 - mod;
  if (check === 11) return "0";
  if (check === 10) return "K";
  return String(check);
}

/** Formatea una base numérica en NIT completo con guion, ej. "1234567" -> "1234567-8". */
export function formatNit(base: string): string {
  return `${base}-${computeNitCheckDigit(base)}`;
}

/** Valida que un NIT con formato "1234567-8" tenga el dígito verificador correcto. */
export function isValidNit(nit: string): boolean {
  const match = /^(\d{4,9})-([\dK])$/.exec(nit.trim().toUpperCase());
  if (!match) return false;
  const [, base, check] = match;
  return computeNitCheckDigit(base) === check;
}
