import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** "inline" para usar dentro de una tabla/panel; "page" para ocupar una página completa. */
  size?: "inline" | "page";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = "inline",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "page" ? "py-20" : "py-12",
        className,
      )}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100">
        <Icon className="size-5 text-slate-500" aria-hidden />
      </div>
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
