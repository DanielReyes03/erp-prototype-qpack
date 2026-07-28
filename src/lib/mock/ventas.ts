import type {
  Cotizacion,
  Despacho,
  Devolucion,
  EstadoCotizacion,
  EstadoDespacho,
  EstadoDevolucion,
  EstadoPedido,
  LineaVenta,
  MotivoDevolucion,
  Pedido,
} from "@/types";
import { addDays, seededBool, seededFloat, seededInt, seededPick, HOY } from "./seed";
import { clientes } from "./crm";
import { productos } from "./catalogos";
import { bodegas } from "./inventario";
import { transportistas, vehiculos, rutas } from "./logistica";

function generarLineasVenta(seedBase: string, n: number): LineaVenta[] {
  return Array.from({ length: n }).map((_, i) => {
    const producto = productos[seededInt(seedBase + i + "-prod", 0, productos.length - 1)];
    return {
      id: `${seedBase}-l${i + 1}`,
      productoId: producto.id,
      unidadMedidaId: producto.unidadMedidaId,
      cantidad: seededInt(seedBase + i + "-cant", 5, 350),
      precioUnitario: seededFloat(seedBase + i + "-precio", producto.precioListaGTQ * 0.9, producto.precioListaGTQ * 1.02, 2),
      descuentoPct: seededPick(seedBase + i + "-desc", [0, 0, 0, 3, 5, 8, 10]),
      costoUnitario: producto.costoPromedioGTQ,
    };
  });
}

const estadosCotizacion: EstadoCotizacion[] = ["Borrador", "Enviada", "Aprobada", "Rechazada", "Convertida", "Vencida"];

export const cotizaciones: Cotizacion[] = Array.from({ length: 45 }).map((_, i) => {
  const id = `cot-${String(i + 1).padStart(3, "0")}`;
  const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
  const fechaEmision = addDays(HOY, -seededInt(id + "-fecha", 0, 50));
  const estado = seededPick(id + "-estado", estadosCotizacion);
  return {
    id,
    folio: `COT-2026-${String(i + 1).padStart(4, "0")}`,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    estado,
    moneda: "GTQ",
    condicionPago: seededPick(id + "-cond", [`${cliente.diasCredito} dias`, "Contado", "50% anticipo"] as const),
    vigenciaDias: seededPick(id + "-vig", [8, 15, 30]),
    fechaEmision,
    fechaVencimiento: addDays(fechaEmision, seededPick(id + "-vigd", [8, 15, 30])),
    lineas: generarLineasVenta(id, seededInt(id + "-n", 1, 6)),
    notas: "Precios sujetos a disponibilidad de inventario al momento de confirmar el pedido.",
    pedidoId: estado === "Convertida" ? `ped-${String((i % 60) + 1).padStart(3, "0")}` : undefined,
  };
});

const estadosPedido: EstadoPedido[] = [
  "Pendiente",
  "En preparacion",
  "Listo para despacho",
  "Despachado parcial",
  "Despachado",
  "Facturado",
  "Cancelado",
];

export const pedidos: Pedido[] = Array.from({ length: 60 }).map((_, i) => {
  const id = `ped-${String(i + 1).padStart(3, "0")}`;
  const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
  const fechaPedido = addDays(HOY, -seededInt(id + "-fecha", 0, 45));
  const cotizacionOrigen = cotizaciones.find((c) => c.pedidoId === id);
  return {
    id,
    folio: `PED-2026-${String(i + 1).padStart(4, "0")}`,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    cotizacionId: cotizacionOrigen?.id,
    estado: seededPick(id + "-estado", estadosPedido),
    moneda: "GTQ",
    bodegaId: seededPick(id + "-bod", bodegas.slice(0, 3)).id,
    fechaPedido,
    fechaEntregaComprometida: addDays(fechaPedido, seededInt(id + "-entrega", 2, 12)),
    lineas: cotizacionOrigen ? cotizacionOrigen.lineas : generarLineasVenta(id, seededInt(id + "-n", 1, 7)),
    direccionEntrega: `${cliente.direccion.linea1}, ${cliente.direccion.municipio}, ${cliente.direccion.departamento}`,
    prioridad: seededPick(id + "-prio", ["Alta", "Normal", "Baja"] as const),
  };
});

const estadosDespacho: EstadoDespacho[] = ["Programado", "En ruta", "Entregado", "Con incidencia"];

export const despachos: Despacho[] = pedidos
  .filter((p) => ["Despachado parcial", "Despachado", "Facturado"].includes(p.estado))
  .map((p, i) => {
    const id = `desp-${String(i + 1).padStart(3, "0")}`;
    const transportista = transportistas[i % transportistas.length];
    const vehiculo = vehiculos.find((v) => v.transportistaId === transportista.id) ?? vehiculos[i % vehiculos.length];
    const estado = seededPick(id + "-estado", estadosDespacho);
    return {
      id,
      folio: `DESP-2026-${String(i + 1).padStart(4, "0")}`,
      pedidoId: p.id,
      clienteId: p.clienteId,
      transportistaId: transportista.id,
      vehiculoId: vehiculo.id,
      rutaId: rutas[i % rutas.length].id,
      estado,
      fechaProgramada: p.fechaEntregaComprometida,
      fechaEntrega: estado === "Entregado" ? addDays(p.fechaEntregaComprometida, seededInt(id + "-real", -1, 2)) : undefined,
      bultos: seededInt(id + "-bultos", 3, 80),
      pesoTotalKg: seededFloat(id + "-peso", 80, 4500, 1),
      firmaReceptor: estado === "Entregado" ? "Recibido conforme" : undefined,
    };
  });

const motivos: MotivoDevolucion[] = [
  "Producto danado",
  "Error en pedido",
  "No cumple especificacion",
  "Exceso de inventario del cliente",
  "Vencimiento",
];
const estadosDevolucion: EstadoDevolucion[] = ["Solicitada", "En revision", "Aprobada", "Rechazada", "Completada"];

export const devoluciones: Devolucion[] = Array.from({ length: 14 }).map((_, i) => {
  const id = `dev-${String(i + 1).padStart(3, "0")}`;
  const pedido = pedidos[seededInt(id + "-ped", 0, pedidos.length - 1)];
  const lineas = pedido.lineas.slice(0, Math.max(1, seededInt(id + "-n", 1, pedido.lineas.length)));
  const monto = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario * (1 - l.descuentoPct / 100), 0);
  return {
    id,
    folio: `DEV-2026-${String(i + 1).padStart(4, "0")}`,
    pedidoId: pedido.id,
    clienteId: pedido.clienteId,
    motivo: seededPick(id + "-motivo", motivos),
    estado: seededPick(id + "-estado", estadosDevolucion),
    fechaSolicitud: addDays(HOY, -seededInt(id + "-fecha", 0, 30)),
    montoGTQ: Math.round(monto * 100) / 100,
    lineas,
    requiereNotaCredito: seededBool(id + "-nc", 70),
  };
});
