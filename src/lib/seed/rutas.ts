import { ORDENES_VENTA_SEED } from "./ordenes-venta";
import { VENDEDORES_SEED } from "./vendedores";

export type EstadoRuta = "programada" | "en-ruta" | "finalizada";

export interface EntregaRuta {
  fecha: string;
  /** Nombre del archivo de la foto de evidencia (la imagen no se persiste). */
  fotoNombre?: string;
}

export interface Ruta {
  id: string;
  nombre: string;
  fecha: string;
  vehiculo: string;
  responsableId: string;
  estado: EstadoRuta;
  ordenIds: string[];
  entregas: Record<string, EntregaRuta>;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);

function fecha(offsetDias: number): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString();
}

// Órdenes ya facturadas y programadas, disponibles para sembrar rutas iniciales.
const PROGRAMADAS = ORDENES_VENTA_SEED.filter((o) => o.estado === "programado");

export const RUTAS_SEED: Ruta[] = [
  {
    id: "RUTA-000001",
    nombre: "Ruta Metropolitana — mañana",
    fecha: fecha(0),
    vehiculo: "C-812BGT · Camión 3.5 t",
    responsableId: VENDEDORES_SEED[0]?.id ?? "vend-001",
    estado: "en-ruta",
    ordenIds: PROGRAMADAS.slice(0, 3).map((o) => o.id),
    entregas: {},
    createdAt: fecha(-1),
  },
  {
    id: "RUTA-000002",
    nombre: "Ruta Occidente",
    fecha: fecha(1),
    vehiculo: "P-455CHT · Panel",
    responsableId: VENDEDORES_SEED[1]?.id ?? "vend-002",
    estado: "programada",
    ordenIds: PROGRAMADAS.slice(3, 5).map((o) => o.id),
    entregas: {},
    createdAt: fecha(-1),
  },
];
