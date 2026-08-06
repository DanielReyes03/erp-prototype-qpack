"use client";

import { cn } from "@heroui/react";
import { useUiStore } from "@/lib/store/ui";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { ToastRegion } from "./ToastRegion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const isCollapsed = useUiStore((s) => s.isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          "min-h-screen pt-14 transition-[padding] duration-150 ease-out",
          isCollapsed ? "pl-16" : "pl-[260px]",
        )}
      >
        <div className="mx-auto max-w-[1600px] p-6">{children}</div>
      </main>
      <CommandPalette />
      <ToastRegion />
    </div>
  );
}
