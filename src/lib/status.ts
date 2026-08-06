export type StatusTone = "default" | "accent" | "success" | "warning" | "danger";

interface StatusDef {
  label: string;
  tone: StatusTone;
}

/**
 * Mapeo centralizado color/etiqueta por estado de documento. La clave es
 * "dominio:estado" (ej. "ov:confirmado"). Cada fase que agrega un tipo de
 * documento (compras, DTE, CxC, CRM…) extiende este registro.
 */
export const STATUS_REGISTRY: Record<string, StatusDef> = {
  // Genérico activo/inactivo (clientes, proveedores, vendedores, productos)
  "gen:activo": { label: "Activo", tone: "success" },
  "gen:inactivo": { label: "Inactivo", tone: "default" },

  // Órdenes de venta
  "ov:borrador": { label: "Borrador", tone: "default" },
  "ov:confirmado": { label: "Confirmado", tone: "accent" },
  "ov:despachado": { label: "Despachado", tone: "accent" },
  "ov:entregado": { label: "Entregado", tone: "success" },
  "ov:facturado": { label: "Facturado", tone: "success" },
  "ov:anulado": { label: "Anulado", tone: "danger" },

  // Cotizaciones
  "cot:borrador": { label: "Borrador", tone: "default" },
  "cot:enviada": { label: "Enviada", tone: "accent" },
  "cot:aceptada": { label: "Aceptada", tone: "success" },
  "cot:rechazada": { label: "Rechazada", tone: "danger" },
  "cot:vencida": { label: "Vencida", tone: "warning" },
  "cot:convertida": { label: "Convertida a pedido", tone: "success" },

  // Despachos
  "desp:programado": { label: "Programado", tone: "default" },
  "desp:en-ruta": { label: "En ruta", tone: "accent" },
  "desp:entregado": { label: "Entregado", tone: "success" },
  "desp:con-novedad": { label: "Con novedad", tone: "warning" },

  // Órdenes de compra
  "oc:borrador": { label: "Borrador", tone: "default" },
  "oc:confirmada": { label: "Confirmada", tone: "accent" },
  "oc:recibida-parcial": { label: "Recepción parcial", tone: "warning" },
  "oc:recibida-total": { label: "Recibida", tone: "success" },
  "oc:facturada": { label: "Facturada", tone: "success" },
  "oc:anulada": { label: "Anulada", tone: "danger" },

  // DTE
  "dte:certificado": { label: "Certificado", tone: "success" },
  "dte:rechazado": { label: "Rechazado", tone: "danger" },
  "dte:anulado": { label: "Anulado", tone: "danger" },
  "dte:pendiente": { label: "Pendiente de certificar", tone: "warning" },

  // CxC / CxP
  "cxc:corriente": { label: "Corriente", tone: "success" },
  "cxc:vencida": { label: "Vencida", tone: "danger" },
  "cxc:pagada": { label: "Pagada", tone: "success" },
  "cxc:parcial": { label: "Abono parcial", tone: "warning" },

  // CRM
  "opp:nuevo": { label: "Nuevo", tone: "default" },
  "opp:calificado": { label: "Calificado", tone: "accent" },
  "opp:propuesta": { label: "Propuesta", tone: "accent" },
  "opp:negociacion": { label: "Negociación", tone: "warning" },
  "opp:ganado": { label: "Ganado", tone: "success" },
  "opp:perdido": { label: "Perdido", tone: "danger" },

  "act:pendiente": { label: "Pendiente", tone: "default" },
  "act:completada": { label: "Completada", tone: "success" },
  "act:vencida": { label: "Vencida", tone: "danger" },

  "recl:abierto": { label: "Abierto", tone: "danger" },
  "recl:en-proceso": { label: "En proceso", tone: "warning" },
  "recl:resuelto": { label: "Resuelto", tone: "success" },
  "recl:cerrado": { label: "Cerrado", tone: "default" },

  // Traslados / movimientos de inventario
  "trasl:pendiente": { label: "Pendiente", tone: "default" },
  "trasl:en-transito": { label: "En tránsito", tone: "accent" },
  "trasl:recibido": { label: "Recibido", tone: "success" },
};

export function getStatusDef(key: string): StatusDef {
  return STATUS_REGISTRY[key] ?? { label: key, tone: "default" };
}
