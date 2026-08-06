"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Modal, SearchField, Kbd, cn } from "@heroui/react";
import { useUiStore } from "@/lib/store/ui";
import { useSearchIndex } from "@/lib/search";

export function CommandPalette() {
  const isOpen = useUiStore((s) => s.isCommandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const index = useSearchIndex();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [index, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results.length, query]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) handleSelect(item.href);
    }
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={setOpen} variant="opaque">
      <Modal.Container placement="top" size="lg" className="pt-24">
        <Modal.Dialog aria-label="Buscador global" className="overflow-hidden p-0 sm:max-w-[560px]">
          <div className="border-b border-slate-200 p-3">
            <SearchField
              autoFocus
              aria-label="Buscar"
              value={query}
              onChange={setQuery}
              onKeyDown={handleKeyDown}
            >
              <SearchField.Group className="border-0 shadow-none">
                <SearchField.SearchIcon>
                  <Search className="size-4 text-slate-500" />
                </SearchField.SearchIcon>
                <SearchField.Input placeholder="Buscar clientes, productos, documentos o ir a una pantalla…" />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>

          <div
            role="listbox"
            aria-label="Resultados de búsqueda"
            className="max-h-[360px] overflow-y-auto p-2"
            data-scrollbar="thin"
          >
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                Sin resultados para &ldquo;{query}&rdquo;
              </p>
            ) : (
              results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => handleSelect(item.href)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left",
                      i === activeIndex ? "bg-blue-50" : "hover:bg-slate-50",
                    )}
                  >
                    {Icon ? <Icon className="size-4 shrink-0 text-slate-500" /> : null}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-slate-900">{item.title}</span>
                      {item.subtitle ? (
                        <span className="truncate text-xs text-slate-500">{item.subtitle}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>Navegación con las flechas, Enter para ir</span>
            <Kbd variant="light">
              <Kbd.Content>Esc</Kbd.Content>
            </Kbd>
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
