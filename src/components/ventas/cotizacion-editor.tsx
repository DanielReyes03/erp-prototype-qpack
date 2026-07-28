"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send, ArrowRightLeft, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductCombobox } from "@/components/shared/product-combobox";
import { formatCurrency, formatDate, addDays } from "@/lib/format";
import { clientes, vendedores, productos, unidadesMedida } from "@/lib/mock";
import type { Cotizacion, EstadoCotizacion } from "@/types";

interface EditorLine {
  uid: string;
  productoId: string;
  unidadMedidaId: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
}

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `line-${uidCounter}`;
}

function lineFromExisting(l: Cotizacion["lineas"][number]): EditorLine {
  return {
    uid: nextUid(),
    productoId: l.productoId,
    unidadMedidaId: l.unidadMedidaId,
    cantidad: l.cantidad,
    precioUnitario: l.precioUnitario,
    descuentoPct: l.descuentoPct,
  };
}

function emptyLine(): EditorLine {
  return { uid: nextUid(), productoId: "", unidadMedidaId: "", cantidad: 1, precioUnitario: 0, descuentoPct: 0 };
}

export function CotizacionEditor({ cotizacion }: { cotizacion?: Cotizacion }) {
  const router = useRouter();
  const isNew = !cotizacion;
  const hoy = "2026-07-27";

  const [clienteId, setClienteId] = React.useState(cotizacion?.clienteId ?? "");
  const [moneda, setMoneda] = React.useState<"GTQ" | "USD">(cotizacion?.moneda ?? "GTQ");
  const [condicionPago, setCondicionPago] = React.useState(cotizacion?.condicionPago ?? "Contado");
  const [vigenciaDias, setVigenciaDias] = React.useState(cotizacion?.vigenciaDias ?? 15);
  const [notas, setNotas] = React.useState(cotizacion?.notas ?? "");
  const [estado, setEstado] = React.useState<EstadoCotizacion>(cotizacion?.estado ?? "Borrador");
  const [lineas, setLineas] = React.useState<EditorLine[]>(
    cotizacion && cotizacion.lineas.length > 0 ? cotizacion.lineas.map(lineFromExisting) : [emptyLine()]
  );
  const [errores, setErrores] = React.useState<string[]>([]);

  const cliente = clientes.find((c) => c.id === clienteId);
  const vendedor = vendedores.find((v) => v.id === cliente?.vendedorId);
  const fechaEmision = cotizacion?.fechaEmision ?? hoy;
  const fechaVencimiento = addDays(fechaEmision, vigenciaDias);

  function updateLine(uid: string, patch: Partial<EditorLine>) {
    setLineas((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  }

  function handleProductoChange(uid: string, productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    updateLine(uid, {
      productoId,
      unidadMedidaId: producto?.unidadMedidaId ?? "",
      precioUnitario: producto?.precioListaGTQ ?? 0,
    });
  }

  function addLine() {
    setLineas((prev) => [...prev, emptyLine()]);
  }

  function removeLine(uid: string) {
    setLineas((prev) => (prev.length > 1 ? prev.filter((l) => l.uid !== uid) : prev));
  }

  const computedLines = lineas.map((l) => {
    const producto = productos.find((p) => p.id === l.productoId);
    const bruto = l.cantidad * l.precioUnitario;
    const descuentoMonto = bruto * (l.descuentoPct / 100);
    const totalLinea = bruto - descuentoMonto;
    const precioNeto = l.precioUnitario * (1 - l.descuentoPct / 100);
    const margenPct = precioNeto > 0 && producto ? ((precioNeto - producto.costoPromedioGTQ) / precioNeto) * 100 : 0;
    return { ...l, producto, bruto, descuentoMonto, totalLinea, margenPct };
  });

  const subtotalConIva = computedLines.reduce((s, l) => s + l.totalLinea, 0);
  const ivaMonto = subtotalConIva - subtotalConIva / 1.12;
  const subtotalSinIva = subtotalConIva - ivaMonto;
  const descuentoTotal = computedLines.reduce((s, l) => s + l.descuentoMonto, 0);

  function validar(): boolean {
    const errs: string[] = [];
    if (!clienteId) errs.push("Selecciona un cliente para la cotizacion.");
    const lineasValidas = computedLines.filter((l) => l.productoId && l.cantidad > 0);
    if (lineasValidas.length === 0) errs.push("Agrega al menos una linea con producto y cantidad mayor a cero.");
    setErrores(errs);
    return errs.length === 0;
  }

  function handleGuardar() {
    if (!validar()) return;
    toast.success("Cotizacion guardada como borrador", {
      description: isNew ? "Se genero un nuevo folio COT-2026-0046 (simulado)." : `Folio ${cotizacion?.folio} actualizado.`,
    });
  }

  function handleEnviar() {
    if (!validar()) return;
    setEstado("Enviada");
    toast.success("Cotizacion enviada al cliente", {
      description: `Se envio un correo a ${cliente?.correo ?? "el contacto del cliente"} (simulado).`,
    });
  }

  function handleConvertir() {
    if (!validar()) return;
    toast.success("Pedido creado a partir de la cotizacion", {
      description: "Se genero el pedido PED-2026-0061 (simulado).",
    });
    router.push("/ventas/pedidos");
  }

  return (
    <div className="flex flex-col gap-6">
      {errores.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Revisa la informacion de la cotizacion</AlertTitle>
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
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{isNew ? "Nueva cotizacion" : `Cotizacion ${cotizacion?.folio}`}</CardTitle>
            <CardDescription>Encabezado, cliente y condiciones comerciales</CardDescription>
          </div>
          <StatusBadge status={estado} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={(v) => setClienteId((v as string) ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombreComercial} · {c.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Vendedor</Label>
            <Input value={vendedor?.nombre ?? "Se asigna segun cliente"} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Moneda</Label>
            <Select value={moneda} onValueChange={(v) => setMoneda((v as "GTQ" | "USD") ?? "GTQ")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTQ">Quetzales (GTQ)</SelectItem>
                <SelectItem value="USD">Dolares (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Condicion de pago</Label>
            <Select value={condicionPago} onValueChange={(v) => setCondicionPago((v as string) ?? "Contado")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contado">Contado</SelectItem>
                <SelectItem value="15 dias">15 dias</SelectItem>
                <SelectItem value="30 dias">30 dias</SelectItem>
                <SelectItem value="45 dias">45 dias</SelectItem>
                <SelectItem value="60 dias">60 dias</SelectItem>
                <SelectItem value="50% anticipo">50% anticipo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Vigencia (dias)</Label>
            <Select value={String(vigenciaDias)} onValueChange={(v) => setVigenciaDias(Number(v) || 15)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 15, 30].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} dias
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fecha de emision</Label>
            <Input value={formatDate(fechaEmision)} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fecha de vencimiento</Label>
            <Input value={formatDate(fechaVencimiento)} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Condiciones especiales, tiempos de entrega, etc." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineas de la cotizacion</CardTitle>
          <CardDescription>Producto, unidad de medida, cantidad, precio, descuento y margen calculado</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-56">Producto</TableHead>
                  <TableHead className="w-28">Unidad</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-32">Precio unitario</TableHead>
                  <TableHead className="w-24">Desc. %</TableHead>
                  <TableHead className="w-24">Margen</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {computedLines.map((l) => (
                  <TableRow key={l.uid}>
                    <TableCell>
                      <ProductCombobox value={l.productoId} onChange={(id) => handleProductoChange(l.uid, id)} />
                    </TableCell>
                    <TableCell>
                      <Select value={l.unidadMedidaId} onValueChange={(v) => updateLine(l.uid, { unidadMedidaId: (v as string) ?? "" })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="UM" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesMedida.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.codigo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={l.cantidad}
                        onChange={(e) => updateLine(l.uid, { cantidad: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={l.precioUnitario}
                        onChange={(e) => updateLine(l.uid, { precioUnitario: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={l.descuentoPct}
                        onChange={(e) => updateLine(l.uid, { descuentoPct: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          l.margenPct >= 25
                            ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : l.margenPct >= 10
                              ? "border-amber-500/30 text-amber-700 dark:text-amber-400"
                              : "border-red-500/30 text-red-700 dark:text-red-400"
                        }
                      >
                        {l.margenPct.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.totalLinea, moneda)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => removeLine(l.uid)}>
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="w-fit" onClick={addLine}>
            <Plus />
            Agregar linea
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full max-w-xs grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-right font-medium">{formatCurrency(subtotalSinIva, moneda)}</span>
            <span className="text-muted-foreground">Descuento</span>
            <span className="text-right font-medium">-{formatCurrency(descuentoTotal, moneda)}</span>
            <span className="text-muted-foreground">IVA (12%)</span>
            <span className="text-right font-medium">{formatCurrency(ivaMonto, moneda)}</span>
            <span className="pt-1.5 text-base font-semibold">Total</span>
            <span className="pt-1.5 text-right text-base font-semibold">{formatCurrency(subtotalConIva, moneda)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleGuardar}>
              <Save />
              Guardar
            </Button>
            <Button variant="secondary" onClick={handleEnviar}>
              <Send />
              Enviar
            </Button>
            <Button onClick={handleConvertir}>
              <ArrowRightLeft />
              Convertir a pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
