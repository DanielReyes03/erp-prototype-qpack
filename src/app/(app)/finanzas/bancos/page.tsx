"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Scale, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMockLoading } from "@/hooks/use-mock-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cuentasBancarias, movimientosBancarios } from "@/lib/mock";

export default function BancosPage() {
  const loading = useMockLoading();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bancos"
        description="Cuentas bancarias de la compania y su saldo contable vs. saldo bancario."
        actions={
          <Button size="sm" onClick={() => router.push("/finanzas/conciliacion")}>
            <Scale />
            Ir a conciliacion
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
          : cuentasBancarias.map((cuenta) => {
              const diferencia = cuenta.saldoBanco - cuenta.saldoContable;
              const pendientes = movimientosBancarios.filter((m) => m.cuentaBancariaId === cuenta.id && !m.conciliado).length;
              return (
                <Card key={cuenta.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{cuenta.banco}</CardTitle>
                    <CardDescription>{cuenta.nombreCuenta} · {cuenta.numeroCuenta}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Saldo contable</span>
                      <span className="text-right font-medium">{formatCurrency(cuenta.saldoContable, cuenta.moneda)}</span>
                      <span className="text-muted-foreground">Saldo bancario</span>
                      <span className="text-right font-medium">{formatCurrency(cuenta.saldoBanco, cuenta.moneda)}</span>
                      <span className="text-muted-foreground">Diferencia</span>
                      <span className={`text-right font-medium ${diferencia === 0 ? "" : "text-amber-600 dark:text-amber-400"}`}>
                        {formatCurrency(diferencia, cuenta.moneda)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{pendientes} movimientos sin conciliar</Badge>
                      <Button variant="ghost" size="sm" onClick={() => router.push("/finanzas/conciliacion")}>
                        <Eye />
                        Conciliar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos recientes</CardTitle>
          <CardDescription>Ultimos movimientos bancarios registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Conciliado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosBancarios.slice(0, 10).map((m) => {
                  const cuenta = cuentasBancarias.find((c) => c.id === m.cuentaBancariaId);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{cuenta?.banco}</TableCell>
                      <TableCell className="text-sm">{m.descripcion}</TableCell>
                      <TableCell><Badge variant="outline">{m.origen}</Badge></TableCell>
                      <TableCell className={`text-right text-sm font-medium ${m.tipo === "Abono" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {m.tipo === "Abono" ? "+" : "-"}
                        {formatCurrency(m.monto, cuenta?.moneda)}
                      </TableCell>
                      <TableCell>{m.conciliado ? <Badge>Si</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
