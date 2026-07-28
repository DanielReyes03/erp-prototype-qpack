import type { Alerta } from "@/types";
import { cuentasPorCobrar } from "./finanzas";
import { embarques } from "./compras";
import { existencias } from "./inventario";
import { aprobaciones } from "./administracion";
import { productos } from "./catalogos";
import { backorders } from "./inventario";
import { clientes } from "./crm";

export const ventasMensuales = [
  { mes: "Ago 25", ventasGTQ: 3820400, metaGTQ: 3900000 },
  { mes: "Sep 25", ventasGTQ: 4012100, metaGTQ: 3950000 },
  { mes: "Oct 25", ventasGTQ: 4198700, metaGTQ: 4050000 },
  { mes: "Nov 25", ventasGTQ: 4350900, metaGTQ: 4200000 },
  { mes: "Dic 25", ventasGTQ: 5120300, metaGTQ: 4700000 },
  { mes: "Ene 26", ventasGTQ: 3650200, metaGTQ: 4100000 },
  { mes: "Feb 26", ventasGTQ: 3890100, metaGTQ: 4150000 },
  { mes: "Mar 26", ventasGTQ: 4210500, metaGTQ: 4200000 },
  { mes: "Abr 26", ventasGTQ: 4402300, metaGTQ: 4300000 },
  { mes: "May 26", ventasGTQ: 4587600, metaGTQ: 4400000 },
  { mes: "Jun 26", ventasGTQ: 4695800, metaGTQ: 4500000 },
  { mes: "Jul 26", ventasGTQ: 4820500, metaGTQ: 4600000 },
];

export const ventasPorCategoria = [
  { categoria: "Bolsas industriales", ventasGTQ: 1240500 },
  { categoria: "Resinas", ventasGTQ: 980200 },
  { categoria: "Envase rigido", ventasGTQ: 862100 },
  { categoria: "Film y laminados", ventasGTQ: 705400 },
  { categoria: "Menaje y desechables", ventasGTQ: 601300 },
  { categoria: "Accesorios", ventasGTQ: 431000 },
];

const carteraVencidaTotal = cuentasPorCobrar.filter((c) => c.estado === "Vencida").reduce((s, c) => s + c.saldoPendiente, 0);
const valorInventario = existencias.reduce((s, e) => {
  const producto = productos.find((p) => p.id === e.productoId);
  return s + (producto ? producto.costoPromedioGTQ * e.disponible : 0);
}, 0);
const contenedoresTransito = embarques.filter((e) => ["Cargado", "En transito maritimo", "Arribado a puerto", "En tramite aduanal"].includes(e.estado)).length;

export const kpisDashboard = {
  ventasMesGTQ: ventasMensuales[ventasMensuales.length - 1].ventasGTQ,
  ventasMesVariacionPct: 4.9,
  margenBrutoPct: 33.9,
  margenBrutoVariacionPct: 1.3,
  carteraVencidaGTQ: Math.round(carteraVencidaTotal),
  carteraVencidaVariacionPct: -2.1,
  valorInventarioGTQ: Math.round(valorInventario),
  valorInventarioVariacionPct: 3.4,
  contenedoresTransito,
};

export const alertas: Alerta[] = [
  ...cuentasPorCobrar
    .filter((c) => c.estado === "Vencida" && c.diasVencido > 30)
    .slice(0, 4)
    .map((c) => {
      const cliente = clientes.find((cl) => cl.id === c.clienteId);
      return {
        id: `alerta-cxc-${c.id}`,
        titulo: `Cartera vencida ${c.diasVencido} dias`,
        detalle: `${cliente?.nombreComercial ?? "Cliente"} - Documento ${c.folioDte} por Q${c.saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`,
        nivel: "critico" as const,
        modulo: "Finanzas",
        fecha: c.fechaVencimiento,
        href: "/finanzas/cuentas-por-cobrar",
      };
    }),
  ...embarques
    .filter((e) => e.estado === "En tramite aduanal")
    .slice(0, 2)
    .map((e) => ({
      id: `alerta-emb-${e.id}`,
      titulo: "Embarque en tramite aduanal",
      detalle: `${e.folio} - BL ${e.numeroBl} en proceso de liberacion`,
      nivel: "advertencia" as const,
      modulo: "Compras",
      fecha: e.eta,
      href: "/compras/embarques",
    })),
  ...existencias
    .filter((e) => e.disponible < e.stockMinimo)
    .slice(0, 4)
    .map((e) => {
      const producto = productos.find((p) => p.id === e.productoId);
      return {
        id: `alerta-stock-${e.id}`,
        titulo: "Existencia bajo el minimo",
        detalle: `${producto?.nombre ?? "Producto"} - Disponible ${e.disponible} / Minimo ${e.stockMinimo}`,
        nivel: "advertencia" as const,
        modulo: "Inventario",
        fecha: e.ultimaActualizacion,
        href: "/inventario/existencias",
      };
    }),
  ...backorders.slice(0, 3).map((b) => {
    const producto = productos.find((p) => p.id === b.productoId);
    return {
      id: `alerta-bo-${b.id}`,
      titulo: "Pedido en backorder",
      detalle: `${producto?.nombre ?? "Producto"} - ${b.cantidadPendiente} unidades pendientes`,
      nivel: "info" as const,
      modulo: "Inventario",
      fecha: b.fechaOrigen,
      href: "/inventario/backorder",
    };
  }),
  ...aprobaciones
    .filter((a) => a.estado === "Pendiente")
    .slice(0, 3)
    .map((a) => ({
      id: `alerta-apr-${a.id}`,
      titulo: `Aprobacion pendiente: ${a.tipo}`,
      detalle: `${a.documentoReferencia} solicitado por ${a.solicitadoPor} por Q${a.montoGTQ.toLocaleString("es-GT")}`,
      nivel: "info" as const,
      modulo: "Administracion",
      fecha: a.fechaSolicitud,
      href: "/administracion/aprobaciones",
    })),
];
