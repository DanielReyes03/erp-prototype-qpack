import type {
  CategoriaGastoEmbarque,
  CosteoImportacion,
  Embarque,
  EstadoEmbarque,
  EstadoOrdenImportacion,
  EstadoOrdenLocal,
  GastoEmbarque,
  Incoterm,
  LineaCompra,
  OrdenCompraLocal,
  OrdenImportacion,
  Recepcion,
} from "@/types";
import { addDays, seededBool, seededFloat, seededInt, seededPick, HOY } from "./seed";
import { productos, proveedores } from "./catalogos";
import { bodegas } from "./inventario";
import { navieras, agentesAduaneros, contenedores } from "./logistica";

const proveedoresLocales = proveedores.filter((p) => p.pais === "Guatemala");
const proveedoresExtranjeros = proveedores.filter((p) => p.pais !== "Guatemala");

function generarLineas(seedBase: string, n: number): LineaCompra[] {
  return Array.from({ length: n }).map((_, i) => {
    const producto = productos[seededInt(seedBase + i + "-prod", 0, productos.length - 1)];
    const cantidad = seededInt(seedBase + i + "-cant", 50, 2000);
    return {
      id: `${seedBase}-l${i + 1}`,
      productoId: producto.id,
      cantidad,
      unidadMedidaId: producto.unidadMedidaId,
      costoUnitario: seededFloat(seedBase + i + "-costo", producto.costoPromedioGTQ * 0.85, producto.costoPromedioGTQ * 1.05, 2),
      pesoKg: Math.round(cantidad * producto.pesoKgUnitario * 100) / 100,
      volumenM3: Math.round(cantidad * producto.volumenM3Unitario * 10000) / 10000,
    };
  });
}

const estadosOrdenLocal: EstadoOrdenLocal[] = ["Borrador", "Enviada", "Confirmada", "Recibida parcial", "Recibida", "Cancelada"];

export const ordenesCompraLocal: OrdenCompraLocal[] = Array.from({ length: 30 }).map((_, i) => {
  const id = `oci-${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    folio: `OCL-2026-${String(i + 1).padStart(4, "0")}`,
    proveedorId: seededPick(id + "-prov", proveedoresLocales.length ? proveedoresLocales : proveedores).id,
    bodegaDestinoId: bodegas[0].id,
    estado: seededPick(id + "-estado", estadosOrdenLocal),
    moneda: "GTQ",
    fechaEmision: addDays(HOY, -seededInt(id + "-fecha", 1, 60)),
    fechaEntregaEstimada: addDays(HOY, seededInt(id + "-entrega", -10, 20)),
    lineas: generarLineas(id, seededInt(id + "-n", 1, 4)),
    solicitadoPor: seededPick(id + "-sol", ["Sofia Recinos", "Carlos Bran", "Mynor Lopez"] as const),
  };
});

const incoterms: Incoterm[] = ["EXW", "FOB", "FCA", "CFR", "CIF", "CIP", "DAP", "DDP"];
const estadosOrdenImport: EstadoOrdenImportacion[] = [
  "Borrador",
  "Enviada a proveedor",
  "Confirmada",
  "En produccion",
  "Lista para embarque",
  "Embarcada",
  "Cerrada",
  "Cancelada",
];

export const ordenesImportacion: OrdenImportacion[] = Array.from({ length: 20 }).map((_, i) => {
  const id = `oim-${String(i + 1).padStart(3, "0")}`;
  const proveedor = seededPick(id + "-prov", proveedoresExtranjeros);
  const estado = seededPick(id + "-estado", estadosOrdenImport);
  return {
    id,
    folio: `OIM-2026-${String(i + 1).padStart(4, "0")}`,
    proveedorId: proveedor.id,
    incoterm: seededPick(id + "-inc", incoterms),
    moneda: "USD",
    estado,
    fechaEmision: addDays(HOY, -seededInt(id + "-fecha", 5, 120)),
    fechaEmbarqueEstimada: addDays(HOY, seededInt(id + "-emb", -30, 40)),
    lineas: generarLineas(id, seededInt(id + "-n", 2, 6)),
    embarqueId: estado === "Embarcada" || estado === "Cerrada" ? `emb-${String((i % 10) + 1).padStart(3, "0")}` : undefined,
    paisOrigen: proveedor.pais,
  };
});

const estadosEmbarque: EstadoEmbarque[] = [
  "Reservado",
  "Cargado",
  "En transito maritimo",
  "Arribado a puerto",
  "En tramite aduanal",
  "Liberado",
  "En transito terrestre",
  "Recibido en bodega",
];

const puertosOrigen: Record<string, string> = {
  China: "Shanghai",
  "Estados Unidos": "Houston",
  Mexico: "Veracruz",
  Taiwan: "Kaohsiung",
  Alemania: "Hamburgo",
};

export const embarques: Embarque[] = Array.from({ length: 10 }).map((_, i) => {
  const id = `emb-${String(i + 1).padStart(3, "0")}`;
  const oivinculadas = ordenesImportacion.filter((o) => o.embarqueId === id);
  const proveedorRef = oivinculadas[0] ? proveedores.find((p) => p.id === oivinculadas[0].proveedorId) : undefined;
  const naviera = navieras[i % navieras.length];
  const etd = addDays(HOY, -seededInt(id + "-etd", 5, 55));
  const estado = seededPick(id + "-estado", estadosEmbarque);
  return {
    id,
    folio: `EMB-2026-${String(i + 1).padStart(3, "0")}`,
    navieraId: naviera.id,
    contenedorId: (contenedores.find((c) => c.embarqueId === id) ?? contenedores[i]).id,
    numeroBl: `${naviera.codigoScac}${seededInt(id + "-bl", 100000000, 999999999)}`,
    incoterm: seededPick(id + "-inc", incoterms),
    puertoOrigen: puertosOrigen[proveedorRef?.pais ?? "China"] ?? "Shanghai",
    puertoDestino: seededBool(id + "-pd", 70) ? "Puerto Quetzal" : "Puerto Santo Tomas de Castilla",
    agenteAduaneroId: agentesAduaneros[i % agentesAduaneros.length].id,
    etd,
    eta: addDays(etd, seededInt(id + "-transito", 22, 38)),
    estado,
    ordenesImportacionIds: oivinculadas.map((o) => o.id),
    ducaNumero: estado === "En tramite aduanal" || estado === "Liberado" || estado === "En transito terrestre" || estado === "Recibido en bodega" ? `DUCA-${seededInt(id + "-duca", 100000, 999999)}` : undefined,
    observaciones: "Embarque consolidado de resinas y empaque flexible para reposicion de inventario.",
  };
});

const categoriasGasto: CategoriaGastoEmbarque[] = [
  "Flete internacional",
  "Seguro",
  "DAI",
  "IVA importacion",
  "Honorarios agente aduanero",
  "Transporte local",
  "Almacenaje",
  "Otros",
];

export const gastosEmbarque: GastoEmbarque[] = embarques.flatMap((e) =>
  categoriasGasto.map((cat, j) => {
    const id = `${e.id}-gasto-${j + 1}`;
    const estimado = seededFloat(id + "-est", 3000, 95000, 2);
    return {
      id,
      embarqueId: e.id,
      categoria: cat,
      descripcion: `${cat} - ${e.folio}`,
      montoEstimadoGTQ: estimado,
      montoRealGTQ: Math.round(estimado * seededFloat(id + "-var", 0.9, 1.18, 4) * 100) / 100,
      moneda: "GTQ",
      proveedorId: cat === "Honorarios agente aduanero" ? undefined : undefined,
      documentoReferencia: `FAC-${seededInt(id + "-doc", 10000, 99999)}`,
    };
  })
);

export const costeosImportacion: CosteoImportacion[] = embarques.map((e) => {
  const ordenes = ordenesImportacion.filter((o) => o.embarqueId === e.id);
  const lineasProducto = ordenes.flatMap((o) => o.lineas);
  const gastosTotalEstimado = gastosEmbarque.filter((g) => g.embarqueId === e.id).reduce((s, g) => s + g.montoEstimadoGTQ, 0);
  const gastosTotalReal = gastosEmbarque.filter((g) => g.embarqueId === e.id).reduce((s, g) => s + g.montoRealGTQ, 0);
  const valorTotalFob = lineasProducto.reduce((s, l) => s + l.costoUnitario * l.cantidad, 0) || 1;
  const pesoTotal = lineasProducto.reduce((s, l) => s + l.pesoKg, 0) || 1;
  const volumenTotal = lineasProducto.reduce((s, l) => s + l.volumenM3, 0) || 1;
  return {
    id: `cst-${e.id}`,
    embarqueId: e.id,
    metodoProrrateo: seededPick(e.id + "-metodo", ["valor", "peso", "volumen"] as const),
    fechaCosteo: e.eta,
    estado: e.estado === "Recibido en bodega" ? "Cerrado" : "Estimado",
    items: lineasProducto.length
      ? lineasProducto.map((l) => {
          const valorFob = l.costoUnitario * l.cantidad;
          const propValor = valorFob / valorTotalFob;
          const propPeso = l.pesoKg / pesoTotal;
          const propVol = l.volumenM3 / volumenTotal;
          return {
            productoId: l.productoId,
            cantidad: l.cantidad,
            valorFobGTQ: Math.round(valorFob * 7.75 * 100) / 100,
            pesoKg: l.pesoKg,
            volumenM3: l.volumenM3,
            costoUnitarioEstimado: Math.round(((valorFob * 7.75) + gastosTotalEstimado * propValor) / l.cantidad * 100) / 100,
            costoUnitarioReal: Math.round(((valorFob * 7.75) + gastosTotalReal * (0.4 * propValor + 0.35 * propPeso + 0.25 * propVol)) / l.cantidad * 100) / 100,
          };
        })
      : [],
  };
});

export const recepciones: Recepcion[] = Array.from({ length: 18 }).map((_, i) => {
  const id = `rec-${String(i + 1).padStart(3, "0")}`;
  const esEmbarque = seededBool(id + "-tipo", 45);
  const origen = esEmbarque ? seededPick(id + "-emb", embarques) : seededPick(id + "-ocl", ordenesCompraLocal);
  const itemsCount = seededInt(id + "-n", 2, 5);
  const estado = seededPick(id + "-estado", ["Pendiente", "En proceso", "Completa", "Con diferencias"] as const);
  return {
    id,
    folio: `REC-2026-${String(i + 1).padStart(4, "0")}`,
    origenTipo: esEmbarque ? "Embarque" : "Orden local",
    origenId: origen.id,
    bodegaId: bodegas[0].id,
    fecha: addDays(HOY, -seededInt(id + "-fecha", 0, 25)),
    estado,
    recibidoPor: seededPick(id + "-user", ["Mynor Lopez", "Alicia Tuc", "Byron Reyes"] as const),
    items: Array.from({ length: itemsCount }).map((_, j) => {
      const producto = productos[seededInt(id + j + "-prod", 0, productos.length - 1)];
      const esperada = seededInt(id + j + "-esp", 50, 1200);
      const diff = estado === "Completa" ? 0 : estado === "Pendiente" ? esperada : seededInt(id + j + "-diff", -30, 0);
      return {
        productoId: producto.id,
        cantidadEsperada: esperada,
        cantidadRecibida: estado === "Pendiente" ? 0 : Math.max(0, esperada + diff),
        loteCodigo: esEmbarque ? `L${addDays(HOY, -10).replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}` : undefined,
      };
    }),
  };
});
