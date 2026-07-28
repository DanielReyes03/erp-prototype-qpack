export interface Bodega {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Central" | "Regional" | "Transito" | "Consignacion";
  municipio: string;
  responsable: string;
  ubicaciones: number;
  activa: boolean;
}

export interface Ubicacion {
  id: string;
  bodegaId: string;
  codigo: string;
  pasillo: string;
  nivel: string;
  capacidadPaletas: number;
  ocupacionPct: number;
}

export interface Lote {
  id: string;
  codigo: string;
  productoId: string;
  bodegaId: string;
  cantidadInicial: number;
  cantidadDisponible: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
  ordenCompraId?: string;
}

export interface Existencia {
  id: string;
  productoId: string;
  bodegaId: string;
  disponible: number;
  reservado: number;
  enTransito: number;
  backorder: number;
  stockMinimo: number;
  ultimaActualizacion: string;
}

export type TipoMovimientoKardex =
  | "Entrada por compra"
  | "Salida por venta"
  | "Ajuste positivo"
  | "Ajuste negativo"
  | "Transferencia entrada"
  | "Transferencia salida"
  | "Devolucion cliente"
  | "Conteo fisico";

export interface MovimientoKardex {
  id: string;
  productoId: string;
  bodegaId: string;
  fecha: string;
  tipo: TipoMovimientoKardex;
  documentoReferencia: string;
  cantidad: number;
  saldoAcumulado: number;
  costoUnitario: number;
  usuario: string;
}

export interface Reserva {
  id: string;
  productoId: string;
  bodegaId: string;
  pedidoId: string;
  clienteId: string;
  cantidad: number;
  fechaReserva: string;
  vencimiento: string;
  estado: "Activa" | "Liberada" | "Consumida";
}

export interface Backorder {
  id: string;
  productoId: string;
  clienteId: string;
  pedidoId: string;
  cantidadPendiente: number;
  fechaOrigen: string;
  fechaEstimadaSurtido?: string;
  origenReposicion: "Orden local" | "Importacion";
  estado: "Pendiente" | "Parcial" | "Surtido";
}

export interface Transferencia {
  id: string;
  folio: string;
  bodegaOrigenId: string;
  bodegaDestinoId: string;
  fecha: string;
  estado: "Solicitada" | "En transito" | "Recibida" | "Cancelada";
  items: { productoId: string; cantidad: number }[];
  responsable: string;
}

export interface AjusteInventario {
  id: string;
  folio: string;
  bodegaId: string;
  fecha: string;
  tipo: "Positivo" | "Negativo";
  motivo: string;
  items: { productoId: string; cantidad: number; costoUnitario: number }[];
  autorizadoPor: string;
  estado: "Borrador" | "Aplicado";
}

export interface ConteoFisico {
  id: string;
  folio: string;
  bodegaId: string;
  fechaProgramada: string;
  estado: "Programado" | "En proceso" | "Cerrado con diferencias" | "Cerrado sin diferencias";
  responsable: string;
  items: { productoId: string; cantidadSistema: number; cantidadContada: number | null }[];
}
