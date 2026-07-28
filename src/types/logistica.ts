export interface Naviera {
  id: string;
  nombre: string;
  codigoScac: string;
  contacto: string;
  telefono: string;
  correo: string;
  rutasHabituales: string[];
}

export type TipoContenedor = "20 pies" | "40 pies" | "40 pies HC" | "LCL";
export type EstadoContenedor = "En origen" | "En transito" | "En puerto" | "Liberado" | "Devuelto";

export interface Contenedor {
  id: string;
  numero: string;
  tipo: TipoContenedor;
  navieraId: string;
  embarqueId: string;
  estado: EstadoContenedor;
  pesoKg: number;
  precintoNumero: string;
}

export interface Transportista {
  id: string;
  nombre: string;
  nit: string;
  tipo: "Local" | "Internacional";
  telefono: string;
  vehiculosAsignados: number;
  calificacion: number;
  activo: boolean;
}

export interface AgenteAduanero {
  id: string;
  nombre: string;
  colegiado: string;
  empresa: string;
  telefono: string;
  correo: string;
  aduanasHabituales: string[];
}

export interface Distribuidor {
  id: string;
  nombre: string;
  zona: string;
  clientesAsignados: number;
  contacto: string;
  telefono: string;
  activo: boolean;
}

export interface Vehiculo {
  id: string;
  placa: string;
  tipo: "Camion" | "Cabezal" | "Pickup" | "Furgon";
  capacidadKg: number;
  transportistaId: string;
  estado: "Disponible" | "En ruta" | "Mantenimiento";
}

export interface Ruta {
  id: string;
  nombre: string;
  zona: string;
  municipios: string[];
  distribuidorId: string;
  diasVisita: string[];
}
