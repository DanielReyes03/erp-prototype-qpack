import { Building2 } from "lucide-react";
import { empresaPorDefecto } from "@/lib/mock";

export function CompanySwitcher() {
  return (
    <div className="flex h-9 max-w-[220px] items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 dark:bg-input/30">
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm font-medium">{empresaPorDefecto.nombreComercial}</span>
    </div>
  );
}
