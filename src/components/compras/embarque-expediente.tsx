"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calculator, Download, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DefinitionList } from "@/components/shared/detail-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { navieras, contenedores, agentesAduaneros, ordenesImportacion, proveedores, gastosEmbarque } from "@/lib/mock";
import type { Embarque, EstadoEmbarque, EventoTimeline } from "@/types";

const estadosOrden: EstadoEmbarque[] = [
  "Reservado",
  "Cargado",
  "En transito maritimo",
  "Arribado a puerto",
  "En tramite aduanal",
  "Liberado",
  "En transito terrestre",
  "Recibido en bodega",
];

function buildTimeline(embarque: Embarque): EventoTimeline[] {
  const currentIndex = estadosOrden.indexOf(embarque.estado);
  return estadosOrden.map((estado, i) => ({
    id: estado,
    titulo: estado,
    fecha: i === 0 ? embarque.etd : i === estadosOrden.length - 1 ? embarque.eta : "",
    estado: i < currentIndex ? "completado" : i === currentIndex ? "actual" : "pendiente",
  }));
}

const tiposDocumento = [
  { nombre: "Bill of Lading (BL)", tipo: "PDF" as const },
  { nombre: "Packing List", tipo: "XLS" as const },
  { nombre: "Factura comercial", tipo: "PDF" as const },
  { nombre: "Poliza de seguro", tipo: "PDF" as const },
  { nombre: "DUCA", tipo: "PDF" as const },
  { nombre: "Certificado de origen", tipo: "PDF" as const },
];

export function EmbarqueExpediente({ embarque }: { embarque: Embarque }) {
  const router = useRouter();
  const naviera = navieras.find((n) => n.id === embarque.navieraId);
  const contenedor = contenedores.find((c) => c.id === embarque.contenedorId);
  const agente = agentesAduaneros.find((a) => a.id === embarque.agenteAduaneroId);
  const ordenes = ordenesImportacion.filter((o) => embarque.ordenesImportacionIds.includes(o.id));
  const gastos = gastosEmbarque.filter((g) => g.embarqueId === embarque.id);
  const timeline = buildTimeline(embarque);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Embarque {embarque.folio}</CardTitle>
            <CardDescription>BL {embarque.numeroBl} · {embarque.puertoOrigen} → {embarque.puertoDestino}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={embarque.estado} />
            <Badge variant="outline">{embarque.incoterm}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DefinitionList
            items={[
              { label: "Naviera", value: naviera?.nombre ?? "-" },
              { label: "SCAC", value: naviera?.codigoScac ?? "-" },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Contenedor", value: contenedor?.numero ?? "-" },
              { label: "Tipo", value: contenedor?.tipo ?? "-" },
            ]}
          />
          <DefinitionList
            items={[
              { label: "ETD", value: formatDate(embarque.etd) },
              { label: "ETA", value: formatDate(embarque.eta) },
            ]}
          />
          <DefinitionList
            items={[
              { label: "Agente aduanero", value: agente?.nombre ?? "-" },
              { label: "DUCA", value: embarque.ducaNumero ?? "Pendiente" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linea de tiempo del embarque</CardTitle>
          <CardDescription>Estatus del embarque desde su reserva hasta la recepcion en bodega</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-0">
            {timeline.map((ev, i) => (
              <li key={ev.id} className="relative flex gap-3 pb-6 last:pb-0">
                {i < timeline.length - 1 && (
                  <span className={`absolute left-[9px] top-5 h-full w-px ${ev.estado === "completado" ? "bg-primary" : "bg-border"}`} />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    ev.estado === "completado"
                      ? "border-primary bg-primary"
                      : ev.estado === "actual"
                        ? "border-primary bg-background"
                        : "border-border bg-background"
                  }`}
                />
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className={`text-sm ${ev.estado === "pendiente" ? "text-muted-foreground" : "font-medium"}`}>{ev.titulo}</p>
                  {ev.fecha && <p className="text-xs text-muted-foreground">{formatDate(ev.fecha)}</p>}
                  {ev.estado === "actual" && <Badge className="w-fit sm:ml-2">Estatus actual</Badge>}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Detalle del expediente</CardTitle>
            <CardDescription>Ordenes de compra asociadas, documentos y gastos del embarque</CardDescription>
          </div>
          <Button variant="outline" onClick={() => router.push(`/compras/costeo/cst-${embarque.id}`)}>
            <Calculator />
            Ver costeo de importacion
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ordenes">
            <TabsList>
              <TabsTrigger value="ordenes">Ordenes de compra ({ordenes.length})</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="gastos">Gastos ({gastos.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="ordenes" className="pt-4">
              {ordenes.length === 0 ? (
                <EmptyState title="Sin ordenes asociadas" description="Este embarque no tiene ordenes de importacion vinculadas." />
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Folio</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Lineas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordenes.map((o) => (
                        <TableRow key={o.id} className="cursor-pointer" onClick={() => router.push("/compras/ordenes-importacion")}>
                          <TableCell className="font-medium">{o.folio}</TableCell>
                          <TableCell>{proveedores.find((p) => p.id === o.proveedorId)?.nombreComercial ?? "-"}</TableCell>
                          <TableCell><StatusBadge status={o.estado} /></TableCell>
                          <TableCell className="text-right">{o.lineas.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="documentos" className="pt-4">
              <div className="divide-y rounded-lg border">
                {tiposDocumento.map((doc) => (
                  <div key={doc.nombre} className="flex items-center justify-between gap-3 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nombre}</p>
                        <p className="text-xs text-muted-foreground">{doc.tipo} · {embarque.folio}.{doc.tipo.toLowerCase()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Descarga simulada", { description: doc.nombre })}>
                      <Download />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="gastos" className="pt-4">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Estimado</TableHead>
                      <TableHead className="text-right">Real</TableHead>
                      <TableHead className="text-right">Variacion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastos.map((g) => {
                      const variacion = g.montoEstimadoGTQ > 0 ? ((g.montoRealGTQ - g.montoEstimadoGTQ) / g.montoEstimadoGTQ) * 100 : 0;
                      return (
                        <TableRow key={g.id}>
                          <TableCell>{g.categoria}</TableCell>
                          <TableCell className="text-right">{formatCurrency(g.montoEstimadoGTQ)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(g.montoRealGTQ)}</TableCell>
                          <TableCell className={`text-right ${variacion > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {variacion > 0 ? "+" : ""}
                            {variacion.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
