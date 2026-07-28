import type { Actividad, Cliente, EstadoActividad, EstadoOportunidad, Oportunidad, SegmentoCliente, TipoActividad } from "@/types";
import { addDays, seededBool, seededInt, seededPick } from "./seed";
import { vendedores } from "./catalogos";

const empresasClientes: { razon: string; comercial: string; municipio: string; depto: string; segmento: SegmentoCliente }[] = [
  { razon: "Almacenes El Pilar, S.A.", comercial: "El Pilar", municipio: "Guatemala", depto: "Guatemala", segmento: "Distribuidor" },
  { razon: "Distribuidora Vasquez Hermanos, S.A.", comercial: "Vasquez Hnos", municipio: "Mixco", depto: "Guatemala", segmento: "Distribuidor" },
  { razon: "Envasadora Central, S.A.", comercial: "Envacentral", municipio: "Villa Nueva", depto: "Guatemala", segmento: "Industrial" },
  { razon: "Supermercados La Colonia, S.A.", comercial: "La Colonia", municipio: "Guatemala", depto: "Guatemala", segmento: "Institucional" },
  { razon: "Plasticos y Empaques de Oriente, S.A.", comercial: "Plastioriente", municipio: "Chiquimula", depto: "Chiquimula", segmento: "Mayorista" },
  { razon: "Comercial Xicotencatl, S.A.", comercial: "Xicotencatl", municipio: "Quetzaltenango", depto: "Quetzaltenango", segmento: "Distribuidor" },
  { razon: "Ferreteria y Suministros Peten, S.A.", comercial: "Ferrisuministros Peten", municipio: "Flores", depto: "Peten", segmento: "Mayorista" },
  { razon: "Industrias Alimenticias del Sur, S.A.", comercial: "Indualsur", municipio: "Escuintla", depto: "Escuintla", segmento: "Industrial" },
  { razon: "Bodegas Maxi Precio, S.A.", comercial: "Maxi Precio", municipio: "Guatemala", depto: "Guatemala", segmento: "Minorista" },
  { razon: "Distribuidora San Marcos, S.A.", comercial: "Disamarcos", municipio: "San Marcos", depto: "San Marcos", segmento: "Distribuidor" },
  { razon: "Grupo Restaurantero Antigueno, S.A.", comercial: "Grupo Antigueno", municipio: "Antigua Guatemala", depto: "Sacatepequez", segmento: "Institucional" },
  { razon: "Empacadora del Pacifico, S.A.", comercial: "Empacpacifico", municipio: "Retalhuleu", depto: "Retalhuleu", segmento: "Industrial" },
  { razon: "Comercializadora Huehueteca, S.A.", comercial: "Comerhuehue", municipio: "Huehuetenango", depto: "Huehuetenango", segmento: "Mayorista" },
  { razon: "Cadena de Farmacias Cruz Azul, S.A.", comercial: "Cruz Azul", municipio: "Guatemala", depto: "Guatemala", segmento: "Institucional" },
  { razon: "Distribuidora Cobanera, S.A.", comercial: "Discobán", municipio: "Coban", depto: "Alta Verapaz", segmento: "Distribuidor" },
  { razon: "Mayoreo Plastico Zacapaneco, S.A.", comercial: "Mazaplast", municipio: "Zacapa", depto: "Zacapa", segmento: "Mayorista" },
  { razon: "Hoteles y Eventos del Lago, S.A.", comercial: "Hoteles del Lago", municipio: "Panajachel", depto: "Solola", segmento: "Institucional" },
  { razon: "Envases Industriales Chimaltecos, S.A.", comercial: "Enviquim", municipio: "Chimaltenango", depto: "Chimaltenango", segmento: "Industrial" },
  { razon: "Abarroteria La Bendicion, S.A.", comercial: "La Bendicion", municipio: "Jutiapa", depto: "Jutiapa", segmento: "Minorista" },
  { razon: "Distribuidora Portuaria de Izabal, S.A.", comercial: "Diporiza", municipio: "Puerto Barrios", depto: "Izabal", segmento: "Distribuidor" },
  { razon: "Comercial San Cristobal, S.A.", comercial: "San Cristobal", municipio: "Totonicapan", depto: "Totonicapan", segmento: "Mayorista" },
  { razon: "Agroindustrias del Altiplano, S.A.", comercial: "Agroaltiplano", municipio: "Solola", depto: "Solola", segmento: "Industrial" },
  { razon: "Comercializadora Verapaz Norte, S.A.", comercial: "Verapaz Norte", municipio: "Coban", depto: "Alta Verapaz", segmento: "Distribuidor" },
  { razon: "Tiendas de Conveniencia ExpresoGT, S.A.", comercial: "ExpresoGT", municipio: "Guatemala", depto: "Guatemala", segmento: "Institucional" },
  { razon: "Distribuidora Jalapaneca, S.A.", comercial: "Disjalapa", municipio: "Jalapa", depto: "Jalapa", segmento: "Mayorista" },
  { razon: "Plasticos Retalteca, S.A.", comercial: "Plastiretal", municipio: "Retalhuleu", depto: "Retalhuleu", segmento: "Minorista" },
  { razon: "Grupo Empacador Suchitepequez, S.A.", comercial: "Gesuchi", municipio: "Mazatenango", depto: "Suchitepequez", segmento: "Industrial" },
  { razon: "Distribuidora Metropolitana del Norte, S.A.", comercial: "Dismetronorte", municipio: "Guatemala", depto: "Guatemala", segmento: "Distribuidor" },
];

export const clientes: Cliente[] = empresasClientes.map((e, i) => {
  const id = `cli-${String(i + 1).padStart(3, "0")}`;
  const limite = seededInt(id + "-lim", 40000, 950000);
  const saldo = seededInt(id + "-saldo", 0, Math.round(limite * 0.9));
  const vencida = seededBool(id + "-venc", 35) ? seededInt(id + "-vencmt", 2000, Math.round(saldo * 0.6) + 2000) : 0;
  const listaId =
    e.segmento === "Distribuidor" ? "lp-distribuidor" : e.segmento === "Mayorista" ? "lp-mayorista" : e.segmento === "Institucional" ? "lp-institucional" : "lp-minorista";
  return {
    id,
    codigo: `CTE-${String(i + 1).padStart(4, "0")}`,
    razonSocial: e.razon,
    nombreComercial: e.comercial,
    nit: `${seededInt(id + "-nit", 1000000, 9999999)}-${seededInt(id + "-nitv", 0, 9)}`,
    segmento: e.segmento,
    vendedorId: vendedores[i % vendedores.length].id,
    direccion: {
      linea1: `${seededInt(id + "-num", 1, 20)}a Calle ${seededInt(id + "-num2", 1, 30)}-${seededInt(id + "-num3", 10, 99)}`,
      municipio: e.municipio,
      departamento: e.depto,
      pais: "Guatemala",
      zona: String(seededInt(id + "-zona", 1, 21)),
    },
    telefono: `+502 ${seededInt(id + "-tel", 2200, 7999)} ${seededInt(id + "-tel2", 1000, 9999)}`,
    correo: `contacto@${e.comercial.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.gt`,
    limiteCreditoGTQ: limite,
    saldoActualGTQ: saldo,
    diasCredito: seededPick(id + "-dc", [0, 15, 30, 45, 60]),
    listaPreciosId: listaId,
    fechaAlta: addDays("2022-01-01", seededInt(id + "-alta", 0, 1400)),
    activo: !(i === 26),
    carteraVencidaGTQ: vencida,
  };
});

const nombresOportunidad = [
  "Suministro anual bolsas industriales",
  "Renovacion contrato film stretch",
  "Proyecto envases HDPE nueva linea",
  "Ampliacion pedido resina PEAD",
  "Licitacion institucional vajilla desechable",
  "Distribucion regional saco valvulado",
  "Cambio de proveedor empaque flexible",
  "Programa de reposicion mensual",
  "Nuevo punto de venta zuncho y accesorios",
  "Proyecto exportacion tarimas plasticas",
];

const estadosOportunidad: EstadoOportunidad[] = ["Prospeccion", "Calificacion", "Propuesta", "Negociacion", "Ganada", "Perdida"];
const origenes = ["Referido", "Feria", "Llamada fria", "Sitio web", "Recompra"] as const;

export const oportunidades: Oportunidad[] = Array.from({ length: 22 }).map((_, i) => {
  const id = `op-${String(i + 1).padStart(3, "0")}`;
  const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
  const estado = seededPick(id + "-estado", estadosOportunidad);
  return {
    id,
    nombre: `${seededPick(id + "-nom", nombresOportunidad)} - ${cliente.nombreComercial}`,
    clienteId: cliente.id,
    vendedorId: cliente.vendedorId,
    estado,
    valorEstimadoGTQ: seededInt(id + "-val", 15000, 480000),
    probabilidadPct: estado === "Ganada" ? 100 : estado === "Perdida" ? 0 : seededInt(id + "-prob", 10, 90),
    fechaCierreEstimada: addDays("2026-07-01", seededInt(id + "-cierre", -20, 90)),
    origen: seededPick(id + "-origen", origenes),
    productosInteres: [],
    fechaCreacion: addDays("2026-04-01", seededInt(id + "-crea", 0, 110)),
    notas: "Seguimiento comercial registrado por el equipo de ventas.",
  };
});

const tipos: TipoActividad[] = ["Llamada", "Tarea", "Reunion", "Reclamo"];
const estadosActividad: EstadoActividad[] = ["Pendiente", "En progreso", "Completada", "Vencida"];
const asuntosPorTipo: Record<TipoActividad, string[]> = {
  Llamada: ["Confirmar pedido pendiente", "Seguimiento de cotizacion", "Recordatorio de pago", "Presentar nuevo producto"],
  Tarea: ["Preparar propuesta comercial", "Actualizar ficha de cliente", "Enviar muestras de producto", "Revisar linea de credito"],
  Reunion: ["Revision trimestral de cuenta", "Presentacion de catalogo 2026", "Negociacion de precios anuales", "Visita a bodega del cliente"],
  Reclamo: ["Producto con defecto de fabrica", "Retraso en entrega de pedido", "Diferencia en cantidad facturada", "Empaque danado en transporte"],
};

export const actividades: Actividad[] = Array.from({ length: 46 }).map((_, i) => {
  const id = `act-${String(i + 1).padStart(3, "0")}`;
  const tipo = seededPick(id + "-tipo", tipos);
  const cliente = clientes[seededInt(id + "-cli", 0, clientes.length - 1)];
  const estado = seededPick(id + "-estado", estadosActividad);
  return {
    id,
    tipo,
    asunto: seededPick(id + "-asunto", asuntosPorTipo[tipo]),
    clienteId: cliente.id,
    oportunidadId: seededBool(id + "-op", 40) ? oportunidades[seededInt(id + "-opid", 0, oportunidades.length - 1)].id : undefined,
    responsableId: cliente.vendedorId,
    estado,
    prioridad: seededPick(id + "-prio", ["Alta", "Media", "Baja"] as const),
    fechaProgramada: addDays("2026-07-10", seededInt(id + "-fecha", -15, 25)),
    fechaCompletada: estado === "Completada" ? addDays("2026-07-10", seededInt(id + "-fc", -15, 20)) : undefined,
    descripcion: `${tipo} registrada para ${cliente.nombreComercial}.`,
    canalReclamo: tipo === "Reclamo" ? seededPick(id + "-canal", ["Telefono", "Correo", "Visita", "WhatsApp"] as const) : undefined,
    severidadReclamo: tipo === "Reclamo" ? seededPick(id + "-sev", ["Alta", "Media", "Baja"] as const) : undefined,
  };
});
