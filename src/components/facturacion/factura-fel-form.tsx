"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, Loader2, Plus, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductCombobox } from "@/components/shared/product-combobox";
import { VerPdfButton, VerXmlButton } from "./documento-preview-dialogs";
import { formatCurrency, formatDate } from "@/lib/format";
import { clientes, productos, pedidos, empresaPorDefecto } from "@/lib/mock";
import type { LineaDte, TipoDte } from "@/types";

interface EditorLine {
  uid: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
}

let uid = 0;
function nextUid() {
  uid += 1;
  return `fel-line-${uid}`;
}

const tiposDte: { value: TipoDte; label: string }[] = [
  { value: "FACT", label: "FACT - Factura" },
  { value: "FCAM", label: "FCAM - Factura cambiaria" },
  { value: "NABN", label: "NABN - Nota de abono" },
];

export function FacturaFelForm() {
  const router = useRouter();
  const hoy = "2026-07-27";

  const [tipo, setTipo] = React.useState<TipoDte>("FACT");
  const [clienteId, setClienteId] = React.useState("");
  const [nitManual, setNitManual] = React.useState("");
  const [pedidoId, setPedidoId] = React.useState<string>("");
  const [lineas, setLineas] = React.useState<EditorLine[]>([{ uid: nextUid(), productoId: "", cantidad: 1, precioUnitario: 0, descuentoPct: 0 }]);
  const [errores, setErrores] = React.useState<string[]>([]);
  const [certificando, setCertificando] = React.useState(false);
  const [certificado, setCertificado] = React.useState<{ numeroAutorizacion: string; fecha: string; serie: string; numero: string } | null>(null);

  const cliente = clientes.find((c) => c.id === clienteId);
  const receptorNit = cliente?.nit ?? nitManual;
  const receptorNombre = cliente?.razonSocial ?? (nitManual ? "Consumidor final" : "");

  function handlePedidoChange(id: string) {
    setPedidoId(id);
    const pedido = pedidos.find((p) => p.id === id);
    if (pedido) {
      setClienteId(pedido.clienteId);
      setLineas(
        pedido.lineas.map((l) => ({
          uid: nextUid(),
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          descuentoPct: l.descuentoPct,
        }))
      );
    }
  }

  function updateLine(id: string, patch: Partial<EditorLine>) {
    setLineas((prev) => prev.map((l) => (l.uid === id ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLineas((prev) => [...prev, { uid: nextUid(), productoId: "", cantidad: 1, precioUnitario: 0, descuentoPct: 0 }]);
  }

  function removeLine(id: string) {
    setLineas((prev) => (prev.length > 1 ? prev.filter((l) => l.uid !== id) : prev));
  }

  const computed = lineas.map((l) => {
    const producto = productos.find((p) => p.id === l.productoId);
    const bruto = l.cantidad * l.precioUnitario;
    const descuento = bruto * (l.descuentoPct / 100);
    const totalLinea = bruto - descuento;
    return { ...l, producto, descuento, totalLinea };
  });

  const totalConIva = computed.reduce((s, l) => s + l.totalLinea, 0);
  const iva = totalConIva - totalConIva / 1.12;
  const subtotal = totalConIva - iva;
  const descuentoTotal = computed.reduce((s, l) => s + l.descuento, 0);

  const dteLineas: LineaDte[] = computed.map((l, i) => ({
    id: `preview-${i}`,
    productoId: l.producto?.nombre ?? l.productoId,
    cantidad: l.cantidad,
    unidadMedida: l.producto?.unidadMedidaId ?? "UND",
    precioUnitario: l.precioUnitario,
    descuento: l.descuento,
    totalLinea: l.totalLinea,
    bienOServicio: "B",
  }));

  function validar(): boolean {
    const errs: string[] = [];
    if (!receptorNit) errs.push("Ingresa el NIT del receptor o selecciona un cliente.");
    if (computed.filter((l) => l.productoId && l.cantidad > 0).length === 0) errs.push("Agrega al menos una linea con producto y cantidad.");
    setErrores(errs);
    return errs.length === 0;
  }

  function handleCertificar() {
    if (!validar()) return;
    setCertificando(true);
    setTimeout(() => {
      setCertificando(false);
      setCertificado({
        numeroAutorizacion: `A${Math.floor(100000000000 + Math.random() * 899999999999)}-${Math.floor(1000 + Math.random() * 8999)}`,
        fecha: hoy,
        serie: "B7F2",
        numero: String(Math.floor(100000 + Math.random() * 899999)),
      });
      toast.success("DTE certificado con exito", { description: "El documento fue enviado al certificador FEL (simulado)." });
    }, 1200);
  }

  return (
    <div className="flex flex-col gap-6">
      {errores.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Revisa la informacion antes de certificar</AlertTitle>
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
        <CardHeader>
          <CardTitle>Nueva factura electronica (FEL)</CardTitle>
          <CardDescription>Define el tipo de DTE y los datos del receptor</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de DTE</Label>
            <Select value={tipo} onValueChange={(v) => setTipo((v as TipoDte) ?? "FACT")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposDte.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Pedido de origen (opcional)</Label>
            <Select value={pedidoId} onValueChange={(v) => handlePedidoChange((v as string) ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Facturar sin pedido" />
              </SelectTrigger>
              <SelectContent>
                {pedidos.slice(0, 25).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.folio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cliente</Label>
            <Select value={clienteId} onValueChange={(v) => setClienteId((v as string) ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona cliente o usa NIT" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombreComercial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>NIT del receptor</Label>
            <Input
              value={receptorNit}
              placeholder="CF o NIT del receptor"
              disabled={!!clienteId}
              onChange={(e) => setNitManual(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
            <Label>Nombre del receptor</Label>
            <Input value={receptorNombre} readOnly disabled placeholder="Se completa segun el cliente o NIT" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fecha de emision</Label>
            <Input value={formatDate(hoy)} readOnly disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Emisor</Label>
            <Input value={`${empresaPorDefecto.nombreComercial} · NIT ${empresaPorDefecto.nit}`} readOnly disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineas del documento</CardTitle>
          <CardDescription>Bienes o servicios incluidos en la factura</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-56">Producto</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-32">Precio unitario</TableHead>
                  <TableHead className="w-24">Desc. %</TableHead>
                  <TableHead className="w-32 text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {computed.map((l) => (
                  <TableRow key={l.uid}>
                    <TableCell>
                      <ProductCombobox value={l.productoId} onChange={(id) => updateLine(l.uid, { productoId: id })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} value={l.cantidad} onChange={(e) => updateLine(l.uid, { cantidad: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} step="0.01" value={l.precioUnitario} onChange={(e) => updateLine(l.uid, { precioUnitario: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={100} value={l.descuentoPct} onChange={(e) => updateLine(l.uid, { descuentoPct: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.totalLinea)}</TableCell>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-right font-medium">{formatCurrency(subtotal)}</span>
            <span className="text-muted-foreground">Descuento</span>
            <span className="text-right font-medium">-{formatCurrency(descuentoTotal)}</span>
            <span className="text-muted-foreground">IVA (12%)</span>
            <span className="text-right font-medium">{formatCurrency(iva)}</span>
            <span className="pt-1.5 text-base font-semibold">Total</span>
            <span className="pt-1.5 text-right text-base font-semibold">{formatCurrency(totalConIva)}</span>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Estado de certificacion</CardTitle>
            <CardDescription>Panel de certificacion ante el proveedor FEL</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {certificado ? (
              <>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <StatusBadge status="Certificado" />
                </div>
                <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">Serie / Numero</dt>
                  <dd className="text-right font-medium">{certificado.serie}-{certificado.numero}</dd>
                  <dt className="text-muted-foreground">Numero de autorizacion</dt>
                  <dd className="text-right font-mono text-xs break-all">{certificado.numeroAutorizacion}</dd>
                  <dt className="text-muted-foreground">Fecha de certificacion</dt>
                  <dd className="text-right font-medium">{formatDate(certificado.fecha)}</dd>
                </dl>
                <div className="flex flex-wrap gap-2 pt-2">
                  <VerXmlButton
                    data={{
                      tipo,
                      serie: certificado.serie,
                      numero: certificado.numero,
                      numeroAutorizacion: certificado.numeroAutorizacion,
                      fechaEmision: hoy,
                      receptorNombre: receptorNombre || "Consumidor final",
                      receptorNit: receptorNit || "CF",
                      lineas: dteLineas,
                      subtotal,
                      descuentoTotal,
                      iva,
                      total: totalConIva,
                      moneda: "GTQ",
                    }}
                  />
                  <VerPdfButton
                    data={{
                      tipo,
                      serie: certificado.serie,
                      numero: certificado.numero,
                      numeroAutorizacion: certificado.numeroAutorizacion,
                      fechaEmision: hoy,
                      receptorNombre: receptorNombre || "Consumidor final",
                      receptorNit: receptorNit || "CF",
                      lineas: dteLineas,
                      subtotal,
                      descuentoTotal,
                      iva,
                      total: totalConIva,
                      moneda: "GTQ",
                    }}
                  />
                  <Button variant="ghost" onClick={() => router.push("/facturacion/dte")}>
                    Ir al listado de DTE
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="size-5" />
                  <span className="text-sm">Documento pendiente de emision</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Al certificar, el documento se envia al proveedor de certificacion FEL configurado en Administracion &gt; Parametros y recibe numero de autorizacion.
                </p>
                <Button onClick={handleCertificar} disabled={certificando} className="w-fit">
                  {certificando ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                  {certificando ? "Certificando..." : "Certificar con FEL"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
