import type { Direccion } from "./common";

export type SegmentoCliente =
  | "Distribuidor"
  | "Mayorista"
  | "Minorista"
  | "Institucional"
  | "Industrial";

export interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  nombreComercial: string;
  nit: string;
  segmento: SegmentoCliente;
  vendedorId: string;
  direccion: Direccion;
  telefono: string;
  correo: string;
  limiteCreditoGTQ: number;
  saldoActualGTQ: number;
  diasCredito: number;
  listaPreciosId: string;
  fechaAlta: string;
  activo: boolean;
  carteraVencidaGTQ: number;
}

export type EstadoOportunidad =
  | "Prospeccion"
  | "Calificacion"
  | "Propuesta"
  | "Negociacion"
  | "Ganada"
  | "Perdida";

export interface Oportunidad {
  id: string;
  nombre: string;
  clienteId: string;
  vendedorId: string;
  estado: EstadoOportunidad;
  valorEstimadoGTQ: number;
  probabilidadPct: number;
  fechaCierreEstimada: string;
  origen: "Referido" | "Feria" | "Llamada fria" | "Sitio web" | "Recompra";
  productosInteres: string[];
  fechaCreacion: string;
  notas: string;
}

export type TipoActividad = "Llamada" | "Tarea" | "Reunion" | "Reclamo";
export type EstadoActividad = "Pendiente" | "En progreso" | "Completada" | "Vencida";

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  asunto: string;
  clienteId: string;
  oportunidadId?: string;
  responsableId: string;
  estado: EstadoActividad;
  prioridad: "Alta" | "Media" | "Baja";
  fechaProgramada: string;
  fechaCompletada?: string;
  descripcion: string;
  canalReclamo?: "Telefono" | "Correo" | "Visita" | "WhatsApp";
  severidadReclamo?: "Alta" | "Media" | "Baja";
}
