import { DollarSign, AlertTriangle, Boxes, FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { KpiCard } from "@/components/patterns/KpiCard";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { formatMoney, formatDate } from "@/lib/format";

const SALES_TREND = [
  { label: "Mar", amount: 398_450 },
  { label: "Abr", amount: 421_900 },
  { label: "May", amount: 375_600 },
  { label: "Jun", amount: 452_180 },
  { label: "Jul", amount: 468_900 },
  { label: "Ago", amount: 486_320 },
];

const PENDING_DOCUMENTS = [
  {
    id: "OV-000231",
    tipo: "Orden de venta",
    contraparte: "Distribuidora El Progreso, S.A.",
    estado: "Pendiente de despacho",
    monto: 18_450.5,
    fecha: "2026-08-04",
  },
  {
    id: "DTE-004512",
    tipo: "DTE",
    contraparte: "Plásticos de Occidente, S.A.",
    estado: "Pendiente de certificar",
    monto: 9_820.0,
    fecha: "2026-08-05",
  },
  {
    id: "OC-000118",
    tipo: "Orden de compra",
    contraparte: "Petroquímica Centroamericana, S.A.",
    estado: "Pendiente de recepción",
    monto: 142_300.0,
    fecha: "2026-08-01",
  },
  {
    id: "OV-000229",
    tipo: "Orden de venta",
    contraparte: "Envases y Empaques de Guatemala, S.A.",
    estado: "Pendiente de facturar",
    monto: 27_610.75,
    fecha: "2026-08-03",
  },
  {
    id: "CxC-002210",
    tipo: "Cuenta por cobrar",
    contraparte: "Comercializadora San Miguel, S.A.",
    estado: "Vencida +30 días",
    monto: 12_980.0,
    fecha: "2026-07-02",
  },
];

const TOP_PRODUCTS = [
  { sku: "RES-PEAD-25K", nombre: "Resina PEAD Alta Densidad 25 kg", unidades: 4820, monto: 289_200 },
  { sku: "BOL-CAM-200N", nombre: "Bolsa Camiseta Calibre 200 Negra (fardo)", unidades: 3960, monto: 118_800 },
  { sku: "ENV-PET-500B", nombre: "Envase PET 500 ml Boca Ancha", unidades: 15200, monto: 98_800 },
  { sku: "RES-PP-25K", nombre: "Resina PP Homopolímero 25 kg", unidades: 2140, monto: 96_300 },
  { sku: "TAP-R28-BL", nombre: "Tapa Rosca 28 mm Blanca (millar)", unidades: 610, monto: 42_700 },
];

const STATUS_STYLES: Record<string, string> = {
  "Pendiente de despacho": "bg-blue-50 text-blue-700",
  "Pendiente de certificar": "bg-blue-50 text-blue-700",
  "Pendiente de recepción": "bg-blue-50 text-blue-700",
  "Pendiente de facturar": "bg-[#FEF3C7] text-[#D97706]",
  "Vencida +30 días": "bg-[#FEE2E2] text-[#DC2626]",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen operativo de QPack Importadora, S.A. — actualizado en tiempo real"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ventas del mes"
          value={formatMoney(486_320.5)}
          icon={DollarSign}
          trend={{ value: "+3.7% vs. julio", direction: "up" }}
        />
        <KpiCard
          label="Cartera vencida"
          value={formatMoney(62_150.0)}
          icon={AlertTriangle}
          trend={{ value: "+8.2% vs. julio", direction: "up", positiveIsGood: false }}
        />
        <KpiCard
          label="Valor de inventario"
          value={formatMoney(1_245_800.0)}
          icon={Boxes}
          trend={{ value: "-1.4% vs. julio", direction: "down", positiveIsGood: false }}
        />
        <KpiCard
          label="DTEs emitidos (mes)"
          value="214"
          icon={FileCheck2}
          trend={{ value: "+12 vs. julio", direction: "up" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Ventas de los últimos 6 meses</h2>
          <p className="mb-2 text-xs text-slate-500">Facturación neta, DTEs certificados (GTQ)</p>
          <SalesTrendChart data={SALES_TREND} />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Top 5 productos del mes</h2>
          <p className="mb-2 text-xs text-slate-500">Por monto vendido</p>
          <ul className="divide-y divide-slate-200">
            {TOP_PRODUCTS.map((p, i) => (
              <li key={p.sku} className="flex items-center gap-3 py-2.5">
                <span className="font-data w-4 shrink-0 text-xs text-slate-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900">{p.nombre}</p>
                  <p className="font-data text-xs text-slate-500">
                    {p.sku} · {p.unidades.toLocaleString("en-US")} u.
                  </p>
                </div>
                <MoneyCell amount={p.monto} className="w-24 shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Documentos pendientes de acción</h2>
          <p className="text-xs text-slate-500">
            Órdenes, DTEs y cuentas por cobrar que requieren seguimiento
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-navy-900 text-left text-white">
                <th className="px-4 py-2 text-xs font-medium tracking-wide uppercase">Documento</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wide uppercase">Tipo</th>
                <th className="px-4 py-2 text-xs font-medium tracking-wide uppercase">
                  Contraparte
                </th>
                <th className="px-4 py-2 text-xs font-medium tracking-wide uppercase">Estado</th>
                <th className="px-4 py-2 text-right text-xs font-medium tracking-wide uppercase">
                  Monto
                </th>
                <th className="px-4 py-2 text-xs font-medium tracking-wide uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_DOCUMENTS.map((doc) => (
                <tr key={doc.id} className="h-10 border-b border-slate-200 last:border-0">
                  <td className="font-data px-4 text-slate-900">{doc.id}</td>
                  <td className="px-4 text-slate-700">{doc.tipo}</td>
                  <td className="px-4 text-slate-700">{doc.contraparte}</td>
                  <td className="px-4">
                    <span
                      className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[doc.estado] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {doc.estado}
                    </span>
                  </td>
                  <td className="px-4">
                    <MoneyCell amount={doc.monto} />
                  </td>
                  <td className="font-data px-4 text-slate-500">{formatDate(doc.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
