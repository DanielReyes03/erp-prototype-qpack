"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";

function findLabel(href: string): { groupLabel: string; itemLabel: string } | null {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.href === href);
    if (item) return { groupLabel: group.label, itemLabel: item.label };
  }
  return null;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const match = findLabel(pathname);

  if (!match) {
    return <span className="text-sm font-medium text-foreground">QPack ERP</span>;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <span className="text-slate-500">{match.groupLabel}</span>
      <ChevronRight className="size-3.5 text-slate-500" aria-hidden />
      <Link href={pathname} className="font-medium text-foreground hover:text-blue-700">
        {match.itemLabel}
      </Link>
    </nav>
  );
}
