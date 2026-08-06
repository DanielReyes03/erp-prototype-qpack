"use client";

import { Search } from "lucide-react";
import { SearchField } from "@heroui/react";
import { cn } from "@/lib/cn";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Barra de filtros estándar: búsqueda + filtros por columna a la izquierda, acciones a la derecha. */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  children,
  actions,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-2.5",
        className,
      )}
    >
      <SearchField
        aria-label="Buscar"
        value={searchValue}
        onChange={onSearchChange}
        className="w-full sm:w-64"
      >
        <SearchField.Group className="h-8">
          <SearchField.SearchIcon>
            <Search className="size-3.5 text-slate-500" />
          </SearchField.SearchIcon>
          <SearchField.Input placeholder={searchPlaceholder} className="text-sm" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}

      {actions ? <div className="ms-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
