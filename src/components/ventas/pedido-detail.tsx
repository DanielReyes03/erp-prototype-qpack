"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Truck, ReceiptText, Ban, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DefinitionList } from "@/components/shared/detail-sheet";
import { formatCurrency, formatDate } from "@/lib/format";
import { clientes, vendedores, bodegas, productos, unidadesMedida } from "@/lib/mock";
import type { Pedido } from "@/types";

export function PedidoDetail({ pedido }: { pedido: Pedido }) {
  const router = useRouter();
  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const vendedor = vendedores.find((v) => v.id === pedido.vendedorId);
  const bodega = bodegas.find((b) => b.id === pedido.bodegaId);

  const lineas = pedido.lineas.map((l) => {
    const producto = productos.find((p) => p.id === l.productoId);
    const um = unidadesMedida.find((u) => u.id === l.unidadMedidaId);
    const bruto = l.cantidad * l.precioUnitario;
    const total = bruto * (1 - l.descuentoPct / 100);
    return { ...l, producto, um, total };
  });

  const subtotalConIva = lineas.reduce((s, l) => s + l.total, 0);
  const iva = subtotalConIva - subtotalConIva / 1.12;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Pedido {pedido.folio}</CardTitle>
            <CardDescription>{cliente?.nombreComercial}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={pedido.estado} />
            <StatusBadge status={pedido.prioridad} tone={pedido.prioridad === "Alta" ? "danger" : "info"} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DefinitionList
            items={[
              { label: "Cliente", value: cliente?.nombreComercial ?? "-" },
              { label: "Vendedor", value: vendedor?.nombre ?? "-" },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Bodega de despacho", value: bodega?.nombre ?? "-" },
              { label: "Moneda", value: pedido.moneda },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Fecha de pedido", value: formatDate(pedido.fechaPedido) },
              { label: "Entrega comprometida", value: formatDate(pedido.fechaEntregaComprometida) },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Cotizacion origen", value: pedido.cotizacionId ?? "Pedido directo" },
              { label: "Direccion de entrega", value: pedido.direccionEntrega, full: true },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lineas del pedido</CardTitle>
          <CardDescription>{lineas.length} productos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Producto</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio unitario</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineas.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{l.producto?.nombre ?? l.productoId}</p>
                      <p className="text-xs text-muted-foreground">{l.producto?.sku}</p>
                    </TableCell>
                    <TableCell>{l.um?.codigo ?? "-"}</TableCell>
                    <TableCell className="text-right">{l.cantidad.toLocaleString("es-GT")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.precioUnitario, pedido.moneda)}</TableCell>
                    <TableCell className="text-right">{l.descuentoPct}%</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.total, pedido.moneda)}</TableCell>
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
            <span className="text-right font-medium">{formatCurrency(subtotalConIva - iva, pedido.moneda)}</span>
            <span className="text-muted-foreground">IVA (12%)</span>
            <span className="text-right font-medium">{formatCurrency(iva, pedido.moneda)}</span>
            <span className="pt-1.5 text-base font-semibold">Total</span>
            <span className="pt-1.5 text-right text-base font-semibold">{formatCurrency(subtotalConIva, pedido.moneda)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/ventas/despachos")}>
              <Truck />
              Programar despacho
            </Button>
            <Button variant="outline" onClick={() => router.push("/facturacion/dte")}>
              <ReceiptText />
              Facturar
            </Button>
            <Button variant="outline" className="text-destructive" onClick={() => toast.error("Pedido cancelado (simulado)")}>
              <Ban />
              Cancelar
            </Button>
            <Button
              onClick={() =>
                toast.success("Direccion de entrega confirmada", { description: pedido.direccionEntrega })
              }
            >
              <MapPin />
              Confirmar entrega
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
