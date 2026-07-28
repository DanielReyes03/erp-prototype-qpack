export type Moneda = "GTQ" | "USD";

export type Incoterm =
  | "EXW"
  | "FOB"
  | "FCA"
  | "CFR"
  | "CIF"
  | "CIP"
  | "DAP"
  | "DDP";

export interface Direccion {
  linea1: string;
  linea2?: string;
  municipio: string;
  departamento: string;
  pais: string;
  zona?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  nombreComercial: string;
  nit: string;
  direccion: Direccion;
  logoIniciales: string;
  colorMarca: string;
  moneda: Moneda;
  regimenFel: "General" | "Pequeno Contribuyente" | "Especial";
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
  rolId: string;
  bodegaAsignadaId?: string;
  avatarIniciales: string;
  activo: boolean;
  ultimoAcceso: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuarios: number;
  esSistema: boolean;
}

export interface Adjunto {
  id: string;
  nombre: string;
  tipo: "PDF" | "XML" | "IMG" | "XLS" | "DOC";
  tamanoKb: number;
  subidoPor: string;
  fecha: string;
}

export interface Comentario {
  id: string;
  autor: string;
  avatarIniciales: string;
  fecha: string;
  texto: string;
}

export interface OpcionFiltro {
  label: string;
  value: string;
}

export interface EventoTimeline {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  estado: "completado" | "actual" | "pendiente" | "alerta";
  responsable?: string;
}

export type NivelAlerta = "info" | "advertencia" | "critico";

export interface Alerta {
  id: string;
  titulo: string;
  detalle: string;
  nivel: NivelAlerta;
  modulo: string;
  fecha: string;
  href: string;
}
