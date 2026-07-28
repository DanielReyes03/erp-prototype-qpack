"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { allNavItems } from "@/lib/nav-config";
import { clientes, productos, pedidos, cotizaciones } from "@/lib/mock";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-full max-w-sm justify-start gap-2 text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Buscar clientes, pedidos, productos...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          Ctrl K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Buscador global" description="Busca en todos los modulos del ERP">
        <Command>
          <CommandInput placeholder="Escribe para buscar en todo el sistema..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup heading="Modulos">
              {allNavItems.map((item) => (
                <CommandItem key={item.href} value={`${item.groupTitle} ${item.title}`} onSelect={() => go(item.href)}>
                  <item.icon />
                  <span>{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{item.groupTitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Clientes">
              {clientes.slice(0, 6).map((c) => (
                <CommandItem key={c.id} value={`cliente ${c.nombreComercial} ${c.codigo}`} onSelect={() => go(`/crm/clientes`)}>
                  <span>{c.nombreComercial}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.codigo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Productos">
              {productos.slice(0, 6).map((p) => (
                <CommandItem key={p.id} value={`producto ${p.nombre} ${p.sku}`} onSelect={() => go(`/catalogos/productos`)}>
                  <span>{p.nombre}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{p.sku}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Pedidos y cotizaciones">
              {pedidos.slice(0, 4).map((p) => (
                <CommandItem key={p.id} value={`pedido ${p.folio}`} onSelect={() => go(`/ventas/pedidos`)}>
                  <span>{p.folio}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Pedido</span>
                </CommandItem>
              ))}
              {cotizaciones.slice(0, 4).map((c) => (
                <CommandItem key={c.id} value={`cotizacion ${c.folio}`} onSelect={() => go(`/ventas/cotizaciones/${c.id}`)}>
                  <span>{c.folio}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Cotizacion</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
