import type { LucideIcon } from "lucide-react";
import { Compass } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";

export interface SearchItem {
  id: string;
  type: "nav" | "cliente" | "producto" | "documento";
  title: string;
  subtitle?: string;
  href: string;
  icon?: LucideIcon;
}

function navSearchItems(): SearchItem[] {
  return NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      id: `nav-${item.href}`,
      type: "nav" as const,
      title: item.label,
      subtitle: group.label,
      href: item.href,
      icon: item.icon ?? group.icon ?? Compass,
    })),
  );
}

/**
 * Índice de búsqueda global del command palette (⌘K). Combina navegación estática
 * con entidades de negocio. Cada fase que agrega un store de dominio (clientes,
 * productos, documentos) extiende este hook con sus propios ítems buscables.
 */
export function useSearchIndex(): SearchItem[] {
  return navSearchItems();
}
