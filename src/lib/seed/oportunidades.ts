import { CLIENTES_SEED } from "./clientes";
import { VENDEDORES_SEED } from "./vendedores";

export type EtapaOportunidad = "nuevo" | "calificado" | "propuesta" | "negociacion" | "ganado" | "perdido";

export const ETAPAS_OPORTUNIDAD: { key: EtapaOportunidad; label: string }[] = [
  { key: "nuevo", label: "Nuevo" },
  { key: "calificado", label: "Calificado" },
  { key: "propuesta", label: "Propuesta" },
  { key: "negociacion", label: "Negociación" },
  { key: "ganado", label: "Ganado" },
  { key: "perdido", label: "Perdido" },
];

export const ORIGENES_OPORTUNIDAD = [
  "Referido",
  "Sitio web",
  "Feria comercial",
  "Llamada en frío",
  "Cliente existente",
] as const;

export interface Oportunidad {
  id: string;
  nombre: string;
  clienteId: string;
  vendedorId: string;
  etapa: EtapaOportunidad;
  valorEstimado: number;
  moneda: "GTQ" | "USD";
  probabilidad: number;
  fechaCierreEstimada: string;
  origen: (typeof ORIGENES_OPORTUNIDAD)[number];
  notas?: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const PRODUCTOS_INTERES = [
  "resinas PEAD",
  "bolsas camiseta calibre 200",
  "envases PET",
  "tapas rosca 28mm",
  "film stretch industrial",
  "resina PP homopolímero",
  "empaque flexible laminado",
  "aditivos y colorantes",
];

interface RawOportunidad {
  clienteIndex: number;
  vendedorIndex: number;
  etapa: EtapaOportunidad;
  probabilidad: number;
  valorEstimado: number;
  diasCierre: number;
  origenIndex: number;
  productoIndex: number;
  diasCreacion: number;
}

const RAW: RawOportunidad[] = [
  { clienteIndex: 0, vendedorIndex: 0, etapa: "negociacion", probabilidad: 70, valorEstimado: 185000, diasCierre: 12, origenIndex: 4, productoIndex: 0, diasCreacion: -25 },
  { clienteIndex: 1, vendedorIndex: 1, etapa: "propuesta", probabilidad: 50, valorEstimado: 96000, diasCierre: 20, origenIndex: 1, productoIndex: 2, diasCreacion: -18 },
  { clienteIndex: 2, vendedorIndex: 4, etapa: "ganado", probabilidad: 100, valorEstimado: 240000, diasCierre: -5, origenIndex: 0, productoIndex: 4, diasCreacion: -40 },
  { clienteIndex: 3, vendedorIndex: 0, etapa: "nuevo", probabilidad: 20, valorEstimado: 45000, diasCierre: 35, origenIndex: 2, productoIndex: 1, diasCreacion: -4 },
  { clienteIndex: 4, vendedorIndex: 1, etapa: "calificado", probabilidad: 35, valorEstimado: 128000, diasCierre: 28, origenIndex: 3, productoIndex: 5, diasCreacion: -10 },
  { clienteIndex: 5, vendedorIndex: 2, etapa: "perdido", probabilidad: 0, valorEstimado: 62000, diasCierre: -15, origenIndex: 1, productoIndex: 3, diasCreacion: -50 },
  { clienteIndex: 6, vendedorIndex: 0, etapa: "propuesta", probabilidad: 55, valorEstimado: 154000, diasCierre: 15, origenIndex: 4, productoIndex: 6, diasCreacion: -22 },
  { clienteIndex: 7, vendedorIndex: 4, etapa: "negociacion", probabilidad: 75, valorEstimado: 310000, diasCierre: 8, origenIndex: 0, productoIndex: 0, diasCreacion: -30 },
  { clienteIndex: 8, vendedorIndex: 1, etapa: "nuevo", probabilidad: 15, valorEstimado: 38000, diasCierre: 40, origenIndex: 2, productoIndex: 7, diasCreacion: -2 },
  { clienteIndex: 9, vendedorIndex: 2, etapa: "calificado", probabilidad: 40, valorEstimado: 87000, diasCierre: 25, origenIndex: 3, productoIndex: 2, diasCreacion: -12 },
  { clienteIndex: 10, vendedorIndex: 0, etapa: "ganado", probabilidad: 100, valorEstimado: 175000, diasCierre: -20, origenIndex: 4, productoIndex: 4, diasCreacion: -60 },
  { clienteIndex: 11, vendedorIndex: 4, etapa: "propuesta", probabilidad: 60, valorEstimado: 210000, diasCierre: 18, origenIndex: 0, productoIndex: 1, diasCreacion: -16 },
  { clienteIndex: 12, vendedorIndex: 1, etapa: "perdido", probabilidad: 0, valorEstimado: 54000, diasCierre: -8, origenIndex: 1, productoIndex: 5, diasCreacion: -45 },
  { clienteIndex: 13, vendedorIndex: 2, etapa: "negociacion", probabilidad: 65, valorEstimado: 132000, diasCierre: 10, origenIndex: 2, productoIndex: 3, diasCreacion: -20 },
  { clienteIndex: 14, vendedorIndex: 0, etapa: "nuevo", probabilidad: 20, valorEstimado: 29000, diasCierre: 45, origenIndex: 3, productoIndex: 6, diasCreacion: -1 },
  { clienteIndex: 15, vendedorIndex: 4, etapa: "calificado", probabilidad: 30, valorEstimado: 98000, diasCierre: 30, origenIndex: 4, productoIndex: 0, diasCreacion: -8 },
  { clienteIndex: 16, vendedorIndex: 1, etapa: "propuesta", probabilidad: 55, valorEstimado: 165000, diasCierre: 14, origenIndex: 0, productoIndex: 7, diasCreacion: -19 },
  { clienteIndex: 17, vendedorIndex: 2, etapa: "ganado", probabilidad: 100, valorEstimado: 288000, diasCierre: -12, origenIndex: 1, productoIndex: 2, diasCreacion: -55 },
  { clienteIndex: 18, vendedorIndex: 0, etapa: "negociacion", probabilidad: 80, valorEstimado: 220000, diasCierre: 6, origenIndex: 2, productoIndex: 4, diasCreacion: -28 },
  { clienteIndex: 19, vendedorIndex: 4, etapa: "nuevo", probabilidad: 10, valorEstimado: 41000, diasCierre: 38, origenIndex: 3, productoIndex: 1, diasCreacion: -3 },
];

export const OPORTUNIDADES_SEED: Oportunidad[] = RAW.map((raw, i) => {
  const cliente = CLIENTES_SEED[raw.clienteIndex % CLIENTES_SEED.length];
  const vendedor = VENDEDORES_SEED[raw.vendedorIndex % VENDEDORES_SEED.length];
  const producto = PRODUCTOS_INTERES[raw.productoIndex % PRODUCTOS_INTERES.length];
  return {
    id: `opp-${String(i + 1).padStart(3, "0")}`,
    nombre: `${cliente.nombreComercial} — ${producto}`,
    clienteId: cliente.id,
    vendedorId: vendedor.id,
    etapa: raw.etapa,
    valorEstimado: raw.valorEstimado,
    moneda: "GTQ",
    probabilidad: raw.probabilidad,
    fechaCierreEstimada: addDays(HOY, raw.diasCierre).toISOString(),
    origen: ORIGENES_OPORTUNIDAD[raw.origenIndex % ORIGENES_OPORTUNIDAD.length],
    notas: `Interés en ${producto} para reposición de inventario.`,
    createdAt: addDays(HOY, raw.diasCreacion).toISOString(),
  };
});
