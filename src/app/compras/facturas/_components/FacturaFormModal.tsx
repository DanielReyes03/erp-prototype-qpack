"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { FormModal } from "@/components/patterns/FormModal";
import { FormSelect, FormTextField, FormNumberField } from "@/components/patterns/form-fields";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { PROVEEDORES_SEED } from "@/lib/seed/proveedores";
import { facturaSchema, EMPTY_FACTURA_FORM, type FacturaFormValues } from "./factura-schema";

interface FacturaFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function totalOrdenCompra(lineas: { cantidad: number; costoUnitario: number }[]): number {
  const neto = lineas.reduce((sum, l) => sum + l.cantidad * l.costoUnitario, 0);
  return Math.round(neto * 1.12 * 100) / 100;
}

export function FacturaFormModal({ isOpen, onOpenChange }: FacturaFormModalProps) {
  const crearFactura = useFacturasProveedorStore((s) => s.crearFactura);
  const ordenesCompra = useOrdenesCompraStore((s) => s.ordenes);
  const facturas = useFacturasProveedorStore((s) => s.facturas);

  const form = useForm<FacturaFormValues>({
    resolver: zodResolver(facturaSchema),
    defaultValues: EMPTY_FACTURA_FORM,
  });

  useEffect(() => {
    if (isOpen) form.reset(EMPTY_FACTURA_FORM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const proveedorId = form.watch("proveedorId");
  const ordenCompraId = form.watch("ordenCompraId");

  const ordenesDisponibles = ordenesCompra.filter(
    (o) =>
      o.proveedorId === proveedorId &&
      o.estado === "recibida-total" &&
      !facturas.some((f) => f.ordenCompraId === o.id),
  );

  // Cambiar de proveedor invalida la OC seleccionada.
  useEffect(() => {
    if (ordenCompraId && !ordenesDisponibles.some((o) => o.id === ordenCompraId)) {
      form.setValue("ordenCompraId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorId]);

  // Al elegir la OC, prefijar monto y moneda con el total de la orden.
  useEffect(() => {
    const oc = ordenesCompra.find((o) => o.id === ordenCompraId);
    if (oc) {
      form.setValue("monto", totalOrdenCompra(oc.lineas), { shouldValidate: true });
      form.setValue("moneda", oc.moneda);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenCompraId]);

  async function handleSubmit(values: FacturaFormValues) {
    await crearFactura({
      proveedorId: values.proveedorId,
      ordenCompraId: values.ordenCompraId,
      serie: values.serie,
      numeroFactura: values.numeroFactura,
      monto: values.monto,
      moneda: values.moneda,
    });
    toast.success("Factura de proveedor registrada", {
      description: `${values.serie}-${values.numeroFactura}`,
    });
  }

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Registrar factura de proveedor"
      size="sm"
      form={form}
      onSubmit={handleSubmit}
      submitLabel="Registrar factura"
    >
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
      <FormSelect
        control={form.control}
        name="ordenCompraId"
        label="Orden de compra"
        isRequired
        options={ordenesDisponibles.map((o) => ({ id: o.id, label: o.id }))}
        placeholder={proveedorId ? "Selecciona una orden de compra" : "Elige un proveedor primero"}
        description="Solo se muestran órdenes recibidas totalmente y sin factura registrada"
      />
      <div className="grid grid-cols-3 gap-4">
        <FormTextField
          control={form.control}
          name="serie"
          label="Serie"
          placeholder="A"
          isRequired
        />
        <FormTextField
          control={form.control}
          name="numeroFactura"
          label="Número"
          className="col-span-2"
          isRequired
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormNumberField
          control={form.control}
          name="monto"
          label="Monto total"
          minValue={0}
          formatOptions={{ minimumFractionDigits: 2 }}
          isRequired
        />
        <FormSelect
          control={form.control}
          name="moneda"
          label="Moneda"
          isRequired
          options={[
            { id: "GTQ", label: "Quetzales (GTQ)" },
            { id: "USD", label: "Dólares (USD)" },
          ]}
        />
      </div>
    </FormModal>
  );
}
