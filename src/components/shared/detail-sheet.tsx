"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  headerExtra,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="pr-6">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
          {headerExtra}
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-6 p-4">{children}</div>
        </ScrollArea>
        {footer && <div className="border-t p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="rounded-lg border bg-card">{children}</div>
    </div>
  );
}

export interface DefinitionItem {
  label: string;
  value: ReactNode;
  full?: boolean;
}

export function DefinitionList({ items }: { items: DefinitionItem[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-3.5">
      {items.map((item, i) => (
        <div key={i} className={item.full ? "col-span-2" : "col-span-1"}>
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
