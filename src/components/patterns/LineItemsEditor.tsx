"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Autocomplete,
  SearchField,
  ListBox,
  NumberField,
  Button,
  useFilter,
} from "@heroui/react";
import { cn } from "@/lib/cn";
import { formatMoney, round2, type Currency } from "@/lib/format";
import { EmptyState } from "./EmptyState";
import { nextId } from "@/lib/async";

export interface LineItemProduct {
  id: string;
  sku: string;
  nombre: string;
  precio: number;
  unidadMedida: string;
}

export interface LineItem {
  id: string;
  productoId: string;
  sku: string;
  nombre: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
}

export interface LineItemsTotals {
  subtotal: number;
  descuento: number;
  baseGravable: number;
  iva: number;
  total: number;
}

export function computeLineBase(item: LineItem): number {
  const bruto = item.cantidad * item.precioUnitario;
  const descuento = bruto * (item.descuentoPorcentaje / 100);
  return round2(bruto - descuento);
}

export function computeTotals(items: LineItem[], ivaRate = 0.12): LineItemsTotals {
  let subtotal = 0;
  let descuento = 0;
  for (const item of items) {
    const bruto = item.cantidad * item.precioUnitario;
    subtotal += bruto;
    descuento += bruto * (item.descuentoPorcentaje / 100);
  }
  const baseGravable = round2(subtotal - descuento);
  const iva = round2(baseGravable * ivaRate);
  return {
    subtotal: round2(subtotal),
    descuento: round2(descuento),
    baseGravable,
    iva,
    total: round2(baseGravable + iva),
  };
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products: LineItemProduct[];
  currency?: Currency;
  ivaRate?: number;
  isDisabled?: boolean;
}

/** Editor de líneas de documento: reutilizado en ventas, compras y DTE. */
export function LineItemsEditor({
  items,
  onChange,
  products,
  currency = "GTQ",
  ivaRate = 0.12,
  isDisabled = false,
}: LineItemsEditorProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  const totals = computeTotals(items, ivaRate);

  function addLine() {
    const first = products[0];
    if (!first) return;
    onChange([
      ...items,
      {
        id: nextId("line"),
        productoId: first.id,
        sku: first.sku,
        nombre: first.nombre,
        unidadMedida: first.unidadMedida,
        cantidad: 1,
        precioUnitario: first.precio,
        descuentoPorcentaje: 0,
      },
    ]);
  }

  function updateLine(id: string, patch: Partial<LineItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeLine(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  function selectProduct(id: string, productoId: string | null) {
    const product = products.find((p) => p.id === productoId);
    if (!product) return;
    updateLine(id, {
      productoId: product.id,
      sku: product.sku,
      nombre: product.nombre,
      unidadMedida: product.unidadMedida,
      precioUnitario: product.precio,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="h-10 border-b border-slate-200 border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <th className="px-3">Producto</th>
                <th className="w-24 px-3 text-right">Cantidad</th>
                <th className="w-32 px-3 text-right">Precio unit.</th>
                <th className="w-24 px-3 text-right">Desc. %</th>
                <th className="w-32 px-3 text-right">Subtotal</th>
                <th className="w-28 px-3 text-right">IVA</th>
                <th className="w-10 px-3" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Sin líneas agregadas"
                      description="Agrega al menos un producto para continuar."
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const base = computeLineBase(item);
                  const lineIva = round2(base * ivaRate);
                  return (
                    <tr key={item.id} className="h-12 border-b border-slate-200 last:border-0">
                      <td className="px-3 py-1.5">
                        <Autocomplete
                          aria-label="Producto"
                          className="w-full min-w-[220px]"
                          selectionMode="single"
                          value={item.productoId}
                          isDisabled={isDisabled}
                          onChange={(key) => selectProduct(item.id, key as string | null)}
                        >
                          <Autocomplete.Trigger>
                            <Autocomplete.Value>
                              {() => (
                                <span className="font-data truncate text-sm">
                                  {item.sku} — {item.nombre}
                                </span>
                              )}
                            </Autocomplete.Value>
                            <Autocomplete.Indicator />
                          </Autocomplete.Trigger>
                          <Autocomplete.Popover>
                            <Autocomplete.Filter filter={contains}>
                              <SearchField autoFocus name="search" variant="secondary">
                                <SearchField.Group>
                                  <SearchField.SearchIcon />
                                  <SearchField.Input placeholder="Buscar producto…" />
                                  <SearchField.ClearButton />
                                </SearchField.Group>
                              </SearchField>
                              <ListBox
                                renderEmptyState={() => (
                                  <EmptyState title="Sin resultados" />
                                )}
                              >
                                {products.map((p) => (
                                  <ListBox.Item
                                    key={p.id}
                                    id={p.id}
                                    textValue={`${p.sku} ${p.nombre}`}
                                  >
                                    <div className="flex min-w-0 flex-col">
                                      <span className="truncate text-sm">{p.nombre}</span>
                                      <span className="font-data text-xs text-slate-500">
                                        {p.sku} · {formatMoney(p.precio, currency)}
                                      </span>
                                    </div>
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Autocomplete.Filter>
                          </Autocomplete.Popover>
                        </Autocomplete>
                      </td>
                      <td className="px-3 py-1.5">
                        <NumberField
                          aria-label="Cantidad"
                          className="ms-auto w-24"
                          value={item.cantidad}
                          minValue={0}
                          isDisabled={isDisabled}
                          onChange={(v) => updateLine(item.id, { cantidad: v ?? 0 })}
                        >
                          <NumberField.Group>
                            <NumberField.Input className="col-span-3 text-right" />
                          </NumberField.Group>
                        </NumberField>
                      </td>
                      <td className="px-3 py-1.5">
                        <NumberField
                          aria-label="Precio unitario"
                          className="ms-auto w-32"
                          value={item.precioUnitario}
                          minValue={0}
                          formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                          isDisabled={isDisabled}
                          onChange={(v) => updateLine(item.id, { precioUnitario: v ?? 0 })}
                        >
                          <NumberField.Group>
                            <NumberField.Input className="col-span-3 text-right" />
                          </NumberField.Group>
                        </NumberField>
                      </td>
                      <td className="px-3 py-1.5">
                        <NumberField
                          aria-label="Descuento porcentual"
                          className="ms-auto w-24"
                          value={item.descuentoPorcentaje}
                          minValue={0}
                          maxValue={100}
                          isDisabled={isDisabled}
                          onChange={(v) => updateLine(item.id, { descuentoPorcentaje: v ?? 0 })}
                        >
                          <NumberField.Group>
                            <NumberField.Input className="col-span-3 text-right" />
                          </NumberField.Group>
                        </NumberField>
                      </td>
                      <td className="font-data px-3 py-1.5 text-right text-slate-900">
                        {formatMoney(base, currency)}
                      </td>
                      <td className="font-data px-3 py-1.5 text-right text-slate-500">
                        {formatMoney(lineIva, currency)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          aria-label="Quitar línea"
                          isDisabled={isDisabled}
                          onPress={() => removeLine(item.id)}
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 p-2">
          <Button
            variant="ghost"
            size="sm"
            isDisabled={isDisabled || products.length === 0}
            onPress={addLine}
          >
            <Plus className="size-4" />
            Agregar línea
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className={cn("w-full max-w-xs space-y-1.5 rounded-xl border border-slate-200 bg-white shadow-surface p-4")}>
          <TotalRow label="Subtotal" value={totals.subtotal} currency={currency} />
          {totals.descuento > 0 ? (
            <TotalRow label="Descuento" value={-totals.descuento} currency={currency} />
          ) : null}
          <TotalRow label="Base gravable" value={totals.baseGravable} currency={currency} />
          <TotalRow label={`IVA (${Math.round(ivaRate * 100)}%)`} value={totals.iva} currency={currency} />
          <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1.5">
            <span className="text-sm font-semibold text-slate-900">Total</span>
            <span className="font-data text-base font-semibold text-blue-700">
              {formatMoney(totals.total, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  currency,
}: {
  label: string;
  value: number;
  currency: Currency;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-data text-sm text-slate-900">{formatMoney(value, currency)}</span>
    </div>
  );
}
