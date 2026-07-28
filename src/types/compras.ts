import type { Incoterm, Moneda } from "./common";

export interface LineaCompra {
  id: string;
  productoId: string;
  cantidad: number;
  unidadMedidaId: string;
  costoUnitario: number;
  pesoKg: number;
  volumenM3: number;
}

export type EstadoOrdenLocal = "Borrador" | "Enviada" | "Confirmada" | "Recibida parcial" | "Recibida" | "Cancelada";

export interface OrdenCompraLocal {
  id: string;
  folio: string;
  proveedorId: string;
  bodegaDestinoId: string;
  estado: EstadoOrdenLocal;
  moneda: Moneda;
  fechaEmision: string;
  fechaEntregaEstimada: string;
  lineas: LineaCompra[];
  solicitadoPor: string;
}

export type EstadoOrdenImportacion =
  | "Borrador"
  | "Enviada a proveedor"
  | "Confirmada"
  | "En produccion"
  | "Lista para embarque"
  | "Embarcada"
  | "Cerrada"
  | "Cancelada";

export interface OrdenImportacion {
  id: string;
  folio: string;
  proveedorId: string;
  incoterm: Incoterm;
  moneda: Moneda;
  estado: EstadoOrdenImportacion;
  fechaEmision: string;
  fechaEmbarqueEstimada: string;
  lineas: LineaCompra[];
  embarqueId?: string;
  paisOrigen: string;
}

export type EstadoEmbarque =
  | "Reservado"
  | "Cargado"
  | "En transito maritimo"
  | "Arribado a puerto"
  | "En tramite aduanal"
  | "Liberado"
  | "En transito terrestre"
  | "Recibido en bodega";

export interface Embarque {
  id: string;
  folio: string;
  navieraId: string;
  contenedorId: string;
  numeroBl: string;
  incoterm: Incoterm;
  puertoOrigen: string;
  puertoDestino: string;
  agenteAduaneroId: string;
  etd: string;
  eta: string;
  estado: EstadoEmbarque;
  ordenesImportacionIds: string[];
  ducaNumero?: string;
  observaciones: string;
}

export type CategoriaGastoEmbarque =
  | "Flete internacional"
  | "Seguro"
  | "DAI"
  | "IVA importacion"
  | "Honorarios agente aduanero"
  | "Transporte local"
  | "Almacenaje"
  | "Otros";

export interface GastoEmbarque {
  id: string;
  embarqueId: string;
  categoria: CategoriaGastoEmbarque;
  descripcion: string;
  montoEstimadoGTQ: number;
  montoRealGTQ: number;
  moneda: Moneda;
  proveedorId?: string;
  documentoReferencia?: string;
}

export type MetodoProrrateo = "valor" | "peso" | "volumen";

export interface CosteoImportacion {
  id: string;
  embarqueId: string;
  metodoProrrateo: MetodoProrrateo;
  fechaCosteo: string;
  estado: "Estimado" | "Cerrado";
  items: {
    productoId: string;
    cantidad: number;
    valorFobGTQ: number;
    pesoKg: number;
    volumenM3: number;
    costoUnitarioEstimado: number;
    costoUnitarioReal: number;
  }[];
}

export type EstadoRecepcion = "Pendiente" | "En proceso" | "Completa" | "Con diferencias";

export interface Recepcion {
  id: string;
  folio: string;
  origenTipo: "Orden local" | "Embarque";
  origenId: string;
  bodegaId: string;
  fecha: string;
  estado: EstadoRecepcion;
  recibidoPor: string;
  items: {
    productoId: string;
    cantidadEsperada: number;
    cantidadRecibida: number;
    loteCodigo?: string;
  }[];
}
