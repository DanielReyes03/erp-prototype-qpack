"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Alerta, NivelAlerta } from "@/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

const nivelConfig: Record<NivelAlerta, { icon: typeof Info; className: string; label: string }> = {
  critico: { icon: OctagonAlert, className: "text-red-600 dark:text-red-400", label: "Critico" },
  advertencia: { icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400", label: "Advertencia" },
  info: { icon: Info, className: "text-blue-600 dark:text-blue-400", label: "Info" },
};

export function AlertsTable({ alertas }: { alertas: Alerta[] }) {
  const router = useRouter();

  if (alertas.length === 0) {
    return <EmptyState title="Sin alertas activas" description="No hay pendientes criticos en este momento." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10"></TableHead>
            <TableHead>Alerta</TableHead>
            <TableHead className="hidden md:table-cell">Modulo</TableHead>
            <TableHead className="hidden sm:table-cell">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alertas.map((a) => {
            const cfg = nivelConfig[a.nivel];
            return (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(a.href)}>
                <TableCell>
                  <cfg.icon className={cn("size-4", cfg.className)} />
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.detalle}</p>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{a.modulo}</TableCell>
                <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground sm:table-cell">
                  {formatDate(a.fecha)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
