"use client";

import { useEffect } from "react";
import { useClientesStore } from "@/lib/store/clientes";
import { useProveedoresStore } from "@/lib/store/proveedores";
import { useVendedoresStore } from "@/lib/store/vendedores";
import { useProductosStore } from "@/lib/store/productos";
import { useListasPreciosStore } from "@/lib/store/listas-precios";
import { useLocacionesStore } from "@/lib/store/locaciones";
import { useInventarioStore } from "@/lib/store/inventario";
import { useOrdenesVentaStore } from "@/lib/store/ordenes-venta";
import { useRutasStore } from "@/lib/store/rutas";
import { useCotizacionesStore } from "@/lib/store/cotizaciones";
import { useOrdenesCompraStore } from "@/lib/store/ordenes-compra";
import { useFacturasProveedorStore } from "@/lib/store/facturas-proveedor";
import { useOportunidadesStore } from "@/lib/store/oportunidades";
import { useActividadesStore } from "@/lib/store/actividades";
import { useReclamosStore } from "@/lib/store/reclamos";
import { useDteStore } from "@/lib/store/dte";
import { useTesoreriaStore } from "@/lib/store/tesoreria";
import { useCxcStore } from "@/lib/store/cxc";
import { useCxpStore } from "@/lib/store/cxp";
import { useContabilidadStore } from "@/lib/store/contabilidad";
import { useSeguridadStore } from "@/lib/store/seguridad";
import { useUiStore } from "@/lib/store/ui";

const STORES = [
  useClientesStore,
  useProveedoresStore,
  useVendedoresStore,
  useProductosStore,
  useListasPreciosStore,
  useLocacionesStore,
  useInventarioStore,
  useOrdenesVentaStore,
  useRutasStore,
  useCotizacionesStore,
  useOrdenesCompraStore,
  useFacturasProveedorStore,
  useOportunidadesStore,
  useActividadesStore,
  useReclamosStore,
  useDteStore,
  useTesoreriaStore,
  useCxcStore,
  useCxpStore,
  useContabilidadStore,
  useSeguridadStore,
  useUiStore,
];

/**
 * Todos los stores usan `persist` con `skipHydration: true` para evitar el
 * mismatch de hidratación de Next.js (el HTML del servidor siempre usa los
 * datos semilla; localStorage solo existe en el navegador). Este componente
 * dispara la rehidratación real una sola vez, ya montado en el cliente, para
 * que la primera pintura del cliente coincida exactamente con el servidor.
 */
export function StoreHydrator() {
  useEffect(() => {
    for (const store of STORES) {
      store.persist.rehydrate();
    }
  }, []);

  return null;
}
