"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { estadoResultadosActual, balanceGeneralActual } from "@/lib/mock";
import type { EstadoFinancieroLinea } from "@/types";
import { cn } from "@/lib/utils";

function EstadoTable({ lineas }: { lineas: EstadoFinancieroLinea[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="p-3 font-medium">Concepto</th>
            <th className="p-3 text-right font-medium">Periodo actual</th>
            <th className="p-3 text-right font-medium">Periodo anterior</th>
            <th className="p-3 text-right font-medium">Variacion</th>
          </tr>
        </thead>
        <tbody>
          {lineas.map((l, i) => {
            const variacion = l.montoAnterior !== 0 ? ((l.montoActual - l.montoAnterior) / Math.abs(l.montoAnterior)) * 100 : 0;
            return (
              <tr key={i} className={cn("border-b last:border-0", l.esTotal && "bg-muted/30")}>
                <td className={cn("p-3", l.esTotal ? "font-semibold" : "text-muted-foreground", l.nivel > 0 && "pl-8")}>{l.concepto}</td>
                <td className={cn("p-3 text-right tabular-nums", l.esTotal && "font-semibold")}>{formatCurrency(l.montoActual)}</td>
                <td className="p-3 text-right tabular-nums text-muted-foreground">{formatCurrency(l.montoAnterior)}</td>
                <td className={cn("p-3 text-right tabular-nums", variacion >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                  {variacion >= 0 ? "+" : ""}
                  {variacion.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EstadosFinancierosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estados financieros"
        description="Estado de resultados y balance general comparativo."
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.info("Exportando a PDF (simulado)")}>
            <Download />
            Exportar PDF
          </Button>
        }
      />

      <Tabs defaultValue="resultados">
        <TabsList>
          <TabsTrigger value="resultados">Estado de resultados</TabsTrigger>
          <TabsTrigger value="balance">Balance general</TabsTrigger>
        </TabsList>
        <TabsContent value="resultados" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de resultados</CardTitle>
              <CardDescription>Julio 2026 vs. Julio 2025, en Quetzales</CardDescription>
            </CardHeader>
            <CardContent>
              <EstadoTable lineas={estadoResultadosActual} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance general</CardTitle>
              <CardDescription>Al 27 de julio de 2026, comparativo con el periodo anterior</CardDescription>
            </CardHeader>
            <CardContent>
              <EstadoTable lineas={balanceGeneralActual} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
