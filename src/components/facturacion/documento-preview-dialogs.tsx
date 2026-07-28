"use client";

import * as React from "react";
import { Code2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import { empresaPorDefecto } from "@/lib/mock";
import type { LineaDte } from "@/types";

export interface DocumentoPreviewData {
  tipo: string;
  serie: string;
  numero: string;
  numeroAutorizacion: string;
  fechaEmision: string;
  receptorNombre: string;
  receptorNit: string;
  lineas: LineaDte[];
  subtotal: number;
  descuentoTotal: number;
  iva: number;
  total: number;
  moneda: string;
}

export function VerXmlButton({ data, disabled }: { data: DocumentoPreviewData; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
        <Code2 />
        Ver XML
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>XML certificado - {data.serie}-{data.numero}</DialogTitle>
            <DialogDescription>Representacion simplificada del DTE con fines de demostracion.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 rounded-md border bg-muted/30">
            <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap">{buildXml(data)}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VerPdfButton({ data, disabled }: { data: DocumentoPreviewData; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
        <FileText />
        Ver PDF
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Vista previa de documento</DialogTitle>
            <DialogDescription>Representacion impresa simplificada del DTE.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[28rem] rounded-md border">
            <div className="space-y-4 bg-white p-6 text-black">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{empresaPorDefecto.nombreComercial}</p>
                  <p className="text-xs text-neutral-500">NIT {empresaPorDefecto.nit}</p>
                  <p className="text-xs text-neutral-500">{empresaPorDefecto.direccion.linea1}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{data.tipo}</p>
                  <p className="text-xs text-neutral-500">Serie {data.serie} No. {data.numero}</p>
                  <p className="text-xs text-neutral-500">{formatDate(data.fechaEmision)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-neutral-500">Receptor</p>
                <p className="text-sm">{data.receptorNombre}</p>
                <p className="text-xs text-neutral-500">NIT {data.receptorNit}</p>
              </div>
              <Separator />
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="pb-1">Descripcion</th>
                    <th className="pb-1 text-right">Cant.</th>
                    <th className="pb-1 text-right">P. Unit.</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lineas.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="py-1">{l.productoId}</td>
                      <td className="py-1 text-right">{l.cantidad}</td>
                      <td className="py-1 text-right">{formatCurrency(l.precioUnitario)}</td>
                      <td className="py-1 text-right">{formatCurrency(l.totalLinea)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Separator />
              <div className="ml-auto grid w-48 grid-cols-2 gap-y-1 text-xs">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-right">{formatCurrency(data.subtotal)}</span>
                <span className="text-neutral-500">Descuento</span>
                <span className="text-right">-{formatCurrency(data.descuentoTotal)}</span>
                <span className="text-neutral-500">IVA</span>
                <span className="text-right">{formatCurrency(data.iva)}</span>
                <span className="font-semibold">Total</span>
                <span className="text-right font-semibold">{formatCurrency(data.total)}</span>
              </div>
              <Separator />
              <p className="break-all text-[10px] text-neutral-400">Numero de autorizacion: {data.numeroAutorizacion}</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function buildXml(data: DocumentoPreviewData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0" Version="0.1">
  <dte:SAT ClaseDocumento="dte">
    <dte:DTE ID="DatosCertificados">
      <dte:DatosEmision ID="DatosEmision">
        <dte:DatosGenerales Tipo="${data.tipo}" FechaHoraEmision="${data.fechaEmision}T09:00:00-06:00" CodigoMoneda="${data.moneda}" />
        <dte:Emisor NITEmisor="${empresaPorDefecto.nit}" NombreEmisor="${empresaPorDefecto.nombre}" />
        <dte:Receptor NITReceptor="${data.receptorNit}" NombreReceptor="${data.receptorNombre}" />
        <dte:Items>
${data.lineas
  .map(
    (l, i) => `          <dte:Item NumeroLinea="${i + 1}" BienOServicio="${l.bienOServicio}">
            <dte:Cantidad>${l.cantidad}</dte:Cantidad>
            <dte:UnidadMedida>${l.unidadMedida}</dte:UnidadMedida>
            <dte:Descripcion>${l.productoId}</dte:Descripcion>
            <dte:PrecioUnitario>${l.precioUnitario.toFixed(2)}</dte:PrecioUnitario>
            <dte:Total>${l.totalLinea.toFixed(2)}</dte:Total>
          </dte:Item>`
  )
  .join("\n")}
        </dte:Items>
        <dte:Totales>
          <dte:GranTotal>${data.total.toFixed(2)}</dte:GranTotal>
        </dte:Totales>
      </dte:DatosEmision>
    </dte:DTE>
  </dte:SAT>
  <dte:Certificacion>
    <dte:NumeroAutorizacion>${data.numeroAutorizacion}</dte:NumeroAutorizacion>
  </dte:Certificacion>
</dte:GTDocumento>`;
}
