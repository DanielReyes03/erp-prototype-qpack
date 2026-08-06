import { clsx, type ClassValue } from "clsx";

/**
 * Combina clases condicionalmente. Usar esta utilidad (en vez de `cn` de @heroui/react)
 * en cualquier archivo que pueda renderizarse en el servidor: @heroui/react está marcado
 * "client-only" y romper esa frontera falla el build.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
