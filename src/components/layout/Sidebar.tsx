"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, ChevronDown, Boxes } from "lucide-react";
import { cn, Tooltip, Button } from "@heroui/react";
import { NAV_GROUPS } from "@/lib/nav";
import { useUiStore } from "@/lib/store/ui";

function groupContainsPath(group: (typeof NAV_GROUPS)[number], pathname: string): boolean {
  return group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export function Sidebar() {
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  const activeGroup = NAV_GROUPS.find((g) => groupContainsPath(g, pathname));
  const [expanded, setExpanded] = useState<string | null>(activeGroup?.label ?? null);

  useEffect(() => {
    if (activeGroup) setExpanded(activeGroup.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-150 ease-out",
        isCollapsed ? "w-16" : "w-[260px]",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-200 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
          <Boxes className="size-4.5" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-900">QPack, S.A.</p>
            <p className="truncate text-[11px] text-slate-500">ERP Prototipo</p>
          </div>
        )}
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto py-2"
        data-scrollbar="thin"
      >
        {!isCollapsed && (
          <p className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
            Módulos
          </p>
        )}
        <ul className="flex flex-col gap-0.5 px-2">
          {NAV_GROUPS.map((group) => {
            const isSingle = group.items.length === 1;
            const GroupIcon = group.icon;
            const isGroupActive = groupContainsPath(group, pathname);
            const isOpen = expanded === group.label;

            if (isSingle) {
              const item = group.items[0];
              const Icon = item.icon ?? GroupIcon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const link = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                    isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
              return (
                <li key={group.label}>
                  {isCollapsed ? (
                    <Tooltip delay={200}>
                      {link}
                      <Tooltip.Content placement="right">
                        <p>{item.label}</p>
                      </Tooltip.Content>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            }

            const trigger = (
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : group.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  isGroupActive && !isOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed && "justify-center px-0",
                )}
                aria-expanded={isOpen}
              >
                <GroupIcon className="size-4 shrink-0" aria-hidden />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate text-left">{group.label}</span>
                    <ChevronDown
                      className={cn("size-3.5 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
                    />
                  </>
                )}
              </button>
            );

            return (
              <li key={group.label}>
                {isCollapsed ? (
                  <Tooltip delay={200}>
                    {trigger}
                    <Tooltip.Content placement="right">
                      <p>{group.label}</p>
                    </Tooltip.Content>
                  </Tooltip>
                ) : (
                  trigger
                )}
                {!isCollapsed && isOpen ? (
                  <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 pl-3.5 ms-4">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block truncate rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900",
                              isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-2">
        <Button
          isIconOnly={isCollapsed}
          fullWidth={!isCollapsed}
          variant="ghost"
          className="justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          onPress={toggleSidebar}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!isCollapsed && <span>Colapsar</span>}
        </Button>
      </div>
    </aside>
  );
}
