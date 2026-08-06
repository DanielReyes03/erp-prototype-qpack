import { CLIENTES_SEED } from "./clientes";
import { VENDEDORES_SEED } from "./vendedores";
import { OPORTUNIDADES_SEED } from "./oportunidades";

export type TipoActividad = "llamada" | "reunion" | "tarea" | "email";

export const TIPOS_ACTIVIDAD: { key: TipoActividad; label: string }[] = [
  { key: "llamada", label: "Llamada" },
  { key: "reunion", label: "Reunión" },
  { key: "tarea", label: "Tarea" },
  { key: "email", label: "Correo" },
];

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  asunto: string;
  clienteId?: string;
  oportunidadId?: string;
  vendedorId: string;
  fecha: string;
  completada: boolean;
  notas?: string;
  createdAt: string;
}

const HOY = new Date(2026, 7, 5);

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

const ASUNTOS: Record<TipoActividad, string[]> = {
  llamada: [
    "Llamada de seguimiento a propuesta",
    "Llamada para confirmar pedido",
    "Llamada de cortesía post-venta",
    "Llamada para renegociar condiciones",
  ],
  reunion: [
    "Reunión de presentación de catálogo",
    "Reunión para revisar contrato anual",
    "Visita a bodega del cliente",
    "Reunión de cierre de negociación",
  ],
  tarea: [
    "Preparar cotización formal",
    "Enviar muestras de producto",
    "Actualizar ficha del cliente",
    "Revisar límite de crédito antes de cerrar",
  ],
  email: [
    "Enviar catálogo actualizado",
    "Enviar propuesta económica",
    "Confirmar por escrito condiciones de pago",
    "Enviar recordatorio de renovación",
  ],
};

interface RawActividad {
  tipoIndex: number;
  asuntoIndex: number;
  clienteIndex: number;
  oportunidadIndex?: number;
  vendedorIndex: number;
  diasFecha: number;
  completada: boolean;
}

const TIPOS: TipoActividad[] = ["llamada", "reunion", "tarea", "email"];

const RAW: RawActividad[] = [
  { tipoIndex: 0, asuntoIndex: 0, clienteIndex: 0, oportunidadIndex: 0, vendedorIndex: 0, diasFecha: -20, completada: true },
  { tipoIndex: 1, asuntoIndex: 0, clienteIndex: 1, oportunidadIndex: 1, vendedorIndex: 1, diasFecha: -15, completada: true },
  { tipoIndex: 2, asuntoIndex: 0, clienteIndex: 2, oportunidadIndex: 2, vendedorIndex: 4, diasFecha: -35, completada: true },
  { tipoIndex: 3, asuntoIndex: 0, clienteIndex: 3, vendedorIndex: 0, diasFecha: -3, completada: true },
  { tipoIndex: 0, asuntoIndex: 1, clienteIndex: 4, oportunidadIndex: 4, vendedorIndex: 1, diasFecha: -9, completada: true },
  { tipoIndex: 1, asuntoIndex: 1, clienteIndex: 6, oportunidadIndex: 6, vendedorIndex: 0, diasFecha: -6, completada: false },
  { tipoIndex: 2, asuntoIndex: 1, clienteIndex: 7, oportunidadIndex: 7, vendedorIndex: 4, diasFecha: -4, completada: false },
  { tipoIndex: 3, asuntoIndex: 1, clienteIndex: 9, oportunidadIndex: 9, vendedorIndex: 2, diasFecha: -2, completada: false },
  { tipoIndex: 0, asuntoIndex: 2, clienteIndex: 10, vendedorIndex: 0, diasFecha: -1, completada: true },
  { tipoIndex: 1, asuntoIndex: 2, clienteIndex: 11, oportunidadIndex: 11, vendedorIndex: 4, diasFecha: 0, completada: false },
  { tipoIndex: 2, asuntoIndex: 2, clienteIndex: 13, oportunidadIndex: 13, vendedorIndex: 2, diasFecha: 1, completada: false },
  { tipoIndex: 3, asuntoIndex: 2, clienteIndex: 15, oportunidadIndex: 15, vendedorIndex: 4, diasFecha: 2, completada: false },
  { tipoIndex: 0, asuntoIndex: 3, clienteIndex: 16, oportunidadIndex: 16, vendedorIndex: 1, diasFecha: 3, completada: false },
  { tipoIndex: 1, asuntoIndex: 3, clienteIndex: 18, oportunidadIndex: 18, vendedorIndex: 0, diasFecha: 4, completada: false },
  { tipoIndex: 2, asuntoIndex: 3, clienteIndex: 19, oportunidadIndex: 19, vendedorIndex: 4, diasFecha: 5, completada: false },
  { tipoIndex: 3, asuntoIndex: 0, clienteIndex: 20, vendedorIndex: 2, diasFecha: -8, completada: false },
  { tipoIndex: 0, asuntoIndex: 1, clienteIndex: 21, vendedorIndex: 1, diasFecha: 6, completada: false },
  { tipoIndex: 1, asuntoIndex: 1, clienteIndex: 22, vendedorIndex: 0, diasFecha: 7, completada: false },
  { tipoIndex: 2, asuntoIndex: 2, clienteIndex: 23, vendedorIndex: 4, diasFecha: -12, completada: true },
  { tipoIndex: 3, asuntoIndex: 3, clienteIndex: 24, vendedorIndex: 2, diasFecha: 9, completada: false },
  { tipoIndex: 0, asuntoIndex: 2, clienteIndex: 5, oportunidadIndex: 5, vendedorIndex: 2, diasFecha: -48, completada: true },
  { tipoIndex: 1, asuntoIndex: 0, clienteIndex: 8, oportunidadIndex: 8, vendedorIndex: 1, diasFecha: 10, completada: false },
  { tipoIndex: 2, asuntoIndex: 1, clienteIndex: 12, oportunidadIndex: 12, vendedorIndex: 1, diasFecha: -43, completada: true },
  { tipoIndex: 3, asuntoIndex: 2, clienteIndex: 14, oportunidadIndex: 14, vendedorIndex: 0, diasFecha: 12, completada: false },
  { tipoIndex: 0, asuntoIndex: 3, clienteIndex: 17, oportunidadIndex: 17, vendedorIndex: 2, diasFecha: -50, completada: true },
  { tipoIndex: 1, asuntoIndex: 2, clienteIndex: 25, vendedorIndex: 4, diasFecha: -5, completada: false },
  { tipoIndex: 2, asuntoIndex: 0, clienteIndex: 26, vendedorIndex: 0, diasFecha: -7, completada: false },
  { tipoIndex: 3, asuntoIndex: 1, clienteIndex: 27, vendedorIndex: 1, diasFecha: 14, completada: false },
];

export const ACTIVIDADES_SEED: Actividad[] = RAW.map((raw, i) => {
  const tipo = TIPOS[raw.tipoIndex % TIPOS.length];
  const cliente = CLIENTES_SEED[raw.clienteIndex % CLIENTES_SEED.length];
  const vendedor = VENDEDORES_SEED[raw.vendedorIndex % VENDEDORES_SEED.length];
  const oportunidad =
    raw.oportunidadIndex !== undefined ? OPORTUNIDADES_SEED[raw.oportunidadIndex % OPORTUNIDADES_SEED.length] : undefined;
  return {
    id: `act-${String(i + 1).padStart(3, "0")}`,
    tipo,
    asunto: ASUNTOS[tipo][raw.asuntoIndex % ASUNTOS[tipo].length],
    clienteId: cliente.id,
    oportunidadId: oportunidad?.id,
    vendedorId: vendedor.id,
    fecha: addDays(HOY, raw.diasFecha).toISOString(),
    completada: raw.completada,
    notas: `Contacto con ${cliente.nombreComercial}.`,
    createdAt: addDays(HOY, raw.diasFecha - 3).toISOString(),
  };
});
