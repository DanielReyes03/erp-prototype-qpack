import type {
  AjusteInventario,
  Backorder,
  Bodega,
  ConteoFisico,
  Existencia,
  Lote,
  MovimientoKardex,
  Reserva,
  Transferencia,
  TipoMovimientoKardex,
  Ubicacion,
} from "@/types";
import { addDays, seededBool, seededFloat, seededInt, seededPick, HOY } from "./seed";
import { productos } from "./catalogos";
import { clientes } from "./crm";

export const bodegas: Bodega[] = [
  { id: "bod-central", codigo: "BOD-01", nombre: "Bodega Central Villa Nueva", tipo: "Central", municipio: "Villa Nueva", responsable: "Mynor Estuardo Lopez", ubicaciones: 48, activa: true },
  { id: "bod-xela", codigo: "BOD-02", nombre: "Bodega Regional Quetzaltenango", tipo: "Regional", municipio: "Quetzaltenango", responsable: "Alicia Marleny Tuc", ubicaciones: 20, activa: true },
  { id: "bod-chiq", codigo: "BOD-03", nombre: "Bodega Regional Chiquimula", tipo: "Regional", municipio: "Chiquimula", responsable: "Byron Adalberto Reyes", ubicaciones: 16, activa: true },
  { id: "bod-transito", codigo: "BOD-04", nombre: "Bodega Transito Puerto Quetzal", tipo: "Transito", municipio: "Puerto Quetzal", responsable: "Nery Otoniel Chavez", ubicaciones: 6, activa: true },
  { id: "bod-consig-colonia", codigo: "BOD-05", nombre: "Consignacion La Colonia", tipo: "Consignacion", municipio: "Guatemala", responsable: "Vendedor asignado", ubicaciones: 4, activa: true },
];

export const ubicaciones: Ubicacion[] = bodegas.flatMap((b) =>
  Array.from({ length: Math.min(b.ubicaciones, 6) }).map((_, i) => {
    const id = `ubi-${b.id}-${i + 1}`;
    return {
      id,
      bodegaId: b.id,
      codigo: `${b.codigo}-P${String(i + 1).padStart(2, "0")}`,
      pasillo: String.fromCharCode(65 + (i % 6)),
      nivel: String(seededInt(id + "-nivel", 1, 4)),
      capacidadPaletas: seededInt(id + "-cap", 12, 40),
      ocupacionPct: seededInt(id + "-ocup", 20, 98),
    };
  })
);

const bodegasStock = [bodegas[0], bodegas[1], bodegas[2], bodegas[4]];

export const existencias: Existencia[] = bodegasStock.flatMap((b, bIdx) =>
  productos
    .filter((p) => p.activo)
    .filter((p) => (b.tipo === "Consignacion" ? seededBool(p.id + b.id + "-consig", 20) : bIdx === 0 ? true : seededBool(p.id + b.id + "-stock", 65)))
    .map((p) => {
      const id = `exi-${p.id}-${b.id}`;
      const disponible = seededInt(id + "-disp", b.tipo === "Central" ? 80 : 10, b.tipo === "Central" ? 4200 : 900);
      const reservado = seededInt(id + "-res", 0, Math.round(disponible * 0.3));
      const backorder = seededBool(id + "-bo", 18) ? seededInt(id + "-boq", 20, 400) : 0;
      const enTransito = seededBool(id + "-et", 25) ? seededInt(id + "-etq", 100, 1500) : 0;
      return {
        id,
        productoId: p.id,
        bodegaId: b.id,
        disponible,
        reservado,
        enTransito,
        backorder,
        stockMinimo: p.stockMinimo,
        ultimaActualizacion: addDays(HOY, -seededInt(id + "-upd", 0, 6)),
      };
    })
);

const tiposMovimiento: TipoMovimientoKardex[] = [
  "Entrada por compra",
  "Salida por venta",
  "Ajuste positivo",
  "Ajuste negativo",
  "Transferencia entrada",
  "Transferencia salida",
  "Devolucion cliente",
  "Conteo fisico",
];

export const kardex: MovimientoKardex[] = existencias.flatMap((e) => {
  const numMovs = seededInt(e.id + "-nmov", 4, 9);
  let saldo = Math.max(0, e.disponible - seededInt(e.id + "-base", 50, 500));
  return Array.from({ length: numMovs }).map((_, i) => {
    const id = `${e.id}-mov-${i + 1}`;
    const tipo = seededPick(id + "-tipo", tiposMovimiento);
    const esEntrada = tipo.includes("Entrada") || tipo === "Ajuste positivo" || tipo === "Devolucion cliente" || tipo === "Transferencia entrada";
    const cantidad = seededInt(id + "-cant", 10, 600) * (esEntrada ? 1 : -1);
    saldo = Math.max(0, saldo + cantidad);
    return {
      id,
      productoId: e.productoId,
      bodegaId: e.bodegaId,
      fecha: addDays(HOY, -seededInt(id + "-fecha", 1, 90) + i),
      tipo,
      documentoReferencia: `${tipo.includes("compra") ? "OCL" : tipo.includes("venta") ? "PED" : tipo.includes("Transferencia") ? "TRF" : tipo === "Conteo fisico" ? "CNT" : "AJI"}-${seededInt(id + "-doc", 1000, 9999)}`,
      cantidad,
      saldoAcumulado: saldo,
      costoUnitario: seededFloat(id + "-costo", 40, 1400, 2),
      usuario: seededPick(id + "-user", ["Mynor Lopez", "Alicia Tuc", "Byron Reyes", "Sistema"] as const),
    };
  });
});

export const lotes: Lote[] = existencias
  .filter((e) => seededBool(e.id + "-lote", 55))
  .map((e, i) => {
    const id = `lote-${String(i + 1).padStart(3, "0")}`;
    const inicial = seededInt(id + "-ini", 200, 3000);
    return {
      id,
      codigo: `L${addDays(HOY, -seededInt(id + "-dias", 10, 300)).replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
      productoId: e.productoId,
      bodegaId: e.bodegaId,
      cantidadInicial: inicial,
      cantidadDisponible: Math.round(inicial * seededFloat(id + "-pct", 0.2, 0.95, 2)),
      fechaIngreso: addDays(HOY, -seededInt(id + "-ing", 10, 300)),
      fechaVencimiento: seededBool(id + "-venc", 30) ? addDays(HOY, seededInt(id + "-vencd", 30, 400)) : undefined,
      ordenCompraId: `oci-${String(seededInt(id + "-oci", 1, 30)).padStart(3, "0")}`,
    };
  });

export const reservas: Reserva[] = existencias
  .filter((e) => e.reservado > 0)
  .map((e, i) => {
    const id = `res-${String(i + 1).padStart(3, "0")}`;
    const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
    return {
      id,
      productoId: e.productoId,
      bodegaId: e.bodegaId,
      pedidoId: `ped-${String(seededInt(id + "-ped", 1, 60)).padStart(3, "0")}`,
      clienteId: cliente.id,
      cantidad: e.reservado,
      fechaReserva: addDays(HOY, -seededInt(id + "-fr", 0, 10)),
      vencimiento: addDays(HOY, seededInt(id + "-venc", 1, 15)),
      estado: seededPick(id + "-estado", ["Activa", "Liberada", "Consumida"] as const),
    };
  });

export const backorders: Backorder[] = existencias
  .filter((e) => e.backorder > 0)
  .map((e, i) => {
    const id = `bo-${String(i + 1).padStart(3, "0")}`;
    const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
    return {
      id,
      productoId: e.productoId,
      clienteId: cliente.id,
      pedidoId: `ped-${String(seededInt(id + "-ped", 1, 60)).padStart(3, "0")}`,
      cantidadPendiente: e.backorder,
      fechaOrigen: addDays(HOY, -seededInt(id + "-fo", 3, 25)),
      fechaEstimadaSurtido: addDays(HOY, seededInt(id + "-fe", 3, 45)),
      origenReposicion: seededPick(id + "-origen", ["Orden local", "Importacion"] as const),
      estado: seededPick(id + "-estado", ["Pendiente", "Parcial", "Surtido"] as const),
    };
  });

export const transferencias: Transferencia[] = Array.from({ length: 12 }).map((_, i) => {
  const id = `trf-${String(i + 1).padStart(3, "0")}`;
  const origen = seededPick(id + "-o", bodegasStock);
  let destino = seededPick(id + "-d", bodegasStock);
  if (destino.id === origen.id) destino = bodegasStock[(bodegasStock.indexOf(origen) + 1) % bodegasStock.length];
  const itemsCount = seededInt(id + "-n", 1, 4);
  return {
    id,
    folio: `TRF-2026-${String(i + 1).padStart(4, "0")}`,
    bodegaOrigenId: origen.id,
    bodegaDestinoId: destino.id,
    fecha: addDays(HOY, -seededInt(id + "-fecha", 0, 30)),
    estado: seededPick(id + "-estado", ["Solicitada", "En transito", "Recibida", "Cancelada"] as const),
    items: Array.from({ length: itemsCount }).map((_, j) => ({
      productoId: productos[seededInt(id + j + "-prod", 0, productos.length - 1)].id,
      cantidad: seededInt(id + j + "-cant", 20, 400),
    })),
    responsable: seededPick(id + "-resp", ["Mynor Lopez", "Alicia Tuc", "Byron Reyes"] as const),
  };
});

export const ajustesInventario: AjusteInventario[] = Array.from({ length: 10 }).map((_, i) => {
  const id = `aji-${String(i + 1).padStart(3, "0")}`;
  const bodega = seededPick(id + "-b", bodegasStock);
  const tipo = seededPick(id + "-tipo", ["Positivo", "Negativo"] as const);
  const itemsCount = seededInt(id + "-n", 1, 3);
  return {
    id,
    folio: `AJI-2026-${String(i + 1).padStart(4, "0")}`,
    bodegaId: bodega.id,
    fecha: addDays(HOY, -seededInt(id + "-fecha", 0, 45)),
    tipo,
    motivo: seededPick(id + "-motivo", ["Merma por manejo", "Diferencia en conteo fisico", "Producto danado", "Error de captura", "Reclasificacion de lote"] as const),
    items: Array.from({ length: itemsCount }).map((_, j) => ({
      productoId: productos[seededInt(id + j + "-prod", 0, productos.length - 1)].id,
      cantidad: seededInt(id + j + "-cant", 5, 150),
      costoUnitario: seededFloat(id + j + "-costo", 40, 1200, 2),
    })),
    autorizadoPor: seededPick(id + "-auth", ["Sofia Recinos - Gerente Inventario", "Carlos Bran - Gerente Operaciones"] as const),
    estado: seededPick(id + "-estado", ["Borrador", "Aplicado"] as const),
  };
});

export const conteosFisicos: ConteoFisico[] = Array.from({ length: 6 }).map((_, i) => {
  const id = `cnt-${String(i + 1).padStart(3, "0")}`;
  const bodega = seededPick(id + "-b", bodegasStock);
  const estado = seededPick(id + "-estado", ["Programado", "En proceso", "Cerrado con diferencias", "Cerrado sin diferencias"] as const);
  const itemsCount = seededInt(id + "-n", 4, 9);
  return {
    id,
    folio: `CNT-2026-${String(i + 1).padStart(3, "0")}`,
    bodegaId: bodega.id,
    fechaProgramada: addDays(HOY, seededInt(id + "-fecha", -20, 15)),
    estado,
    responsable: seededPick(id + "-resp", ["Mynor Lopez", "Alicia Tuc", "Byron Reyes"] as const),
    items: Array.from({ length: itemsCount }).map((_, j) => {
      const sistema = seededInt(id + j + "-sis", 50, 2000);
      const contada = estado === "Programado" ? null : sistema + seededInt(id + j + "-dif", -30, 30);
      return {
        productoId: productos[seededInt(id + j + "-prod", 0, productos.length - 1)].id,
        cantidadSistema: sistema,
        cantidadContada: contada,
      };
    }),
  };
});
