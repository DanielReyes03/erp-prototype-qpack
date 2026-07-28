"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AppBreadcrumb } from "./app-breadcrumb";
import { CompanySwitcher } from "./company-switcher";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <AppBreadcrumb />
      <div className="flex flex-1 items-center justify-end gap-2">
        <GlobalSearch />
        <div className="hidden items-center gap-2 lg:flex">
          <CompanySwitcher />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Notificaciones"
          onClick={() => toast.info("Sin notificaciones nuevas", { description: "Este es un prototipo sin backend." })}
        >
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        <Separator orientation="vertical" className="h-5" />
        <UserMenu />
      </div>
    </header>
  );
}
