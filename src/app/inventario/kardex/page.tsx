"use client";

import { useMemo, useState } from "react";
import { Select, ListBox, Label } from "@heroui/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/patterns/DataTable";
import { MoneyCell } from "@/components/patterns/MoneyCell";
import { EmptyState } from "@/components/patterns/EmptyState";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { useInventarioStore } from "@/lib/store/inventario";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import { LOCACIONES_SEED } from "@/lib/seed/locaciones";
import type { MovimientoInventario } from "@/lib/seed/kardex";

const TIPO_LABEL: Record<string, string> = {
  entrada: "Entrada por compra",
  salida: "Salida por venta",
  "ajuste-positivo": "Ajuste positivo",
  "ajuste-negativo": "Ajuste negativo",
  "traslado-salida": "Traslado (salida)",
  "traslado-entrada": "Traslado (entrada)",
};

function esEntrada(tipo: string) {
  return tipo === "entrada" || tipo === "ajuste-positivo" || tipo === "traslado-entrada";
}

export default function KardexPage() {
  const movimientos = useInventarioStore((s) => s.movimientos);
  const [productoId, setProductoId] = useState<string>(PRODUCTOS_SEED[0].id);
  const [locacionId, setLocacionId] = useState<string>("");

  const producto = PRODUCTOS_SEED.find((p) => p.id === productoId);

  const rows = useMemo(() => {
    return movimientos
      .filter((m) => m.productoId === productoId)
      .filter((m) => !locacionId || m.locacionId === locacionId)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [movimientos, productoId, locacionId]);

  const columns: DataTableColumn<MovimientoInventario>[] = [
    {
      key: "fecha",
      header: "Fecha",
      cellClassName: "whitespace-nowrap",
      cell: (m) => <span className="font-data text-xs">{formatDateTime(m.fecha)}</span>,
    },
    {
      key: "tipo",
      header: "Movimiento",
      cell: (m) => (
        <div className="flex items-center gap-1.5">
          {esEntrada(m.tipo) ? (
            <ArrowDownRight className="size-3.5 text-[#059669]" />
          ) : (
            <ArrowUpRight className="size-3.5 text-[#DC2626]" />
          )}
          {TIPO_LABEL[m.tipo] ?? m.tipo}
        </div>
      ),
    },
    { key: "locacion", header: "Locación", cell: (m) => LOCACIONES_SEED.find((l) => l.id === m.locacionId)?.nombre },
    { key: "documento", header: "Documento", cell: (m) => <span className="font-data">{m.documentoReferencia ?? "—"}</span> },
    { key: "motivo", header: "Motivo", cell: (m) => m.motivo },
    {
      key: "entrada",
      header: "Entrada",
      align: "right",
      cell: (m) =>
        esEntrada(m.tipo) ? (
          <span className="font-data text-[#059669]">+{m.cantidad.toLocaleString("en-US")}</span>
        ) : (
          ""
        ),
    },
    {
      key: "salida",
      header: "Salida",
      align: "right",
      cell: (m) =>
        !esEntrada(m.tipo) ? (
          <span className="font-data text-[#DC2626]">-{m.cantidad.toLocaleString("en-US")}</span>
        ) : (
          ""
        ),
    },
    {
      key: "costo",
      header: "Costo unitario",
      align: "right",
      cell: (m) => <MoneyCell amount={m.costoUnitario} />,
    },
    {
      key: "saldo",
      header: "Saldo",
      align: "right",
      cell: (m) => <span className="font-data font-medium">{m.saldoCantidad.toLocaleString("en-US")}</span>,
    },
    {
      key: "saldoCosto",
      header: "Costo prom. saldo",
      align: "right",
      cell: (m) => <MoneyCell amount={m.saldoCostoPromedio} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kardex"
        description="Movimientos de inventario por producto, con costo promedio ponderado recalculado en vivo"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white shadow-surface p-4 sm:grid-cols-2">
        <Select
          className="flex flex-col gap-1"
          placeholder="Seleccionar producto"
          value={productoId}
          onChange={(k) => k && setProductoId(String(k))}
        >
          <Label>Producto</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PRODUCTOS_SEED.map((p) => (
                <ListBox.Item key={p.id} id={p.id} textValue={`${p.sku} ${p.nombre}`}>
                  <div className="flex flex-col">
                    <span>{p.nombre}</span>
                    <span className="font-data text-xs text-slate-500">{p.sku}</span>
                  </div>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          className="flex flex-col gap-1"
          placeholder="Todas las locaciones"
          value={locacionId || null}
          onChange={(k) => setLocacionId(k ? String(k) : "")}
        >
          <Label>Locación</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {LOCACIONES_SEED.map((l) => (
                <ListBox.Item key={l.id} id={l.id} textValue={l.nombre}>
                  {l.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {producto ? (
        <div
          className={cn(
            "mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white shadow-surface p-4",
          )}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{producto.nombre}</p>
            <p className="font-data text-xs text-slate-500">{producto.sku}</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-500">Movimientos</p>
              <p className="font-data text-sm font-medium">{rows.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo actual</p>
              <p className="font-data text-sm font-medium">
                {(rows.at(-1)?.saldoCantidad ?? 0).toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Costo promedio</p>
              <p className="font-data text-sm font-medium">
                <MoneyCell amount={rows.at(-1)?.saldoCostoPromedio ?? 0} />
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="Sin movimientos"
          description="Este producto no tiene movimientos de kardex registrados en la locación seleccionada."
        />
      ) : (
        <DataTable
          ariaLabel="Kardex del producto seleccionado"
          columns={columns}
          rows={rows}
          getRowId={(m) => m.id}
          pageSize={30}
        />
      )}
    </div>
  );
}
