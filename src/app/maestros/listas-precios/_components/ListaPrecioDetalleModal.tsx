"use client";

import { useMemo, useState } from "react";
import { Modal, NumberField, SearchField, Button, toast } from "@heroui/react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/patterns/EmptyState";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { PRODUCTOS_SEED } from "@/lib/seed/productos";
import type { ListaPrecio } from "@/lib/seed/listas-precios";

interface ListaPrecioDetalleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lista?: ListaPrecio;
}

export function ListaPrecioDetalleModal({
  isOpen,
  onOpenChange,
  lista,
}: ListaPrecioDetalleModalProps) {
  const precios = useListasPreciosStore((s) => s.precios);
  const setPrecio = useListasPreciosStore((s) => s.setPrecio);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!lista) return [];
    const q = search.trim().toLowerCase();
    return PRODUCTOS_SEED.filter(
      (p) => !q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    ).map((p) => ({
      producto: p,
      precio: precios.find((pr) => pr.listaId === lista.id && pr.productoId === p.id)?.precio ?? 0,
    }));
  }, [lista, precios, search]);

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg" scroll="inside">
        <Modal.Dialog aria-label="Detalle de lista de precios" className="sm:max-w-[720px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{lista?.nombre}</Modal.Heading>
            <p className="text-sm text-slate-500">
              Precio unitario por producto en {lista?.moneda}. Los cambios se guardan al instante.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <SearchField aria-label="Buscar producto" value={search} onChange={setSearch}>
              <SearchField.Group>
                <SearchField.SearchIcon>
                  <Search className="size-4 text-slate-500" />
                </SearchField.SearchIcon>
                <SearchField.Input placeholder="Buscar producto o SKU…" />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <div className="max-h-[420px] overflow-y-auto rounded-md border border-slate-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="h-9 bg-navy-900 text-left text-[11px] font-medium tracking-wide text-white/90 uppercase">
                    <th className="px-3">Producto</th>
                    <th className="w-32 px-3 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={2}>
                        <EmptyState title="Sin resultados" />
                      </td>
                    </tr>
                  ) : (
                    rows.map(({ producto, precio }) => (
                      <tr key={producto.id} className="h-10 border-b border-slate-200 last:border-0">
                        <td className="px-3">
                          <div className="flex flex-col">
                            <span className="text-slate-900">{producto.nombre}</span>
                            <span className="font-data text-xs text-slate-500">{producto.sku}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1">
                          <NumberField
                            aria-label={`Precio de ${producto.nombre}`}
                            className="ms-auto w-28"
                            value={precio}
                            minValue={0}
                            formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                            onChange={(v) => {
                              if (!lista || v === undefined) return;
                              void setPrecio(lista.id, producto.id, v);
                            }}
                          >
                            <NumberField.Group>
                              <NumberField.Input className="col-span-3 text-right" />
                            </NumberField.Group>
                          </NumberField>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="tertiary"
              onPress={() => {
                onOpenChange(false);
                toast.success("Precios actualizados", { description: lista?.nombre });
              }}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
