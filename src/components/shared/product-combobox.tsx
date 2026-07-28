"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { productos } from "@/lib/mock";

interface ProductOption {
  value: string;
  label: string;
  sku: string;
}

const items: ProductOption[] = productos
  .filter((p) => p.activo)
  .map((p) => ({ value: p.id, label: p.nombre, sku: p.sku }));

export function ProductCombobox({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (productoId: string) => void;
  className?: string;
}) {
  const selected = items.find((i) => i.value === value) ?? null;

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(item) => onChange(item ? item.value : "")}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxInput placeholder="Buscar producto por nombre o SKU..." className={className} />
      <ComboboxContent>
        <ComboboxEmpty>Sin productos que coincidan.</ComboboxEmpty>
        <ComboboxList>
          {(item: ProductOption) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.sku}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
