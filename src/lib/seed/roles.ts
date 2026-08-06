export type ModuloKey =
  | "maestros"
  | "inventario"
  | "ventas"
  | "compras"
  | "crm"
  | "dte"
  | "tesoreria"
  | "cxcCxp"
  | "contabilidad"
  | "reporteria"
  | "seguridad";

export const MODULOS: { key: ModuloKey; label: string }[] = [
  { key: "maestros", label: "Datos maestros" },
  { key: "inventario", label: "Inventario" },
  { key: "ventas", label: "Ventas" },
  { key: "compras", label: "Compras" },
  { key: "crm", label: "CRM" },
  { key: "dte", label: "Facturación (DTE)" },
  { key: "tesoreria", label: "Tesorería" },
  { key: "cxcCxp", label: "CxC / CxP" },
  { key: "contabilidad", label: "Contabilidad" },
  { key: "reporteria", label: "Reportería" },
  { key: "seguridad", label: "Seguridad" },
];

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Record<ModuloKey, boolean>;
}

function permisosDe(activos: ModuloKey[]): Record<ModuloKey, boolean> {
  const base = Object.fromEntries(MODULOS.map((m) => [m.key, false])) as Record<ModuloKey, boolean>;
  for (const key of activos) base[key] = true;
  return base;
}

export const ACCESO_TOTAL: Record<ModuloKey, boolean> = permisosDe(MODULOS.map((m) => m.key));

export const ROLES_SEED: Rol[] = [
  {
    id: "rol-admin",
    nombre: "Administrador",
    descripcion: "Acceso total a todos los módulos del sistema.",
    permisos: permisosDe(MODULOS.map((m) => m.key)),
  },
  {
    id: "rol-gerente",
    nombre: "Gerente Comercial",
    descripcion: "Supervisión de ventas, CRM, facturación, cuentas por cobrar y reportería.",
    permisos: permisosDe(["maestros", "ventas", "crm", "dte", "cxcCxp", "reporteria"]),
  },
  {
    id: "rol-vendedor",
    nombre: "Vendedor",
    descripcion: "Gestión de clientes, oportunidades y órdenes de venta propias.",
    permisos: permisosDe(["maestros", "ventas", "crm"]),
  },
  {
    id: "rol-contador",
    nombre: "Contador",
    descripcion: "Contabilidad, tesorería, facturación electrónica y cuentas por cobrar/pagar.",
    permisos: permisosDe(["dte", "tesoreria", "cxcCxp", "contabilidad", "reporteria"]),
  },
  {
    id: "rol-bodega",
    nombre: "Encargado de bodega",
    descripcion: "Control de existencias, movimientos de inventario y recepción de compras.",
    permisos: permisosDe(["inventario", "compras"]),
  },
];
