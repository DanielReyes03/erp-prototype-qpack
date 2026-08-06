"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Boxes } from "lucide-react";
import { cn, Tooltip, Button } from "@heroui/react";
import { NAV_GROUPS } from "@/lib/nav";
import { useUiStore } from "@/lib/store/ui";

export function Sidebar() {
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-navy-900 text-white transition-[width] duration-150 ease-out",
        isCollapsed ? "w-16" : "w-[260px]",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <Boxes className="size-6 shrink-0 text-blue-500" />
        {!isCollapsed && (
          <span className="truncate text-sm font-semibold tracking-wide text-white">
            QPack ERP
          </span>
        )}
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto py-3"
        data-scrollbar="thin"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1 px-2">
            {!isCollapsed && (
              <p className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon ?? group.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                      isActive && "bg-blue-700 text-white hover:bg-blue-700",
                      isCollapsed && "justify-center px-0 py-2",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                return isCollapsed ? (
                  <li key={item.href}>
                    <Tooltip delay={200}>
                      {link}
                      <Tooltip.Content placement="right">
                        <p>{item.label}</p>
                      </Tooltip.Content>
                    </Tooltip>
                  </li>
                ) : (
                  <li key={item.href}>{link}</li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2">
        <Button
          isIconOnly={isCollapsed}
          fullWidth={!isCollapsed}
          variant="ghost"
          className="justify-center text-white/70 hover:bg-white/10 hover:text-white"
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
