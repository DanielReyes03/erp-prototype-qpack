"use client";

import { useMemo } from "react";
import { Download, TrendingUp, Package, ShoppingCart } from "lucide-react";
import { Tabs, Button } from "@heroui/react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { downloadCsv } from "@/lib/csv";
import { computeTotals } from "@/components/patterns/LineItemsEditor";
import { useDteStore } from "@/lib/store/dte";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import { useInventarioStore } from "@/lib/store/inventario";
import { CLIENTES_SEED } from "@/lib/seed/clientes";
import { VENDEDORES_SEED } from "@/lib/seed/vendedores";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";

function periodoDe(fecha: string) {
  const d = new Date(fecha);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface FilaPeriodo {
  periodo: string;
  cantidad: number;
  base: number;
  iva: number;
  total: number;
}

interface FilaVendedor {
  vendedorId: string;
  nombre: string;
  cantidad: number;
  total: number;
}

interface FilaCliente {
  clienteId: string;
  nombre: string;
  cantidad: number;
  total: number;
}

interface FilaProveedor {
  proveedorId: string;
  nombre: string;
  cantidad: number;
  total: number;
}

interface FilaKardex {
  productoId: string;
  locacionId: string;
  sku: string;
  nombre: string;
  locacionNombre: string;
  cantidad: number;
  costoPromedio: number;
  valor: number;
}

export default function ReportesPage() {
  const documentos = useDteStore((s) => s.documentos);
  const facturasProveedor = useFacturasProveedorStore((s) => s.facturas);
  const existencias = useInventarioStore((s) => s.existencias);

  const ventasCertificadas = useMemo(
    () => documentos.filter((d) => d.tipo === "FACT" && d.estado === "certificado"),
    [documentos],
  );

  const porPeriodo = useMemo<FilaPeriodo[]>(() => {
    const mapa = new Map<string, FilaPeriodo>();
    for (const dte of ventasCertificadas) {
      const periodo = periodoDe(dte.fechaCertificacion);
      const t = computeTotals(dte.lineas);
      const actual = mapa.get(periodo) ?? { periodo, cantidad: 0, base: 0, iva: 0, total: 0 };
      actual.cantidad += 1;
      actual.base += t.baseGravable;
      actual.iva += t.iva;
      actual.total += t.total;
      mapa.set(periodo, actual);
    }
    return Array.from(mapa.values()).sort((a, b) => b.periodo.localeCompare(a.periodo));
  }, [ventasCertificadas]);

  const porVendedor = useMemo<FilaVendedor[]>(() => {
    const mapa = new Map<string, FilaVendedor>();
    for (const dte of ventasCertificadas) {
      const cliente = CLIENTES_SEED.find((c) => c.id === dte.clienteId);
      if (!cliente) continue;
      const vendedor = VENDEDORES_SEED.find((v) => v.id === cliente.vendedorId);
      const total = computeTotals(dte.lineas).total;
      const actual = mapa.get(cliente.vendedorId) ?? {
        vendedorId: cliente.vendedorId,
        nombre: vendedor?.nombre ?? "Sin asignar",
        cantidad: 0,
        total: 0,
      };
      actual.cantidad += 1;
      actual.total += total;
      mapa.set(cliente.vendedorId, actual);
    }
    return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
  }, [ventasCertificadas]);

  const porCliente = useMemo<FilaCliente[]>(() => {
    const mapa = new Map<string, FilaCliente>();
    for (const dte of ventasCertificadas) {
      const cliente = CLIENTES_SEED.find((c) => c.id === dte.clienteId);
      const total = computeTotals(dte.lineas).total;
      const actual = mapa.get(dte.clienteId) ?? {
        clienteId: dte.clienteId,
        nombre: cliente?.nombreComercial ?? "—",
        cantidad: 0,
        total: 0,
      };
      actual.cantidad += 1;
      actual.total += total;
      mapa.set(dte.clienteId, actual);
    }
    return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
  }, [ventasCertificadas]);

  const compras = useMemo<FilaProveedor[]>(() => {
    const mapa = new Map<string, FilaProveedor>();
    for (const f of facturasProveedor) {
      const proveedor = PROVEEDORES_SEED.find((p) => p.id === f.proveedorId);
      const actual = mapa.get(f.proveedorId) ?? {
        proveedorId: f.proveedorId,
        nombre: proveedor?.nombreComercial ?? "—",
        cantidad: 0,
        total: 0,
      };
      actual.cantidad += 1;
      actual.total += f.monto;
      mapa.set(f.proveedorId, actual);
    }
    return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
  }, [facturasProveedor]);

  const kardexValorizado = useMemo<FilaKardex[]>(() => {
    return existencias
      .filter((e) => e.cantidad > 0)
      .map((e) => {
        const producto = PRODUCTOS_SEED.find((p) => p.id === e.productoId);
        const locacion = LOCACIONES_SEED.find((l) => l.id === e.locacionId);
        return {
          productoId: e.productoId,
          locacionId: e.locacionId,
          sku: producto?.sku ?? "—",
          nombre: producto?.nombre ?? "—",
          locacionNombre: locacion?.nombre ?? "—",
          cantidad: e.cantidad,
          costoPromedio: e.costoPromedio,
          valor: Math.round(e.cantidad * e.costoPromedio * 100) / 100,
        };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [existencias]);

  const totalVentas = ventasCertificadas.reduce((s, d) => s + computeTotals(d.lineas).total, 0);
  const totalCompras = facturasProveedor.reduce((s, f) => s + f.monto, 0);
  const totalInventario = kardexValorizado.reduce((s, f) => s + f.valor, 0);

  const columnsPeriodo: DataTableColumn<FilaPeriodo>[] = [
    { key: "periodo", header: "Período", cell: (f) => <span className="font-data font-medium">{f.periodo}</span> },
    { key: "cantidad", header: "Facturas", align: "right", cell: (f) => f.cantidad },
    { key: "base", header: "Base gravable", align: "right", cell: (f) => <MoneyCell amount={f.base} /> },
    { key: "iva", header: "IVA", align: "right", cell: (f) => <MoneyCell amount={f.iva} /> },
    { key: "total", header: "Total", align: "right", cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" /> },
  ];

  const columnsVendedor: DataTableColumn<FilaVendedor>[] = [
    { key: "nombre", header: "Vendedor", cell: (f) => f.nombre },
    { key: "cantidad", header: "Facturas", align: "right", cell: (f) => f.cantidad },
    { key: "total", header: "Total vendido", align: "right", cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" /> },
  ];

  const columnsCliente: DataTableColumn<FilaCliente>[] = [
    { key: "nombre", header: "Cliente", cell: (f) => f.nombre },
    { key: "cantidad", header: "Facturas", align: "right", cell: (f) => f.cantidad },
    { key: "total", header: "Total comprado", align: "right", cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" /> },
  ];

  const columnsCompras: DataTableColumn<FilaProveedor>[] = [
    { key: "nombre", header: "Proveedor", cell: (f) => f.nombre },
    { key: "cantidad", header: "Facturas", align: "right", cell: (f) => f.cantidad },
    { key: "total", header: "Total comprado", align: "right", cell: (f) => <MoneyCell amount={f.total} className="font-semibold text-slate-900" /> },
  ];

  const columnsKardex: DataTableColumn<FilaKardex>[] = [
    { key: "sku", header: "SKU", cellClassName: "whitespace-nowrap", cell: (f) => <span className="font-data">{f.sku}</span> },
    { key: "producto", header: "Producto", cell: (f) => f.nombre },
    { key: "locacion", header: "Locación", cell: (f) => f.locacionNombre },
    { key: "cantidad", header: "Cantidad", align: "right", cell: (f) => f.cantidad.toLocaleString("es-GT") },
    { key: "costo", header: "Costo promedio", align: "right", cell: (f) => <MoneyCell amount={f.costoPromedio} /> },
    { key: "valor", header: "Valor total", align: "right", cell: (f) => <MoneyCell amount={f.valor} className="font-semibold text-slate-900" /> },
  ];

  return (
    <div>
      <PageHeader title="Reportería" description="Ventas, compras e inventario valorizado, con exportación a CSV" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Ventas certificadas" value={`Q ${totalVentas.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`} icon={TrendingUp} tone="success" />
        <KpiCard label="Compras registradas" value={`Q ${totalCompras.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`} icon={ShoppingCart} tone="accent" />
        <KpiCard label="Inventario valorizado" value={`Q ${totalInventario.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`} icon={Package} tone="warning" />
      </div>

      <Tabs defaultSelectedKey="periodo">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Secciones de reportería">
            <Tabs.Tab id="periodo">
              Ventas por período
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="vendedor">
              Ventas por vendedor
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="cliente">
              Ventas por cliente
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="compras">
              Compras
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="kardex">
              Kardex valorizado
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="periodo" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              variant="secondary"
              onPress={() =>
                downloadCsv(
                  "ventas-por-periodo.csv",
                  ["Período", "Facturas", "Base gravable", "IVA", "Total"],
                  porPeriodo.map((f) => [f.periodo, String(f.cantidad), f.base.toFixed(2), f.iva.toFixed(2), f.total.toFixed(2)]),
                )
              }
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>
          <DataTable ariaLabel="Ventas por período" columns={columnsPeriodo} rows={porPeriodo} getRowId={(f) => f.periodo} emptyTitle="Sin ventas registradas" />
        </Tabs.Panel>

        <Tabs.Panel id="vendedor" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              variant="secondary"
              onPress={() =>
                downloadCsv(
                  "ventas-por-vendedor.csv",
                  ["Vendedor", "Facturas", "Total vendido"],
                  porVendedor.map((f) => [f.nombre, String(f.cantidad), f.total.toFixed(2)]),
                )
              }
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>
          <DataTable ariaLabel="Ventas por vendedor" columns={columnsVendedor} rows={porVendedor} getRowId={(f) => f.vendedorId} emptyTitle="Sin ventas registradas" />
        </Tabs.Panel>

        <Tabs.Panel id="cliente" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              variant="secondary"
              onPress={() =>
                downloadCsv(
                  "ventas-por-cliente.csv",
                  ["Cliente", "Facturas", "Total comprado"],
                  porCliente.map((f) => [f.nombre, String(f.cantidad), f.total.toFixed(2)]),
                )
              }
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>
          <DataTable ariaLabel="Ventas por cliente" columns={columnsCliente} rows={porCliente} getRowId={(f) => f.clienteId} pageSize={40} emptyTitle="Sin ventas registradas" />
        </Tabs.Panel>

        <Tabs.Panel id="compras" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              variant="secondary"
              onPress={() =>
                downloadCsv(
                  "compras-por-proveedor.csv",
                  ["Proveedor", "Facturas", "Total comprado"],
                  compras.map((f) => [f.nombre, String(f.cantidad), f.total.toFixed(2)]),
                )
              }
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>
          <DataTable ariaLabel="Compras por proveedor" columns={columnsCompras} rows={compras} getRowId={(f) => f.proveedorId} emptyTitle="Sin compras registradas" />
        </Tabs.Panel>

        <Tabs.Panel id="kardex" className="pt-4">
          <div className="mb-3 flex justify-end">
            <Button
              variant="secondary"
              onPress={() =>
                downloadCsv(
                  "kardex-valorizado.csv",
                  ["SKU", "Producto", "Locación", "Cantidad", "Costo promedio", "Valor total"],
                  kardexValorizado.map((f) => [
                    f.sku,
                    f.nombre,
                    f.locacionNombre,
                    String(f.cantidad),
                    f.costoPromedio.toFixed(2),
                    f.valor.toFixed(2),
                  ]),
                )
              }
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </div>
          <DataTable ariaLabel="Kardex valorizado" columns={columnsKardex} rows={kardexValorizado} getRowId={(f) => `${f.productoId}-${f.locacionId}`} pageSize={50} emptyTitle="Sin existencias" />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
