import type { DteEmitido, EstadoDte, LineaDte, NotaCreditoDebito, TipoDte } from "@/types";
import { addDays, seededBool, seededInt, seededPick } from "./seed";
import { pedidos, devoluciones } from "./ventas";
import { clientes } from "./crm";

const estadosDte: EstadoDte[] = ["Certificado", "Anulado", "Rechazado", "Pendiente"];

function lineasDesdePedido(pedidoId: string, folio: string): { lineas: LineaDte[]; subtotal: number; iva: number; total: number; descuentoTotal: number } {
  const pedido = pedidos.find((p) => p.id === pedidoId)!;
  let subtotal = 0;
  let descuentoTotal = 0;
  const lineas: LineaDte[] = pedido.lineas.map((l, i) => {
    const bruto = l.cantidad * l.precioUnitario;
    const descuento = bruto * (l.descuentoPct / 100);
    const totalLinea = Math.round((bruto - descuento) * 100) / 100;
    subtotal += totalLinea;
    descuentoTotal += descuento;
    return {
      id: `${folio}-l${i + 1}`,
      productoId: l.productoId,
      cantidad: l.cantidad,
      unidadMedida: l.unidadMedidaId,
      precioUnitario: l.precioUnitario,
      descuento: Math.round(descuento * 100) / 100,
      totalLinea,
      bienOServicio: "B" as const,
    };
  });
  const iva = Math.round(subtotal * (12 / 112) * 100) / 100;
  return { lineas, subtotal: Math.round((subtotal - iva) * 100) / 100, iva, total: Math.round(subtotal * 100) / 100, descuentoTotal: Math.round(descuentoTotal * 100) / 100 };
}

const pedidosFacturables = pedidos.filter((p) => ["Facturado", "Despachado"].includes(p.estado)).slice(0, 42);

export const dtesEmitidos: DteEmitido[] = pedidosFacturables.map((p, i) => {
  const id = `dte-${String(i + 1).padStart(3, "0")}`;
  const cliente = clientes.find((c) => c.id === p.clienteId)!;
  const serie = "B7F2";
  const numero = String(seededInt(id + "-num", 100000, 999999));
  const { lineas, subtotal, iva, total, descuentoTotal } = lineasDesdePedido(p.id, id);
  const estado = seededPick(id + "-estado", estadosDte);
  return {
    id,
    tipo: "FACT" as TipoDte,
    serie,
    numero,
    numeroAutorizacion: `A${seededInt(id + "-auth", 100000000000, 999999999999)}-${seededInt(id + "-auth2", 1000, 9999)}`,
    pedidoId: p.id,
    clienteId: cliente.id,
    receptorNit: cliente.nit,
    receptorNombre: cliente.razonSocial,
    fechaEmision: addDays(p.fechaPedido, seededInt(id + "-femi", 1, 6)),
    fechaCertificacion: estado === "Certificado" ? addDays(p.fechaPedido, seededInt(id + "-fcert", 1, 6)) : undefined,
    estado,
    moneda: "GTQ",
    lineas,
    subtotal,
    descuentoTotal,
    iva,
    total,
    motivoAnulacion: estado === "Anulado" ? "Error en datos del receptor, se emite documento sustitutivo." : undefined,
  };
});

export const notasCreditoDebito: NotaCreditoDebito[] = devoluciones
  .filter((d) => d.requiereNotaCredito)
  .map((d, i) => {
    const id = `ncd-${String(i + 1).padStart(3, "0")}`;
    const dteOrigen = dtesEmitidos.find((dte) => dte.pedidoId === d.pedidoId) ?? dtesEmitidos[i % dtesEmitidos.length];
    return {
      id,
      tipo: "Nota de credito" as const,
      serie: "NC01",
      numero: String(seededInt(id + "-num", 1000, 9999)),
      numeroAutorizacion: `A${seededInt(id + "-auth", 100000000000, 999999999999)}-${seededInt(id + "-auth2", 1000, 9999)}`,
      dteOrigenId: dteOrigen.id,
      clienteId: d.clienteId,
      motivo: d.motivo,
      fechaEmision: addDays(d.fechaSolicitud, seededInt(id + "-femi", 1, 5)),
      estado: seededBool(id + "-cert", 80) ? "Certificado" : "Pendiente",
      monto: d.montoGTQ,
    };
  });
