"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Save, CheckCircle2, TriangleAlert, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cuentasContables } from "@/lib/mock";
import type { Poliza, TipoPoliza } from "@/types";

interface EditorLinea {
  uid: string;
  cuentaId: string;
  descripcion: string;
  debe: number;
  haber: number;
}

let uid = 0;
function nextUid() {
  uid += 1;
  return `pol-line-${uid}`;
}

function emptyLinea(): EditorLinea {
  return { uid: nextUid(), cuentaId: "", descripcion: "", debe: 0, haber: 0 };
}

export function PolizaEditor({ poliza }: { poliza?: Poliza }) {
  const router = useRouter();
  const isNew = !poliza;
  const hoy = "2026-07-27";

  const [tipo, setTipo] = React.useState<TipoPoliza>(poliza?.tipo ?? "Diario");
  const [concepto, setConcepto] = React.useState(poliza?.concepto ?? "");
  const [estado, setEstado] = React.useState(poliza?.estado ?? "Borrador");
  const [lineas, setLineas] = React.useState<EditorLinea[]>(
    poliza && poliza.lineas.length > 0
      ? poliza.lineas.map((l) => ({ uid: nextUid(), cuentaId: l.cuentaId, descripcion: l.descripcion, debe: l.debe, haber: l.haber }))
      : [emptyLinea(), emptyLinea()]
  );
  const [errores, setErrores] = React.useState<string[]>([]);

  function updateLinea(id: string, patch: Partial<EditorLinea>) {
    setLineas((prev) => prev.map((l) => (l.uid === id ? { ...l, ...patch } : l)));
  }

  function addLinea() {
    setLineas((prev) => [...prev, emptyLinea()]);
  }

  function removeLinea(id: string) {
    setLineas((prev) => (prev.length > 2 ? prev.filter((l) => l.uid !== id) : prev));
  }

  const totalDebe = lineas.reduce((s, l) => s + l.debe, 0);
  const totalHaber = lineas.reduce((s, l) => s + l.haber, 0);
  const diferencia = Math.round((totalDebe - totalHaber) * 100) / 100;
  const cuadrada = diferencia === 0 && totalDebe > 0;

  function validar(requiereCuadre: boolean): boolean {
    const errs: string[] = [];
    if (!concepto.trim()) errs.push("Ingresa el concepto de la poliza.");
    if (lineas.some((l) => !l.cuentaId)) errs.push("Selecciona la cuenta contable en todas las lineas.");
    if (requiereCuadre && !cuadrada) errs.push(`La poliza no cuadra. Diferencia de ${formatCurrency(Math.abs(diferencia))}.`);
    setErrores(errs);
    return errs.length === 0;
  }

  function handleGuardarBorrador() {
    if (!validar(false)) return;
    toast.success("Poliza guardada como borrador", { description: isNew ? "Folio POL-2026-0025 (simulado)." : poliza?.folio });
  }

  function handleContabilizar() {
    if (!validar(true)) return;
    setEstado("Contabilizada");
    toast.success("Poliza contabilizada", { description: "Se registraron los movimientos en el libro mayor (simulado)." });
    router.push("/contabilidad/polizas");
  }

  return (
    <div className="flex flex-col gap-6">
      {errores.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Revisa la poliza antes de continuar</AlertTitle>
          <AlertDescription>
            <ul className="list-inside list-disc">
              {errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>{isNew ? "Nueva poliza" : `Poliza ${poliza?.folio}`}</CardTitle>
            <CardDescription>Encabezado contable</CardDescription>
          </div>
          <StatusBadge status={estado} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de poliza</Label>
            <Select value={tipo} onValueChange={(v) => setTipo((v as TipoPoliza) ?? "Diario")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
                <SelectItem value="Egreso">Egreso</SelectItem>
                <SelectItem value="Diario">Diario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fecha</Label>
            <Input value={formatDate(poliza?.fecha ?? hoy)} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Origen</Label>
            <Input value={poliza?.origenModulo ?? "Manual"} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
            <Label>Concepto</Label>
            <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Describe el motivo de la poliza" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineas de la poliza</CardTitle>
          <CardDescription>Debe y haber deben cuadrar antes de contabilizar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-56">Cuenta contable</TableHead>
                  <TableHead className="min-w-48">Descripcion</TableHead>
                  <TableHead className="w-36 text-right">Debe</TableHead>
                  <TableHead className="w-36 text-right">Haber</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineas.map((l) => (
                  <TableRow key={l.uid}>
                    <TableCell>
                      <Select value={l.cuentaId} onValueChange={(v) => updateLinea(l.uid, { cuentaId: (v as string) ?? "" })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuentasContables.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.codigo} · {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input value={l.descripcion} onChange={(e) => updateLinea(l.uid, { descripcion: e.target.value })} placeholder="Detalle de la linea" />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={l.debe || ""}
                        onChange={(e) => updateLinea(l.uid, { debe: Number(e.target.value) || 0, haber: 0 })}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={l.haber || ""}
                        onChange={(e) => updateLinea(l.uid, { haber: Number(e.target.value) || 0, debe: 0 })}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => removeLinea(l.uid)}>
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="w-fit" onClick={addLinea}>
            <Plus />
            Agregar linea
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full max-w-xs grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Total debe</span>
            <span className="text-right font-medium">{formatCurrency(totalDebe)}</span>
            <span className="text-muted-foreground">Total haber</span>
            <span className="text-right font-medium">{formatCurrency(totalHaber)}</span>
            <span className="pt-1.5 text-base font-semibold">Diferencia</span>
            <span className={`pt-1.5 text-right text-base font-semibold ${diferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(diferencia)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={cuadrada ? "default" : "outline"} className={cuadrada ? "" : "border-amber-500/40 text-amber-700 dark:text-amber-400"}>
              {cuadrada ? <CheckCircle2 className="size-3" /> : <Scale className="size-3" />}
              {cuadrada ? "Poliza cuadrada" : "Poliza sin cuadrar"}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleGuardarBorrador}>
                <Save />
                Guardar borrador
              </Button>
              <Button onClick={handleContabilizar} disabled={!cuadrada}>
                <CheckCircle2 />
                Contabilizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
