import type { Moneda } from "./common";

export interface LineaVenta {
  id: string;
  productoId: string;
  unidadMedidaId: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  costoUnitario: number;
}

export type EstadoCotizacion =
  | "Borrador"
  | "Enviada"
  | "Aprobada"
  | "Rechazada"
  | "Convertida"
  | "Vencida";

export interface Cotizacion {
  id: string;
  folio: string;
  clienteId: string;
  vendedorId: string;
  estado: EstadoCotizacion;
  moneda: Moneda;
  condicionPago: string;
  vigenciaDias: number;
  fechaEmision: string;
  fechaVencimiento: string;
  lineas: LineaVenta[];
  notas: string;
  pedidoId?: string;
}

export type EstadoPedido =
  | "Pendiente"
  | "En preparacion"
  | "Listo para despacho"
  | "Despachado parcial"
  | "Despachado"
  | "Facturado"
  | "Cancelado";

export interface Pedido {
  id: string;
  folio: string;
  clienteId: string;
  vendedorId: string;
  cotizacionId?: string;
  estado: EstadoPedido;
  moneda: Moneda;
  bodegaId: string;
  fechaPedido: string;
  fechaEntregaComprometida: string;
  lineas: LineaVenta[];
  direccionEntrega: string;
  prioridad: "Alta" | "Normal" | "Baja";
}

export type EstadoDespacho = "Programado" | "En ruta" | "Entregado" | "Con incidencia";

export interface Despacho {
  id: string;
  folio: string;
  pedidoId: string;
  clienteId: string;
  transportistaId: string;
  vehiculoId: string;
  rutaId: string;
  estado: EstadoDespacho;
  fechaProgramada: string;
  fechaEntrega?: string;
  bultos: number;
  pesoTotalKg: number;
  firmaReceptor?: string;
}

export type EstadoDevolucion = "Solicitada" | "En revision" | "Aprobada" | "Rechazada" | "Completada";
export type MotivoDevolucion =
  | "Producto danado"
  | "Error en pedido"
  | "No cumple especificacion"
  | "Exceso de inventario del cliente"
  | "Vencimiento";

export interface Devolucion {
  id: string;
  folio: string;
  pedidoId: string;
  clienteId: string;
  motivo: MotivoDevolucion;
  estado: EstadoDevolucion;
  fechaSolicitud: string;
  montoGTQ: number;
  lineas: LineaVenta[];
  requiereNotaCredito: boolean;
}
