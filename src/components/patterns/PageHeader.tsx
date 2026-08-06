import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Encabezado estándar de página: título + descripción a la izquierda, acciones a la derecha. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
