import type { Aprobacion, ParametroSistema, Rol, Usuario } from "@/types";
import { addDays, seededInt, seededPick, HOY } from "./seed";
import { bodegas } from "./inventario";
import { vendedores } from "./catalogos";

export const roles: Rol[] = [
  { id: "rol-admin", nombre: "Administrador del sistema", descripcion: "Acceso total a todos los modulos y configuracion.", permisos: ["*"], usuarios: 2, esSistema: true },
  { id: "rol-gerencia", nombre: "Gerencia general", descripcion: "Visualizacion de todos los modulos, aprobaciones de alto monto.", permisos: ["ver:*", "aprobar:*"], usuarios: 3, esSistema: false },
  { id: "rol-ventas", nombre: "Vendedor", descripcion: "Gestion de clientes, cotizaciones y pedidos propios.", permisos: ["crm:*", "ventas:crear", "ventas:ver"], usuarios: 8, esSistema: false },
  { id: "rol-bodega", nombre: "Encargado de bodega", descripcion: "Gestion de existencias, recepciones y despachos.", permisos: ["inventario:*", "compras:recepcion"], usuarios: 5, esSistema: false },
  { id: "rol-compras", nombre: "Analista de compras", descripcion: "Gestion de ordenes locales, importaciones y embarques.", permisos: ["compras:*", "logistica:ver"], usuarios: 3, esSistema: false },
  { id: "rol-finanzas", nombre: "Analista financiero", descripcion: "Gestion de cartera, bancos y conciliaciones.", permisos: ["finanzas:*", "contabilidad:ver"], usuarios: 4, esSistema: false },
  { id: "rol-contabilidad", nombre: "Contador", descripcion: "Gestion de polizas, libros y estados financieros.", permisos: ["contabilidad:*"], usuarios: 2, esSistema: false },
];

const nombresUsuarios = [
  { nombre: "Roberto Alejandro Girón", cargo: "Gerente General", rolId: "rol-gerencia" },
  { nombre: "Sofia Recinos", cargo: "Gerente de Inventario", rolId: "rol-bodega" },
  { nombre: "Carlos Bran", cargo: "Gerente de Operaciones", rolId: "rol-gerencia" },
  { nombre: "Karen Ivonne Xitumul", cargo: "Contadora General", rolId: "rol-contabilidad" },
  { nombre: "Estuardo Salguero", cargo: "Auxiliar Contable", rolId: "rol-contabilidad" },
  { nombre: "Mynor Estuardo Lopez", cargo: "Encargado Bodega Central", rolId: "rol-bodega" },
  { nombre: "Alicia Marleny Tuc", cargo: "Encargada Bodega Xela", rolId: "rol-bodega" },
  { nombre: "Byron Adalberto Reyes", cargo: "Encargado Bodega Chiquimula", rolId: "rol-bodega" },
  { nombre: "Fatima Alejandra Ochoa", cargo: "Analista de Compras", rolId: "rol-compras" },
  { nombre: "Ottoniel de Leon", cargo: "Analista de Importaciones", rolId: "rol-compras" },
  { nombre: "Vivian Lorena Chacon", cargo: "Analista Financiero", rolId: "rol-finanzas" },
  { nombre: "Admin QPack", cargo: "Administrador de Sistemas", rolId: "rol-admin" },
];

export const usuarios: Usuario[] = [
  ...nombresUsuarios.map((u, i) => {
    const id = `usr-${String(i + 1).padStart(3, "0")}`;
    return {
      id,
      nombre: u.nombre,
      correo: `${u.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z ]/g, "")
        .split(" ")
        .slice(0, 2)
        .join(".")}@qpack.gt`,
      cargo: u.cargo,
      rolId: u.rolId,
      bodegaAsignadaId: u.cargo.includes("Bodega") ? bodegas.find((b) => u.cargo.includes(b.municipio) || u.cargo.includes("Central"))?.id ?? bodegas[0].id : undefined,
      avatarIniciales: u.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      activo: true,
      ultimoAcceso: addDays(HOY, -seededInt(id + "-acc", 0, 5)),
    };
  }),
  ...vendedores.map((v, i) => {
    const id = `usr-vend-${String(i + 1).padStart(3, "0")}`;
    return {
      id,
      nombre: v.nombre,
      correo: v.correo,
      cargo: "Vendedor",
      rolId: "rol-ventas",
      avatarIniciales: v.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      activo: v.activo,
      ultimoAcceso: addDays(HOY, -seededInt(id + "-acc", 0, 5)),
    };
  }),
];

const tiposAprobacion = ["Descuento", "Credito", "Ajuste inventario", "Orden de compra", "Devolucion"] as const;

export const aprobaciones: Aprobacion[] = Array.from({ length: 16 }).map((_, i) => {
  const id = `apr-${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    tipo: seededPick(id + "-tipo", tiposAprobacion),
    documentoReferencia: `${seededPick(id + "-pre", ["COT", "OCL", "AJI", "DEV"] as const)}-2026-${seededInt(id + "-num", 1000, 9999)}`,
    solicitadoPor: seededPick(id + "-user", vendedores.map((v) => v.nombre)),
    fechaSolicitud: addDays(HOY, -seededInt(id + "-fecha", 0, 15)),
    montoGTQ: seededInt(id + "-monto", 2000, 220000),
    estado: seededPick(id + "-estado", ["Pendiente", "Aprobada", "Rechazada"] as const),
    aprobador: "Roberto Alejandro Girón",
    justificacion: "Solicitud generada automaticamente por politica de montos y descuentos.",
  };
});

export const parametrosSistema: ParametroSistema[] = [
  { id: "par-01", categoria: "Facturacion", clave: "fel.proveedor.certificador", valor: "Digifact", descripcion: "Proveedor de certificacion FEL activo.", editable: true },
  { id: "par-02", categoria: "Facturacion", clave: "iva.porcentaje", valor: "12", descripcion: "Porcentaje de IVA aplicado a las ventas.", editable: false },
  { id: "par-03", categoria: "Inventario", clave: "inventario.metodo_costeo", valor: "Promedio ponderado", descripcion: "Metodo de costeo utilizado en el kardex.", editable: true },
  { id: "par-04", categoria: "Ventas", clave: "ventas.dias_vigencia_cotizacion", valor: "15", descripcion: "Dias de vigencia por defecto de una cotizacion.", editable: true },
  { id: "par-05", categoria: "Compras", clave: "importacion.moneda_base", valor: "USD", descripcion: "Moneda base para ordenes de importacion.", editable: true },
  { id: "par-06", categoria: "Finanzas", clave: "finanzas.tipo_cambio_referencia", valor: "7.75", descripcion: "Tipo de cambio de referencia GTQ/USD.", editable: true },
  { id: "par-07", categoria: "General", clave: "sistema.zona_horaria", valor: "America/Guatemala", descripcion: "Zona horaria utilizada en fechas del sistema.", editable: false },
  { id: "par-08", categoria: "Aprobaciones", clave: "aprobaciones.limite_descuento_pct", valor: "10", descripcion: "Descuento maximo sin requerir aprobacion.", editable: true },
];
