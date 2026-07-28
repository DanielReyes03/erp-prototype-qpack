"use client";

import { toast } from "sonner";
import { Ban, ShieldCheck, ShieldX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DefinitionList } from "@/components/shared/detail-sheet";
import { VerPdfButton, VerXmlButton } from "./documento-preview-dialogs";
import { formatCurrency, formatDate } from "@/lib/format";
import { clientes } from "@/lib/mock";
import type { DteEmitido } from "@/types";

export function DteDetail({ dte }: { dte: DteEmitido }) {
  const cliente = clientes.find((c) => c.id === dte.clienteId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>{dte.tipo} {dte.serie}-{dte.numero}</CardTitle>
            <CardDescription>{dte.receptorNombre}</CardDescription>
          </div>
          <StatusBadge status={dte.estado} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DefinitionList
            items={[
              { label: "Cliente", value: cliente?.nombreComercial ?? dte.receptorNombre },
              { label: "NIT receptor", value: dte.receptorNit },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Fecha de emision", value: formatDate(dte.fechaEmision) },
              { label: "Fecha de certificacion", value: formatDate(dte.fechaCertificacion) },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Pedido origen", value: dte.pedidoId ?? "N/A" },
              { label: "Moneda", value: dte.moneda },
            ]}
          />
          <DefinitionList
            items={[{ label: "Numero de autorizacion", value: <span className="font-mono text-xs break-all">{dte.numeroAutorizacion}</span>, full: true }]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio unitario</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dte.lineas.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.productoId}</TableCell>
                    <TableCell className="text-right">{l.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.precioUnitario)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.descuento)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.totalLinea)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full max-w-xs grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-right font-medium">{formatCurrency(dte.subtotal)}</span>
            <span className="text-muted-foreground">Descuento</span>
            <span className="text-right font-medium">-{formatCurrency(dte.descuentoTotal)}</span>
            <span className="text-muted-foreground">IVA (12%)</span>
            <span className="text-right font-medium">{formatCurrency(dte.iva)}</span>
            <span className="pt-1.5 text-base font-semibold">Total</span>
            <span className="pt-1.5 text-right text-base font-semibold">{formatCurrency(dte.total)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <VerXmlButton
              disabled={dte.estado !== "Certificado"}
              data={{
                tipo: dte.tipo,
                serie: dte.serie,
                numero: dte.numero,
                numeroAutorizacion: dte.numeroAutorizacion,
                fechaEmision: dte.fechaEmision,
                receptorNombre: dte.receptorNombre,
                receptorNit: dte.receptorNit,
                lineas: dte.lineas,
                subtotal: dte.subtotal,
                descuentoTotal: dte.descuentoTotal,
                iva: dte.iva,
                total: dte.total,
                moneda: dte.moneda,
              }}
            />
            <VerPdfButton
              disabled={dte.estado !== "Certificado"}
              data={{
                tipo: dte.tipo,
                serie: dte.serie,
                numero: dte.numero,
                numeroAutorizacion: dte.numeroAutorizacion,
                fechaEmision: dte.fechaEmision,
                receptorNombre: dte.receptorNombre,
                receptorNit: dte.receptorNit,
                lineas: dte.lineas,
                subtotal: dte.subtotal,
                descuentoTotal: dte.descuentoTotal,
                iva: dte.iva,
                total: dte.total,
                moneda: dte.moneda,
              }}
            />
            {dte.estado === "Certificado" ? (
              <Button variant="outline" className="text-destructive" onClick={() => toast.error("DTE anulado (simulado)", { description: "Se generara la nota de anulacion correspondiente." })}>
                <Ban />
                Anular DTE
              </Button>
            ) : dte.estado === "Rechazado" ? (
              <Button variant="outline" onClick={() => toast.info("Reintentando certificacion (simulado)")}>
                <ShieldCheck />
                Reintentar certificacion
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ShieldX />
                Sin acciones disponibles
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
