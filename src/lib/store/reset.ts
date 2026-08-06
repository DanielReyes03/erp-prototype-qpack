const STORAGE_PREFIX = "qpack-";

/**
 * Restablece los datos de demo: limpia todo el estado persistido en localStorage
 * (cada store de dominio usa el prefijo "qpack-") y recarga la app, que vuelve a
 * sembrar los datos desde cero al inicializar los stores.
 */
export function resetDemoData(): void {
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
  window.location.href = "/dashboard";
}
