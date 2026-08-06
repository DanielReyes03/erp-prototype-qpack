import { CLIENTES_SEED } from "./clientes";
import { VENDEDORES_SEED } from "./vendedores";

export type PrioridadReclamo = "baja" | "media" | "alta" | "urgente";
export type EstadoReclamo = "abierto" | "en-proceso" | "resuelto" | "cerrado";

export const PRIORIDADES_RECLAMO: { key: PrioridadReclamo; label: string; slaDias: number }[] = [
  { key: "urgente", label: "Urgente", slaDias: 1 },
  { key: "alta", label: "Alta", slaDias: 2 },
  { key: "media", label: "Media", slaDias: 5 },
  { key: "baja", label: "Baja", slaDias: 10 },
];

export const CATEGORIAS_RECLAMO = [
  "Calidad de producto",
  "Tiempo de entrega",
  "Facturación",
  "Atención al cliente",
  "Producto dañado en tránsito",
] as const;

export interface Reclamo {
  id: string;
  clienteId: string;
  categoria: (typeof CATEGORIAS_RECLAMO)[number];
  prioridad: PrioridadReclamo;
  estado: EstadoReclamo;
  asunto: string;
  descripcion: string;
  fechaLimiteSla: string;
  fechaResolucion?: string;
  asignadoAId: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function slaDiasDe(prioridad: PrioridadReclamo): number {
  return PRIORIDADES_RECLAMO.find((p) => p.key === prioridad)!.slaDias;
}

interface RawReclamo {
  clienteIndex: number;
  vendedorIndex: number;
  categoriaIndex: number;
  prioridad: PrioridadReclamo;
  estado: EstadoReclamo;
  diasCreacion: number;
  diasResolucion?: number;
  asunto: string;
}

const RAW: RawReclamo[] = [
  { clienteIndex: 3, vendedorIndex: 0, categoriaIndex: 0, prioridad: "alta", estado: "abierto", diasCreacion: -1, asunto: "Resina con impurezas en último lote" },
  { clienteIndex: 5, vendedorIndex: 2, categoriaIndex: 1, prioridad: "urgente", estado: "en-proceso", diasCreacion: -1, asunto: "Entrega no llegó en la fecha pactada" },
  { clienteIndex: 8, vendedorIndex: 1, categoriaIndex: 2, prioridad: "media", estado: "abierto", diasCreacion: -3, asunto: "Factura con monto incorrecto" },
  { clienteIndex: 12, vendedorIndex: 1, categoriaIndex: 4, prioridad: "alta", estado: "en-proceso", diasCreacion: -2, asunto: "Bolsas llegaron perforadas" },
  { clienteIndex: 16, vendedorIndex: 1, categoriaIndex: 3, prioridad: "baja", estado: "abierto", diasCreacion: -4, asunto: "Demora en respuesta de vendedor asignado" },
  { clienteIndex: 20, vendedorIndex: 2, categoriaIndex: 0, prioridad: "media", estado: "resuelto", diasCreacion: -12, diasResolucion: -8, asunto: "Color de resina fuera de especificación" },
  { clienteIndex: 22, vendedorIndex: 0, categoriaIndex: 1, prioridad: "alta", estado: "resuelto", diasCreacion: -15, diasResolucion: -13, asunto: "Camión llegó con 4 horas de retraso" },
  { clienteIndex: 24, vendedorIndex: 4, categoriaIndex: 2, prioridad: "baja", estado: "cerrado", diasCreacion: -25, diasResolucion: -18, asunto: "Nota de crédito no aplicada a tiempo" },
  { clienteIndex: 1, vendedorIndex: 1, categoriaIndex: 4, prioridad: "urgente", estado: "resuelto", diasCreacion: -20, diasResolucion: -19, asunto: "Envases rotos al recibir el pedido" },
  { clienteIndex: 7, vendedorIndex: 4, categoriaIndex: 0, prioridad: "media", estado: "cerrado", diasCreacion: -30, diasResolucion: -24, asunto: "Densidad de resina inconsistente" },
  { clienteIndex: 9, vendedorIndex: 2, categoriaIndex: 3, prioridad: "baja", estado: "cerrado", diasCreacion: -40, diasResolucion: -35, asunto: "Cliente reporta mala atención telefónica" },
  { clienteIndex: 14, vendedorIndex: 0, categoriaIndex: 1, prioridad: "media", estado: "resuelto", diasCreacion: -10, diasResolucion: -6, asunto: "Pedido incompleto en la entrega" },
  { clienteIndex: 27, vendedorIndex: 1, categoriaIndex: 2, prioridad: "alta", estado: "abierto", diasCreacion: -1, asunto: "Doble cobro en factura de julio" },
  { clienteIndex: 30, vendedorIndex: 2, categoriaIndex: 0, prioridad: "urgente", estado: "en-proceso", diasCreacion: 0, asunto: "Tapas no ajustan al envase del mismo lote" },
  { clienteIndex: 33, vendedorIndex: 4, categoriaIndex: 4, prioridad: "media", estado: "abierto", diasCreacion: -5, asunto: "Film stretch dañado por humedad en bodega" },
];

export const RECLAMOS_SEED: Reclamo[] = RAW.map((raw, i) => {
  const cliente = CLIENTES_SEED[raw.clienteIndex % CLIENTES_SEED.length];
  const vendedor = VENDEDORES_SEED[raw.vendedorIndex % VENDEDORES_SEED.length];
  const createdAt = addDays(HOY, raw.diasCreacion);
  return {
    id: `recl-${String(i + 1).padStart(3, "0")}`,
    clienteId: cliente.id,
    categoria: CATEGORIAS_RECLAMO[raw.categoriaIndex % CATEGORIAS_RECLAMO.length],
    prioridad: raw.prioridad,
    estado: raw.estado,
    asunto: raw.asunto,
    descripcion: `${raw.asunto}. Reportado por ${cliente.nombreComercial}, requiere seguimiento del vendedor asignado.`,
    fechaLimiteSla: addDays(createdAt, slaDiasDe(raw.prioridad)).toISOString(),
    fechaResolucion: raw.diasResolucion !== undefined ? addDays(HOY, raw.diasResolucion).toISOString() : undefined,
    asignadoAId: vendedor.id,
    createdAt: createdAt.toISOString(),
  };
});
