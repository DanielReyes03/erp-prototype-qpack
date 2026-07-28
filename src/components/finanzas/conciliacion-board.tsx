"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, Scale, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { cuentasBancarias, movimientosBancarios as movimientosIniciales } from "@/lib/mock";
import type { MovimientoBancario } from "@/types";
import { cn } from "@/lib/utils";

export function ConciliacionBoard() {
  const [cuentaId, setCuentaId] = React.useState(cuentasBancarias[0].id);
  const [movimientos, setMovimientos] = React.useState<MovimientoBancario[]>(() => movimientosIniciales.map((m) => ({ ...m })));
  const [seleccionBanco, setSeleccionBanco] = React.useState<Set<string>>(new Set());
  const [seleccionSistema, setSeleccionSistema] = React.useState<Set<string>>(new Set());
  const [mostrarConciliados, setMostrarConciliados] = React.useState(false);

  const cuenta = cuentasBancarias.find((c) => c.id === cuentaId)!;

  const delCuenta = movimientos.filter((m) => m.cuentaBancariaId === cuentaId);
  const banco = delCuenta.filter((m) => m.origen === "Banco" && (mostrarConciliados || !m.conciliado));
  const sistema = delCuenta.filter((m) => m.origen === "Sistema" && (mostrarConciliados || !m.conciliado));

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSet(next);
  }

  const totalBanco = [...seleccionBanco].reduce((s, id) => s + (movimientos.find((m) => m.id === id)?.monto ?? 0), 0);
  const totalSistema = [...seleccionSistema].reduce((s, id) => s + (movimientos.find((m) => m.id === id)?.monto ?? 0), 0);
  const diferencia = Math.round((totalBanco - totalSistema) * 100) / 100;
  const puedeConciliar = seleccionBanco.size > 0 && seleccionSistema.size > 0 && diferencia === 0;

  function handleConciliar() {
    setMovimientos((prev) =>
      prev.map((m) => (seleccionBanco.has(m.id) || seleccionSistema.has(m.id) ? { ...m, conciliado: true } : m))
    );
    toast.success("Movimientos conciliados", {
      description: `${seleccionBanco.size + seleccionSistema.size} movimientos marcados como conciliados por ${formatCurrency(totalBanco, cuenta.moneda)}.`,
    });
    setSeleccionBanco(new Set());
    setSeleccionSistema(new Set());
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Conciliacion bancaria</CardTitle>
            <CardDescription>Selecciona movimientos del banco y del sistema por el mismo monto para conciliar</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="mostrar-conciliados" checked={mostrarConciliados} onCheckedChange={setMostrarConciliados} />
              <Label htmlFor="mostrar-conciliados" className="text-sm text-muted-foreground">Mostrar conciliados</Label>
            </div>
            <Select value={cuentaId} onValueChange={(v) => { setCuentaId((v as string) ?? cuentaId); setSeleccionBanco(new Set()); setSeleccionSistema(new Set()); }}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cuentasBancarias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.banco} · {c.numeroCuenta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3.5">
            <p className="text-xs text-muted-foreground">Saldo contable</p>
            <p className="text-lg font-semibold">{formatCurrency(cuenta.saldoContable, cuenta.moneda)}</p>
          </div>
          <div className="rounded-lg border p-3.5">
            <p className="text-xs text-muted-foreground">Saldo segun banco</p>
            <p className="text-lg font-semibold">{formatCurrency(cuenta.saldoBanco, cuenta.moneda)}</p>
          </div>
          <div className="rounded-lg border p-3.5">
            <p className="text-xs text-muted-foreground">Diferencia</p>
            <p className="text-lg font-semibold">{formatCurrency(cuenta.saldoBanco - cuenta.saldoContable, cuenta.moneda)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MovementPanel
          title="Movimientos del banco"
          description="Estado de cuenta bancario"
          movimientos={banco}
          seleccion={seleccionBanco}
          onToggle={(id) => toggle(seleccionBanco, setSeleccionBanco, id)}
          moneda={cuenta.moneda}
        />
        <MovementPanel
          title="Movimientos del sistema"
          description="Registros contables en QPack ERP"
          movimientos={sistema}
          seleccion={seleccionSistema}
          onToggle={(id) => toggle(seleccionSistema, setSeleccionSistema, id)}
          moneda={cuenta.moneda}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              Banco seleccionado: <span className="font-medium">{formatCurrency(totalBanco, cuenta.moneda)}</span> ({seleccionBanco.size})
            </span>
            <span>
              Sistema seleccionado: <span className="font-medium">{formatCurrency(totalSistema, cuenta.moneda)}</span> ({seleccionSistema.size})
            </span>
            {seleccionBanco.size > 0 && seleccionSistema.size > 0 && (
              <Badge variant={diferencia === 0 ? "default" : "outline"} className={cn(diferencia !== 0 && "border-amber-500/40 text-amber-700 dark:text-amber-400")}>
                {diferencia === 0 ? <CheckCircle2 className="size-3" /> : <TriangleAlert className="size-3" />}
                {diferencia === 0 ? "Los montos coinciden" : `Diferencia de ${formatCurrency(Math.abs(diferencia), cuenta.moneda)}`}
              </Badge>
            )}
          </div>
          <Button disabled={!puedeConciliar} onClick={handleConciliar}>
            <Scale />
            Conciliar seleccionados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MovementPanel({
  title,
  description,
  movimientos,
  seleccion,
  onToggle,
  moneda,
}: {
  title: string;
  description: string;
  movimientos: MovimientoBancario[];
  seleccion: Set<string>;
  onToggle: (id: string) => void;
  moneda: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {movimientos.length === 0 ? (
          <EmptyState title="Sin movimientos" description="No hay movimientos pendientes de conciliar." />
        ) : (
          <div className="flex max-h-[28rem] flex-col divide-y overflow-y-auto">
            {movimientos.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 py-2.5 px-1 hover:bg-muted/50",
                  m.conciliado && "opacity-50"
                )}
              >
                <Checkbox
                  checked={seleccion.has(m.id)}
                  onCheckedChange={() => onToggle(m.id)}
                  disabled={m.conciliado}
                  className="mt-0.5"
                />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.descripcion}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.fecha)} · {m.referencia}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cn("text-sm font-medium", m.tipo === "Abono" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {m.tipo === "Abono" ? "+" : "-"}
                      {formatCurrency(m.monto, moneda as "GTQ" | "USD")}
                    </span>
                    {m.conciliado && <Badge variant="outline" className="text-[10px]">Conciliado</Badge>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
