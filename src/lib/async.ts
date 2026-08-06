/** Simula latencia de red para que spinners, estados de carga y toasts se sientan reales. */
export function sleep(minMs = 250, maxMs = 600): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Genera IDs únicos para entidades creadas en tiempo de ejecución, ej. "cli-a1b2c3d4".
 * Usa un sufijo aleatorio (no un contador) para no colisionar con IDs de la semilla
 * tras recargar la página, ya que el store persiste en localStorage.
 */
export function nextId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}
