"use client";

import {
  TrendingUp,
  Percent,
  AlertOctagon,
  Boxes,
  Ship,
  Users,
  Handshake,
  Wallet,
  PackageSearch,
  Container,
  Banknote,
  CreditCard,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { AlertsTable } from "@/components/dashboard/alerts-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  kpisDashboard,
  alertas,
  vendedores,
  oportunidades,
  cotizaciones,
  backorders,
  embarques,
  ordenesCompraLocal,
  cuentasPorCobrar,
  cuentasPorPagar,
  cuentasBancarias,
} from "@/lib/mock";

export default function InicioPage() {
  const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === "Enviada").length;
  const oportunidadesAbiertas = oportunidades.filter((o) => !["Ganada", "Perdida"].includes(o.estado)).length;
  const embarquesTransito = embarques.filter((e) =>
    ["Cargado", "En transito maritimo", "Arribado a puerto", "En tramite aduanal", "En transito terrestre"].includes(e.estado)
  );
  const ordenesPorRecibir = ordenesCompraLocal.filter((o) => o.estado === "Confirmada" || o.estado === "Enviada").length;
  const cxpPorVencer = cuentasPorPagar.filter((c) => c.estado === "Por vencer" || c.estado === "Vencida").reduce((s, c) => s + c.saldoPendiente, 0);
  const saldoBancosGTQ = cuentasBancarias.filter((c) => c.moneda === "GTQ").reduce((s, c) => s + c.saldoBanco, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Panel gerencial"
        description={`Bienvenido de nuevo. Hoy es ${formatDate("2026-07-27")}.`}
      />

      <Tabs defaultValue="gerencia">
        <TabsList>
          <TabsTrigger value="gerencia">Gerencia general</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="bodega">Bodega y logistica</TabsTrigger>
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
        </TabsList>

        <TabsContent value="gerencia" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Ventas del mes" value={formatCurrency(kpisDashboard.ventasMesGTQ)} icon={TrendingUp} deltaPct={kpisDashboard.ventasMesVariacionPct} />
            <StatCard label="Margen bruto" value={`${kpisDashboard.margenBrutoPct.toFixed(1)}%`} icon={Percent} deltaPct={kpisDashboard.margenBrutoVariacionPct} />
            <StatCard
              label="Cartera vencida"
              value={formatCurrency(kpisDashboard.carteraVencidaGTQ)}
              icon={AlertOctagon}
              deltaPct={kpisDashboard.carteraVencidaVariacionPct}
              invertDelta
            />
            <StatCard label="Valor de inventario" value={formatCurrency(kpisDashboard.valorInventarioGTQ)} icon={Boxes} deltaPct={kpisDashboard.valorInventarioVariacionPct} />
            <StatCard label="Contenedores en transito" value={String(kpisDashboard.contenedoresTransito)} icon={Ship} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Ventas vs. meta mensual</CardTitle>
                <CardDescription>Ultimos 12 meses, en Quetzales</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Ventas por categoria</CardTitle>
                <CardDescription>Acumulado del mes en curso</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas y pendientes</CardTitle>
              <CardDescription>Situaciones que requieren atencion en los distintos modulos</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsTable alertas={alertas} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ventas" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Ventas del mes" value={formatCurrency(kpisDashboard.ventasMesGTQ)} icon={TrendingUp} deltaPct={kpisDashboard.ventasMesVariacionPct} />
            <StatCard label="Oportunidades abiertas" value={String(oportunidadesAbiertas)} icon={Handshake} />
            <StatCard label="Cotizaciones pendientes de respuesta" value={String(cotizacionesPendientes)} icon={PackageSearch} />
            <StatCard label="Vendedores activos" value={String(vendedores.filter((v) => v.activo).length)} icon={Users} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento de meta por vendedor</CardTitle>
              <CardDescription>Venta acumulada del mes vs. meta asignada</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {vendedores.map((v) => {
                const pct = Math.min(100, Math.round((v.ventaAcumuladaGTQ / v.metaMensualGTQ) * 100));
                return (
                  <div key={v.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex w-full items-center justify-between sm:w-56">
                      <span className="text-sm font-medium">{v.nombre}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">{pct}%</span>
                    </div>
                    <Progress value={pct} className="flex-1" />
                    <div className="hidden w-40 shrink-0 justify-between text-xs text-muted-foreground sm:flex">
                      <span>{formatCurrency(v.ventaAcumuladaGTQ)}</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bodega" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Valor de inventario" value={formatCurrency(kpisDashboard.valorInventarioGTQ)} icon={Boxes} deltaPct={kpisDashboard.valorInventarioVariacionPct} />
            <StatCard label="Contenedores en transito" value={String(kpisDashboard.contenedoresTransito)} icon={Ship} />
            <StatCard label="Backorders abiertos" value={String(backorders.filter((b) => b.estado !== "Surtido").length)} icon={PackageSearch} />
            <StatCard label="Ordenes locales por recibir" value={String(ordenesPorRecibir)} icon={Container} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Embarques en transito</CardTitle>
              <CardDescription>Seguimiento de embarques activos hacia bodega</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {embarquesTransito.map((e) => (
                <div key={e.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{e.folio} · BL {e.numeroBl}</p>
                    <p className="text-xs text-muted-foreground">{e.puertoOrigen} → {e.puertoDestino}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{e.estado}</Badge>
                    <span className="text-xs text-muted-foreground">ETA {formatDate(e.eta)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finanzas" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Cartera vencida" value={formatCurrency(kpisDashboard.carteraVencidaGTQ)} icon={Wallet} invertDelta deltaPct={kpisDashboard.carteraVencidaVariacionPct} />
            <StatCard label="Cuentas por pagar por vencer/vencidas" value={formatCurrency(cxpPorVencer)} icon={CreditCard} />
            <StatCard label="Saldo bancario GTQ" value={formatCurrency(saldoBancosGTQ)} icon={Banknote} />
            <StatCard label="Documentos por cobrar activos" value={String(cuentasPorCobrar.filter((c) => c.estado !== "Pagada").length)} icon={Wallet} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Ventas vs. meta mensual</CardTitle>
              <CardDescription>Contexto de ingresos para el analisis financiero del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
