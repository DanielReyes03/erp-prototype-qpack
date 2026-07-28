import type { Moneda } from "./common";

export interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "peso" | "volumen" | "conteo" | "longitud";
  factorConversionBase: number;
  unidadBaseId?: string;
}

export interface PartidaArancelaria {
  id: string;
  codigo: string;
  descripcion: string;
  derechoArancelarioPct: number;
  unidadMedidaOficial: string;
}

export type CategoriaProducto =
  | "Resinas"
  | "Empaque flexible"
  | "Envase rigido"
  | "Film y laminados"
  | "Bolsas industriales"
  | "Menaje y desechables"
  | "Accesorios";

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaProducto;
  unidadMedidaId: string;
  unidadMedidaSecundariaId?: string;
  partidaArancelariaId: string;
  proveedorPrincipalId: string;
  pesoKgUnitario: number;
  volumenM3Unitario: number;
  costoPromedioGTQ: number;
  precioListaGTQ: number;
  precioListaUSD: number;
  stockMinimo: number;
  activo: boolean;
  imagenColor: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nombreComercial: string;
  pais: string;
  contacto: string;
  correo: string;
  telefono: string;
  incotermHabitual: string;
  moneda: Moneda;
  diasCredito: number;
  calificacion: number;
  activo: boolean;
}

export interface Vendedor {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  zona: string;
  metaMensualGTQ: number;
  ventaAcumuladaGTQ: number;
  comisionPct: number;
  activo: boolean;
}

export interface ListaPrecios {
  id: string;
  nombre: string;
  moneda: Moneda;
  tipoCliente: "Distribuidor" | "Mayorista" | "Minorista" | "Institucional";
  vigenteDesde: string;
  vigenteHasta?: string;
  activa: boolean;
  items: { productoId: string; precio: number; descuentoMaxPct: number }[];
}
