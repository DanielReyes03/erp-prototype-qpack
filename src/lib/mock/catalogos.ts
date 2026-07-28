import type {
  UnidadMedida,
  PartidaArancelaria,
  Producto,
  Proveedor,
  Vendedor,
  ListaPrecios,
  CategoriaProducto,
} from "@/types";
import { seededFloat, seededInt, seededPick } from "./seed";

export const categoriasProducto: CategoriaProducto[] = [
  "Resinas",
  "Empaque flexible",
  "Envase rigido",
  "Film y laminados",
  "Bolsas industriales",
  "Menaje y desechables",
  "Accesorios",
];

export const unidadesMedida: UnidadMedida[] = [
  { id: "um-qq", codigo: "QQ", nombre: "Quintal", tipo: "peso", factorConversionBase: 45.36 },
  { id: "um-kg", codigo: "KG", nombre: "Kilogramo", tipo: "peso", factorConversionBase: 1 },
  { id: "um-lb", codigo: "LB", nombre: "Libra", tipo: "peso", factorConversionBase: 0.4536 },
  { id: "um-und", codigo: "UND", nombre: "Unidad", tipo: "conteo", factorConversionBase: 1 },
  { id: "um-caja", codigo: "CJA", nombre: "Caja", tipo: "conteo", factorConversionBase: 1 },
  { id: "um-fardo", codigo: "FDO", nombre: "Fardo", tipo: "conteo", factorConversionBase: 1 },
  { id: "um-rollo", codigo: "ROL", nombre: "Rollo", tipo: "conteo", factorConversionBase: 1 },
  { id: "um-millar", codigo: "MLR", nombre: "Millar", tipo: "conteo", factorConversionBase: 1000 },
  { id: "um-m3", codigo: "M3", nombre: "Metro cubico", tipo: "volumen", factorConversionBase: 1 },
  { id: "um-mt", codigo: "MT", nombre: "Metro lineal", tipo: "longitud", factorConversionBase: 1 },
];

export const partidasArancelarias: PartidaArancelaria[] = [
  { id: "pa-3901", codigo: "3901.10.00", descripcion: "Polietileno de densidad inferior a 0.94", derechoArancelarioPct: 5, unidadMedidaOficial: "KG" },
  { id: "pa-3902", codigo: "3902.10.00", descripcion: "Polipropileno sin mezclar", derechoArancelarioPct: 5, unidadMedidaOficial: "KG" },
  { id: "pa-3920", codigo: "3920.10.00", descripcion: "Placas y hojas de polimeros de etileno", derechoArancelarioPct: 10, unidadMedidaOficial: "KG" },
  { id: "pa-3923", codigo: "3923.21.00", descripcion: "Sacos y bolsas de polimeros de etileno", derechoArancelarioPct: 15, unidadMedidaOficial: "KG" },
  { id: "pa-3923-9", codigo: "3923.90.00", descripcion: "Los demas articulos de transporte o envasado", derechoArancelarioPct: 15, unidadMedidaOficial: "KG" },
  { id: "pa-3924", codigo: "3924.10.00", descripcion: "Vajilla y articulos de uso domestico de plastico", derechoArancelarioPct: 15, unidadMedidaOficial: "KG" },
  { id: "pa-3926", codigo: "3926.90.90", descripcion: "Las demas manufacturas de plastico", derechoArancelarioPct: 15, unidadMedidaOficial: "KG" },
  { id: "pa-3916", codigo: "3916.20.00", descripcion: "Monofilamentos de polimeros de cloruro de vinilo", derechoArancelarioPct: 10, unidadMedidaOficial: "KG" },
];

export const proveedores: Proveedor[] = [
  { id: "prov-01", nombre: "Sinopec Resins Trading Co.", nombreComercial: "Sinopec Resins", pais: "China", contacto: "Li Wei Zhang", correo: "lwzhang@sinopecresins.cn", telefono: "+86 21 5566 8890", incotermHabitual: "FOB", moneda: "USD", diasCredito: 60, calificacion: 4.6, activo: true },
  { id: "prov-02", nombre: "Braskem America Inc.", nombreComercial: "Braskem", pais: "Estados Unidos", contacto: "Diego Fernandez", correo: "dfernandez@braskem.com", telefono: "+1 215 660 3200", incotermHabitual: "CIF", moneda: "USD", diasCredito: 45, calificacion: 4.8, activo: true },
  { id: "prov-03", nombre: "Grupo Phoenix Empaques S.A.", nombreComercial: "Grupo Phoenix", pais: "Mexico", contacto: "Mariana Solis", correo: "msolis@gpophoenix.mx", telefono: "+52 55 4455 2210", incotermHabitual: "FCA", moneda: "USD", diasCredito: 30, calificacion: 4.3, activo: true },
  { id: "prov-04", nombre: "Formosa Plastics Corporation", nombreComercial: "Formosa Plastics", pais: "Taiwan", contacto: "Chen Yu Ting", correo: "cyting@fpc.tw", telefono: "+886 2 2712 2211", incotermHabitual: "FOB", moneda: "USD", diasCredito: 60, calificacion: 4.5, activo: true },
  { id: "prov-05", nombre: "Plasticos del Istmo, S.A.", nombreComercial: "Plastisimo", pais: "Guatemala", contacto: "Julio Cesar Marroquin", correo: "jmarroquin@plastisimo.gt", telefono: "+502 2366 1145", incotermHabitual: "EXW", moneda: "GTQ", diasCredito: 30, calificacion: 4.1, activo: true },
  { id: "prov-06", nombre: "Reifenhauser Packaging Films", nombreComercial: "Reifenhauser", pais: "Alemania", contacto: "Klaus Bergmann", correo: "kbergmann@reifenhauser.de", telefono: "+49 2634 190", incotermHabitual: "CIF", moneda: "USD", diasCredito: 90, calificacion: 4.7, activo: true },
  { id: "prov-07", nombre: "Indelpro S.A. de C.V.", nombreComercial: "Indelpro", pais: "Mexico", contacto: "Rosa Elena Cifuentes", correo: "rcifuentes@indelpro.mx", telefono: "+52 833 229 9000", incotermHabitual: "CFR", moneda: "USD", diasCredito: 45, calificacion: 4.4, activo: true },
  { id: "prov-08", nombre: "Envases Flexibles Centroamericanos", nombreComercial: "Enviflex CA", pais: "El Salvador", contacto: "Ana Beatriz Portillo", correo: "aportillo@enviflexca.com", telefono: "+503 2261 9090", incotermHabitual: "DAP", moneda: "USD", diasCredito: 30, calificacion: 4.0, activo: true },
  { id: "prov-09", nombre: "Novolex Packaging Solutions", nombreComercial: "Novolex", pais: "Estados Unidos", contacto: "Robert Hayes", correo: "rhayes@novolex.com", telefono: "+1 843 774 4800", incotermHabitual: "FOB", moneda: "USD", diasCredito: 60, calificacion: 4.6, activo: true },
  { id: "prov-10", nombre: "Manufacturas Plasticas del Sur, S.A.", nombreComercial: "Maplasur", pais: "Guatemala", contacto: "Hector Gabriel Ordonez", correo: "hordonez@maplasur.gt", telefono: "+502 7832 4410", incotermHabitual: "EXW", moneda: "GTQ", diasCredito: 15, calificacion: 3.9, activo: false },
];

const nombresProductos: { nombre: string; categoria: CategoriaProducto; partida: string; um: string }[] = [
  { nombre: "Resina PEAD Soplado Natural", categoria: "Resinas", partida: "pa-3901", um: "um-qq" },
  { nombre: "Resina PEBD Film Grado Extrusion", categoria: "Resinas", partida: "pa-3901", um: "um-qq" },
  { nombre: "Resina Polipropileno Homopolimero", categoria: "Resinas", partida: "pa-3902", um: "um-qq" },
  { nombre: "Resina PVC Rigido K-65", categoria: "Resinas", partida: "pa-3901", um: "um-qq" },
  { nombre: "Masterbatch Blanco 50% TiO2", categoria: "Resinas", partida: "pa-3902", um: "um-qq" },
  { nombre: "Masterbatch Negro Carbon 40%", categoria: "Resinas", partida: "pa-3902", um: "um-qq" },
  { nombre: "Film Stretch Manual 18in x 300m", categoria: "Film y laminados", partida: "pa-3920", um: "um-rollo" },
  { nombre: "Film Stretch Maquina 20in x 1500m", categoria: "Film y laminados", partida: "pa-3920", um: "um-rollo" },
  { nombre: "Laminado Metalizado BOPP 20 micras", categoria: "Film y laminados", partida: "pa-3920", um: "um-mt" },
  { nombre: "Film Termoencogible POF 40cm", categoria: "Film y laminados", partida: "pa-3920", um: "um-rollo" },
  { nombre: "Bolsa Industrial Calibre 200 30x40", categoria: "Bolsas industriales", partida: "pa-3923", um: "um-millar" },
  { nombre: "Bolsa Industrial Calibre 400 40x60", categoria: "Bolsas industriales", partida: "pa-3923", um: "um-millar" },
  { nombre: "Saco Valvulado PP Tejido 25kg", categoria: "Bolsas industriales", partida: "pa-3923-9", um: "um-millar" },
  { nombre: "Bolsa Camiseta Reciclada 12x20", categoria: "Bolsas industriales", partida: "pa-3923", um: "um-fardo" },
  { nombre: "Bolsa Basura Industrial Negra 30gal", categoria: "Bolsas industriales", partida: "pa-3923", um: "um-fardo" },
  { nombre: "Envase PET Cristal 500ml Boca Ancha", categoria: "Envase rigido", partida: "pa-3923-9", um: "um-caja" },
  { nombre: "Envase HDPE 1 Galon Blanco", categoria: "Envase rigido", partida: "pa-3923-9", um: "um-caja" },
  { nombre: "Cubeta Industrial 5 Galones con Tapa", categoria: "Envase rigido", partida: "pa-3923-9", um: "um-und" },
  { nombre: "Tambo Plastico 55 Galones Cerrado", categoria: "Envase rigido", partida: "pa-3923-9", um: "um-und" },
  { nombre: "Preforma PET 28mm 32gr", categoria: "Envase rigido", partida: "pa-3923-9", um: "um-millar" },
  { nombre: "Vaso Termico Foam 16oz", categoria: "Menaje y desechables", partida: "pa-3924", um: "um-millar" },
  { nombre: "Plato Desechable Bioplastico 9in", categoria: "Menaje y desechables", partida: "pa-3924", um: "um-millar" },
  { nombre: "Cubierto Desechable PS Set 3en1", categoria: "Menaje y desechables", partida: "pa-3924", um: "um-millar" },
  { nombre: "Contenedor Foam Clamshell 8x8", categoria: "Menaje y desechables", partida: "pa-3924", um: "um-millar" },
  { nombre: "Pajilla Biodegradable PLA 8in", categoria: "Menaje y desechables", partida: "pa-3924", um: "um-millar" },
  { nombre: "Corbata Plastica para Sello 15cm", categoria: "Accesorios", partida: "pa-3926", um: "um-millar" },
  { nombre: "Zuncho Plastico PP 1/2in", categoria: "Accesorios", partida: "pa-3916", um: "um-rollo" },
  { nombre: "Cinta Adhesiva Empaque Transparente", categoria: "Accesorios", partida: "pa-3926", um: "um-caja" },
  { nombre: "Esquinero Plastico Proteccion Carga", categoria: "Accesorios", partida: "pa-3926", um: "um-caja" },
  { nombre: "Tarima Plastica Exportacion 1.2x1.0m", categoria: "Accesorios", partida: "pa-3926", um: "um-und" },
];

const coloresProducto = ["#2E5AAC", "#4C8577", "#B8863E", "#8E5A9C", "#3D8FA8", "#A8543D", "#5A7F3D"] as const;

export const productos: Producto[] = nombresProductos.map((p, i) => {
  const id = `prod-${String(i + 1).padStart(3, "0")}`;
  const costo = seededFloat(id + "-costo", 45, 1450, 2);
  const margen = seededFloat(id + "-margen", 1.18, 1.45, 3);
  return {
    id,
    sku: `QP-${String(i + 1).padStart(4, "0")}`,
    nombre: p.nombre,
    descripcion: `${p.nombre} para uso industrial y comercial, distribucion nacional QPack.`,
    categoria: p.categoria,
    unidadMedidaId: p.um,
    partidaArancelariaId: p.partida,
    proveedorPrincipalId: proveedores[i % proveedores.length].id,
    pesoKgUnitario: seededFloat(id + "-peso", 0.05, 45, 2),
    volumenM3Unitario: seededFloat(id + "-vol", 0.001, 1.8, 4),
    costoPromedioGTQ: costo,
    precioListaGTQ: Math.round(costo * margen * 100) / 100,
    precioListaUSD: Math.round((costo * margen) / 7.75 * 100) / 100,
    stockMinimo: seededInt(id + "-min", 50, 800),
    activo: !(i === 27),
    imagenColor: seededPick(id + "-color", coloresProducto),
  };
});

export const vendedores: Vendedor[] = [
  { id: "vend-01", nombre: "Andrea Lucia Paredes", correo: "aparedes@qpack.gt", telefono: "+502 5511 2201", zona: "Guatemala Metro", metaMensualGTQ: 850000, ventaAcumuladaGTQ: 612400, comisionPct: 2.5, activo: true },
  { id: "vend-02", nombre: "Carlos Enrique Morataya", correo: "cmorataya@qpack.gt", telefono: "+502 5511 2202", zona: "Guatemala Metro", metaMensualGTQ: 780000, ventaAcumuladaGTQ: 795300, comisionPct: 2.5, activo: true },
  { id: "vend-03", nombre: "Maria Fernanda Castillo", correo: "mcastillo@qpack.gt", telefono: "+502 5511 2203", zona: "Occidente", metaMensualGTQ: 620000, ventaAcumuladaGTQ: 401200, comisionPct: 2.8, activo: true },
  { id: "vend-04", nombre: "Jose Ramiro Tzoc", correo: "jtzoc@qpack.gt", telefono: "+502 5511 2204", zona: "Occidente", metaMensualGTQ: 540000, ventaAcumuladaGTQ: 498700, comisionPct: 2.8, activo: true },
  { id: "vend-05", nombre: "Silvia Patricia Barrios", correo: "sbarrios@qpack.gt", telefono: "+502 5511 2205", zona: "Oriente", metaMensualGTQ: 590000, ventaAcumuladaGTQ: 322900, comisionPct: 2.6, activo: true },
  { id: "vend-06", nombre: "Luis Fernando Say", correo: "lsay@qpack.gt", telefono: "+502 5511 2206", zona: "Costa Sur", metaMensualGTQ: 710000, ventaAcumuladaGTQ: 683400, comisionPct: 2.6, activo: true },
  { id: "vend-07", nombre: "Gabriela Alejandra Xicay", correo: "gxicay@qpack.gt", telefono: "+502 5511 2207", zona: "Peten", metaMensualGTQ: 410000, ventaAcumuladaGTQ: 189600, comisionPct: 3.0, activo: true },
  { id: "vend-08", nombre: "Ricardo Antonio Falla", correo: "rfalla@qpack.gt", telefono: "+502 5511 2208", zona: "Cuentas Nacionales", metaMensualGTQ: 1200000, ventaAcumuladaGTQ: 1104500, comisionPct: 2.2, activo: true },
];

export const listasPrecios: ListaPrecios[] = [
  {
    id: "lp-distribuidor",
    nombre: "Lista Distribuidor Nacional",
    moneda: "GTQ",
    tipoCliente: "Distribuidor",
    vigenteDesde: "2026-01-01",
    activa: true,
    items: productos.map((p) => ({ productoId: p.id, precio: Math.round(p.precioListaGTQ * 0.88 * 100) / 100, descuentoMaxPct: 5 })),
  },
  {
    id: "lp-mayorista",
    nombre: "Lista Mayorista",
    moneda: "GTQ",
    tipoCliente: "Mayorista",
    vigenteDesde: "2026-01-01",
    activa: true,
    items: productos.map((p) => ({ productoId: p.id, precio: Math.round(p.precioListaGTQ * 0.95 * 100) / 100, descuentoMaxPct: 8 })),
  },
  {
    id: "lp-minorista",
    nombre: "Lista Minorista / Publico",
    moneda: "GTQ",
    tipoCliente: "Minorista",
    vigenteDesde: "2026-01-01",
    activa: true,
    items: productos.map((p) => ({ productoId: p.id, precio: p.precioListaGTQ, descuentoMaxPct: 10 })),
  },
  {
    id: "lp-institucional",
    nombre: "Lista Institucional / Licitaciones",
    moneda: "USD",
    tipoCliente: "Institucional",
    vigenteDesde: "2026-02-15",
    activa: true,
    items: productos.map((p) => ({ productoId: p.id, precio: p.precioListaUSD, descuentoMaxPct: 12 })),
  },
];
