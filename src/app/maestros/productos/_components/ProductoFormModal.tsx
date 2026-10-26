"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormTextField, FormSelect, FormNumberField, FormSwitch } from "@/components/patterns/form-fields";
import { useProductosStore } from "@/lib/store/productos";
import { CATEGORIAS_PRODUCTO, type Producto } from "@/lib/seed/productos";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import {
  productoSchema,
  EMPTY_PRODUCTO_FORM,
  UNIDADES_MEDIDA,
  type ProductoFormValues,
} from "./producto-schema";

interface ProductoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  producto?: Producto;
}

function toFormValues(p: Producto): ProductoFormValues {
  return {
    sku: p.sku,
    nombre: p.nombre,
    categoria: p.categoria as ProductoFormValues["categoria"],
    unidadMedida: p.unidadMedida,
    proveedorId: p.proveedorId ?? "",
    costo: p.costo,
    precioBase: p.precioBase,
    puntoReorden: p.puntoReorden,
    stockMinimo: p.stockMinimo ?? p.puntoReorden,
    stockMaximo: p.stockMaximo ?? p.puntoReorden * 3,
    activo: p.activo,
  };
}

export function ProductoFormModal({ isOpen, onOpenChange, producto }: ProductoFormModalProps) {
  const createProducto = useProductosStore((s) => s.createProducto);
  const updateProducto = useProductosStore((s) => s.updateProducto);
  const isEditing = !!producto;

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? toFormValues(producto) : EMPTY_PRODUCTO_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(producto ? toFormValues(producto) : EMPTY_PRODUCTO_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, producto]);

  async function handleSubmit(values: ProductoFormValues) {
    if (isEditing && producto) {
      await updateProducto(producto.id, values);
      toast.success("Producto actualizado", { description: values.nombre });
    } else {
      await createProducto(values);
      toast.success("Producto creado", { description: values.nombre });
    }
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar producto" : "Nuevo producto"}
      size="lg"
      form={form}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear producto"}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormTextField
          control={form.control}
          name="sku"
          label="SKU"
          placeholder="RES-PEAD-25K"
          isRequired
        />
        <FormSelect
          control={form.control}
          name="categoria"
          label="Categoría"
          isRequired
          options={CATEGORIAS_PRODUCTO.map((c) => ({ id: c, label: c }))}
        />
      </div>
      <FormTextField control={form.control} name="nombre" label="Descripción" isRequired />
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={form.control}
          name="unidadMedida"
          label="Unidad de medida"
          isRequired
          options={UNIDADES_MEDIDA.map((u) => ({ id: u, label: u }))}
        />
        <FormSelect
          control={form.control}
          name="proveedorId"
          label="Proveedor"
          isRequired
          options={PROVEEDORES_SEED.filter((p) => p.activo).map((p) => ({
            id: p.id,
            label: p.nombreComercial,
          }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormNumberField
          control={form.control}
          name="costo"
          label="Costo (GTQ)"
          minValue={0}
          formatOptions={{ minimumFractionDigits: 2 }}
          isRequired
        />
        <FormNumberField
          control={form.control}
          name="precioBase"
          label="Precio base (GTQ)"
          minValue={0}
          formatOptions={{ minimumFractionDigits: 2 }}
          isRequired
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormNumberField
          control={form.control}
          name="stockMinimo"
          label="Stock mínimo"
          minValue={0}
          isRequired
        />
        <FormNumberField
          control={form.control}
          name="stockMaximo"
          label="Stock máximo"
          minValue={0}
          isRequired
        />
        <FormNumberField
          control={form.control}
          name="puntoReorden"
          label="Punto de reorden"
          minValue={0}
          isRequired
        />
      </div>
      <p className="text-xs text-slate-500">
        El punto de reorden dispara la alerta de reabastecimiento; los stocks mínimo y máximo
        definen el rango objetivo de existencias.
      </p>
      <FormSwitch control={form.control} name="activo" label="Producto activo" />
    </FormModal>
  );
}
