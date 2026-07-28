"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, PackageCheck, ScanBarcode, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { bodegas, productos } from "@/lib/mock";
import type { Recepcion } from "@/types";
import { cn } from "@/lib/utils";

interface ItemEscaneo {
  productoId: string;
  cantidadEsperada: number;
  cantidadConfirmada: number;
}

export function RecepcionMovil({ recepcion }: { recepcion: Recepcion }) {
  const router = useRouter();
  const bodega = bodegas.find((b) => b.id === recepcion.bodegaId);
  const [codigo, setCodigo] = React.useState("");
  const [items, setItems] = React.useState<ItemEscaneo[]>(
    recepcion.items.map((it) => ({ productoId: it.productoId, cantidadEsperada: it.cantidadEsperada, cantidadConfirmada: 0 }))
  );
  const [ultimoEscaneo, setUltimoEscaneo] = React.useState<string | null>(null);

  const totalEsperado = items.reduce((s, i) => s + i.cantidadEsperada, 0);
  const totalConfirmado = items.reduce((s, i) => s + i.cantidadConfirmada, 0);
  const progresoPct = totalEsperado > 0 ? Math.round((totalConfirmado / totalEsperado) * 100) : 0;
  const completo = items.every((i) => i.cantidadConfirmada >= i.cantidadEsperada);

  function registrarUnidad(productoId: string, delta: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.productoId === productoId
          ? { ...it, cantidadConfirmada: Math.max(0, Math.min(it.cantidadEsperada, it.cantidadConfirmada + delta)) }
          : it
      )
    );
  }

  function procesarCodigo(sku: string) {
    const producto = productos.find((p) => p.sku.toLowerCase() === sku.trim().toLowerCase() || p.id === sku.trim());
    if (!producto) {
      toast.error("Codigo no reconocido", { description: sku });
      return;
    }
    const item = items.find((i) => i.productoId === producto.id);
    if (!item) {
      toast.error("Producto no pertenece a esta recepcion", { description: producto.nombre });
      return;
    }
    if (item.cantidadConfirmada >= item.cantidadEsperada) {
      toast.info("Cantidad completa para este producto", { description: producto.nombre });
      return;
    }
    registrarUnidad(producto.id, 1);
    setUltimoEscaneo(producto.nombre);
    toast.success("Unidad registrada", { description: producto.nombre });
  }

  function handleEscanear() {
    const pendiente = items.find((i) => i.cantidadConfirmada < i.cantidadEsperada);
    if (!pendiente) {
      toast.info("Todos los productos ya fueron confirmados");
      return;
    }
    const producto = productos.find((p) => p.id === pendiente.productoId);
    if (producto) {
      setCodigo(producto.sku);
      procesarCodigo(producto.sku);
    }
  }

  function handleSubmitCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    procesarCodigo(codigo);
    setCodigo("");
  }

  function handleFinalizar() {
    toast.success(completo ? "Recepcion completada" : "Recepcion guardada con diferencias", {
      description: `${totalConfirmado} de ${totalEsperado} unidades confirmadas.`,
    });
    router.push("/compras/recepciones");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push("/compras/recepciones")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-sm font-semibold">{recepcion.folio}</p>
          <p className="text-xs text-muted-foreground">{bodega?.nombre}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Progreso de recepcion</span>
          <span className="text-sm text-muted-foreground">{totalConfirmado}/{totalEsperado}</span>
        </div>
        <Progress value={progresoPct} className="h-2" />
      </div>

      <form onSubmit={handleSubmitCodigo} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <span className="text-sm font-medium">Lector de codigo de barras</span>
        <div className="flex gap-2">
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Escanea o escribe el SKU"
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="outline">
            <ScanBarcode className="size-4" />
          </Button>
        </div>
        <Button type="button" onClick={handleEscanear} className="w-full">
          <ScanBarcode />
          Simular escaneo
        </Button>
        {ultimoEscaneo && <p className="text-xs text-muted-foreground">Ultimo escaneo: {ultimoEscaneo}</p>}
      </form>

      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const producto = productos.find((p) => p.id === it.productoId);
          const itemCompleto = it.cantidadConfirmada >= it.cantidadEsperada;
          return (
            <div key={it.productoId} className={cn("rounded-xl border p-3.5", itemCompleto ? "border-emerald-500/40 bg-emerald-500/5" : "bg-card")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{producto?.nombre ?? it.productoId}</p>
                  <p className="text-xs text-muted-foreground">{producto?.sku}</p>
                </div>
                {itemCompleto && <Badge className="shrink-0 bg-emerald-600 text-white dark:bg-emerald-500">Completo</Badge>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8" onClick={() => registrarUnidad(it.productoId, -1)} disabled={it.cantidadConfirmada <= 0}>
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-16 text-center text-sm font-semibold tabular-nums">
                    {it.cantidadConfirmada} / {it.cantidadEsperada}
                  </span>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => registrarUnidad(it.productoId, 1)} disabled={itemCompleto}>
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Progress value={(it.cantidadConfirmada / it.cantidadEsperada) * 100} className="h-1.5 w-16" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-sm">
          <Button className="w-full" size="lg" onClick={handleFinalizar}>
            {completo ? <CheckCircle2 /> : <PackageCheck />}
            {completo ? "Finalizar recepcion" : "Guardar avance de recepcion"}
          </Button>
        </div>
      </div>
    </div>
  );
}
