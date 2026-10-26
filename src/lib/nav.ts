import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Warehouse,
  ShoppingCart,
  FileText,
  Wallet,
  Landmark,
  Calculator,
  BarChart3,
  ShieldCheck,
  Kanban,
} from "lucide-react";
import type { ModuloKey } from "@/lib/seed/roles";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  /** Clave de módulo usada para filtrar por permisos del rol activo. `null` = siempre visible. */
  moduloKey: ModuloKey | null;
}

/**
 * Fuente de verdad de la navegación. Cada fase del build agrega sus grupos/enlaces
 * únicamente cuando las pantallas correspondientes ya existen y funcionan —
 * ningún enlace del sidebar debe apuntar a una pantalla "próximamente".
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    icon: LayoutDashboard,
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    moduloKey: null,
  },
  {
    label: "Datos maestros",
    icon: Users,
    items: [
      { label: "Clientes", href: "/maestros/clientes" },
      { label: "Proveedores", href: "/maestros/proveedores" },
      { label: "Vendedores", href: "/maestros/vendedores" },
      { label: "Productos", href: "/maestros/productos" },
      { label: "Almacenes", href: "/maestros/almacenes" },
      { label: "Listas de precios", href: "/maestros/listas-precios" },
      { label: "Geografía", href: "/maestros/geografia" },
    ],
    moduloKey: "maestros",
  },
  {
    label: "Inventario",
    icon: Warehouse,
    items: [
      { label: "Existencias", href: "/inventario/existencias" },
      { label: "Entradas y salidas", href: "/inventario/movimientos" },
      { label: "Kardex", href: "/inventario/kardex" },
      { label: "Traslados", href: "/inventario/traslados" },
    ],
    moduloKey: "inventario",
  },
  {
    label: "Ventas",
    icon: ShoppingCart,
    items: [
      { label: "Órdenes de venta", href: "/ventas/ordenes" },
      { label: "Cotizaciones", href: "/ventas/cotizaciones" },
      { label: "Despachos y rutas", href: "/ventas/despachos" },
    ],
    moduloKey: "ventas",
  },
  {
    label: "Compras",
    icon: Truck,
    items: [
      { label: "Órdenes de compra", href: "/compras/ordenes" },
      { label: "Recepciones", href: "/compras/recepciones" },
      { label: "Facturas de proveedor", href: "/compras/facturas" },
    ],
    moduloKey: "compras",
  },
  {
    label: "CRM",
    icon: Kanban,
    items: [
      { label: "Oportunidades", href: "/crm/oportunidades" },
      { label: "Actividades", href: "/crm/actividades" },
      { label: "Reclamos", href: "/crm/reclamos" },
    ],
    moduloKey: "crm",
  },
  {
    label: "Facturación (DTE)",
    icon: FileText,
    items: [{ label: "Documentos DTE", href: "/dte" }],
    moduloKey: "dte",
  },
  {
    label: "Tesorería",
    icon: Wallet,
    items: [
      { label: "Cuentas bancarias", href: "/tesoreria/cuentas" },
      { label: "Movimientos", href: "/tesoreria/movimientos" },
    ],
    moduloKey: "tesoreria",
  },
  {
    label: "CxC / CxP",
    icon: Landmark,
    items: [
      { label: "Cuentas por cobrar", href: "/cxc" },
      { label: "Cuentas por pagar", href: "/cxp" },
      { label: "Comisiones", href: "/cxc/comisiones" },
    ],
    moduloKey: "cxcCxp",
  },
  {
    label: "Contabilidad",
    icon: Calculator,
    items: [
      { label: "Catálogo de cuentas", href: "/contabilidad/catalogo" },
      { label: "Asientos manuales", href: "/contabilidad/asientos" },
      { label: "Libro diario", href: "/contabilidad/libro-diario" },
      { label: "Libro mayor", href: "/contabilidad/libro-mayor" },
      { label: "Balance de saldos", href: "/contabilidad/balance" },
      { label: "Libro de ventas", href: "/contabilidad/libro-ventas" },
      { label: "Libro de compras", href: "/contabilidad/libro-compras" },
    ],
    moduloKey: "contabilidad",
  },
  {
    label: "Reportería",
    icon: BarChart3,
    items: [{ label: "Reportes", href: "/reportes" }],
    moduloKey: "reporteria",
  },
  {
    label: "Seguridad",
    icon: ShieldCheck,
    items: [
      { label: "Usuarios", href: "/seguridad/usuarios" },
      { label: "Roles y permisos", href: "/seguridad/roles" },
    ],
    moduloKey: "seguridad",
  },
];
