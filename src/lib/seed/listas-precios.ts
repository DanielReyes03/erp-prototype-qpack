export interface ListaPrecio {
  id: string;
  nombre: string;
  moneda: "GTQ" | "USD";
  descripcion: string;
}

/**
 * Cabeceras de listas de precios. El detalle por producto (precio unitario)
 * se genera en el seed de productos, ya que depende del catálogo.
 */
export const LISTAS_PRECIOS_SEED: ListaPrecio[] = [
  {
    id: "lp-general",
    nombre: "Lista General",
    moneda: "GTQ",
    descripcion: "Precios de mostrador para clientes minoristas",
  },
  {
    id: "lp-mayoreo",
    nombre: "Lista Mayoreo",
    moneda: "GTQ",
    descripcion: "Precios preferenciales por volumen para distribuidores",
  },
  {
    id: "lp-vip",
    nombre: "Distribuidores VIP",
    moneda: "GTQ",
    descripcion: "Clientes con convenio anual y descuento adicional",
  },
  {
    id: "lp-export",
    nombre: "Exportación USD",
    moneda: "USD",
    descripcion: "Lista en dólares para clientes de la región CA-4",
  },
];
