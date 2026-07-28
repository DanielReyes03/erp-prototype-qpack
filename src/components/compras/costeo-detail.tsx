"use client";

import * as React from "react";
import { DollarSign, Scale, Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DefinitionList } from "@/components/shared/detail-sheet";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { embarques, gastosEmbarque, navieras, productos } from "@/lib/mock";
import type { CosteoImportacion, MetodoProrrateo } from "@/types";

const metodos: { value: MetodoProrrateo; label: string; icon: typeof DollarSign; description: string }[] = [
  { value: "valor", label: "Por valor", icon: DollarSign, description: "Prorratea segun el valor FOB de cada producto" },
  { value: "peso", label: "Por peso", icon: Scale, description: "Prorratea segun el peso en kg de cada producto" },
  { value: "volumen", label: "Por volumen", icon: Box, description: "Prorratea segun el volumen en m3 de cada producto" },
];

export function CosteoDetail({ costeo }: { costeo: CosteoImportacion }) {
  const [metodo, setMetodo] = React.useState<MetodoProrrateo>(costeo.metodoProrrateo);
  const embarque = embarques.find((e) => e.id === costeo.embarqueId);
  const gastos = gastosEmbarque.filter((g) => g.embarqueId === costeo.embarqueId);

  const totalGastoEstimado = gastos.reduce((s, g) => s + g.montoEstimadoGTQ, 0);
  const totalGastoReal = gastos.reduce((s, g) => s + g.montoRealGTQ, 0);
  const totalValorFob = costeo.items.reduce((s, i) => s + i.valorFobGTQ, 0) || 1;
  const totalPeso = costeo.items.reduce((s, i) => s + i.pesoKg, 0) || 1;
  const totalVolumen = costeo.items.reduce((s, i) => s + i.volumenM3, 0) || 1;

  function shareOf(item: CosteoImportacion["items"][number]): number {
    if (metodo === "valor") return item.valorFobGTQ / totalValorFob;
    if (metodo === "peso") return item.pesoKg / totalPeso;
    return item.volumenM3 / totalVolumen;
  }

  const resultado = costeo.items.map((item) => {
    const share = shareOf(item);
    const costoUnitarioEstimado = (item.valorFobGTQ + totalGastoEstimado * share) / item.cantidad;
    const costoUnitarioReal = (item.valorFobGTQ + totalGastoReal * share) / item.cantidad;
    const variacionPct = costoUnitarioEstimado > 0 ? ((costoUnitarioReal - costoUnitarioEstimado) / costoUnitarioEstimado) * 100 : 0;
    return { ...item, costoUnitarioEstimado, costoUnitarioReal, variacionPct };
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Costeo de importacion · {embarque?.folio}</CardTitle>
            <CardDescription>{navieras.find((n) => n.id === embarque?.navieraId)?.nombre}</CardDescription>
          </div>
          <StatusBadge status={costeo.estado} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <DefinitionList items={[{ label: "Gastos estimados", value: formatCurrency(totalGastoEstimado) }]} />
          <DefinitionList items={[{ label: "Gastos reales", value: formatCurrency(totalGastoReal) }]} />
          <DefinitionList items={[{ label: "Productos costeados", value: String(costeo.items.length) }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos del embarque</CardTitle>
          <CardDescription>Flete, seguro, DAI, IVA, agente aduanero y transporte local</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="text-right">Estimado</TableHead>
                  <TableHead className="text-right">Real</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.categoria}</TableCell>
                    <TableCell className="text-muted-foreground">{g.descripcion}</TableCell>
                    <TableCell className="text-right">{formatCurrency(g.montoEstimadoGTQ)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(g.montoRealGTQ)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totalGastoEstimado)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totalGastoReal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metodo de prorrateo</CardTitle>
          <CardDescription>Selecciona como se distribuyen los gastos entre los productos del embarque</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {metodos.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetodo(m.value)}
              className={cn(
                "flex flex-1 items-start gap-3 rounded-lg border p-3.5 text-left transition-colors",
                metodo === m.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              )}
            >
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", metodo === m.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                <m.icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Costo unitario resultante</CardTitle>
          <CardDescription>Comparacion de costo estimado vs. real por producto, prorrateado {metodos.find((m) => m.value === metodo)?.label.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Valor FOB</TableHead>
                  <TableHead className="text-right">Costo unit. estimado</TableHead>
                  <TableHead className="text-right">Costo unit. real</TableHead>
                  <TableHead className="text-right">Variacion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.map((r) => (
                  <TableRow key={r.productoId}>
                    <TableCell>
                      <p className="text-sm font-medium">{productos.find((p) => p.id === r.productoId)?.nombre ?? r.productoId}</p>
                      <p className="text-xs text-muted-foreground">{productos.find((p) => p.id === r.productoId)?.sku}</p>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(r.cantidad)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.valorFobGTQ)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.costoUnitarioEstimado)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(r.costoUnitarioReal)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          r.variacionPct > 5
                            ? "border-red-500/30 text-red-700 dark:text-red-400"
                            : r.variacionPct < -5
                              ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                              : "border-muted-foreground/30 text-muted-foreground"
                        }
                      >
                        {r.variacionPct > 0 ? "+" : ""}
                        {r.variacionPct.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setMetodo(costeo.metodoProrrateo)}>
          Restablecer metodo original
        </Button>
      </div>
    </div>
  );
}
