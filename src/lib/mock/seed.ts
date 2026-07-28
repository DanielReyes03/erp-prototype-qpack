// Utilidades deterministicas para generar datos mock reproducibles
// (sin Math.random para evitar diferencias entre render de servidor y cliente).

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function seededInt(seed: string, min: number, max: number): number {
  const h = hashString(seed);
  return min + (h % (max - min + 1));
}

export function seededFloat(seed: string, min: number, max: number, decimals = 2): number {
  const h = hashString(seed);
  const raw = min + (h % 100000) / 100000 * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(raw * factor) / factor;
}

export function seededPick<T>(seed: string, options: readonly T[]): T {
  const idx = hashString(seed) % options.length;
  return options[idx];
}

export function seededBool(seed: string, trueChancePct = 50): boolean {
  return seededInt(seed, 0, 99) < trueChancePct;
}

export function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const HOY = "2026-07-27";
