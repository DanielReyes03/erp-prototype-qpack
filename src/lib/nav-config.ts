import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Handshake,
  ClipboardList,
  FileText,
  Truck,
  Package,
  Boxes,
  Ship,
  Landmark,
  Calculator,
  Route,
  Settings,
  Warehouse,
  ArrowLeftRight,
  ClipboardCheck,
  PackageSearch,
  ReceiptText,
  Anchor,
  Scale,
  Banknote,
  BookOpen,
  UserCog,
  ShieldCheck,
  CheckSquare,
  SlidersHorizontal,
  Container,
  UserSquare2,
  Map,
  Car,
  Tags,
  Ruler,
  DollarSign,
  FileBarChart,
  Wallet,
  CreditCard,
  Blocks,
  Undo2,
  PackagePlus,
  PackageMinus,
  BookmarkCheck,
  Layers,
  ScanBarcode,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "Inicio",
    icon: LayoutDashboard,
    items: [{ title: "Panel gerencial", href: "/inicio", icon: LayoutDashboard }],
  },
  {
    title: "CRM",
    icon: Handshake,
    items: [
      { title: "Clientes", href: "/crm/clientes", icon: Users },
      { title: "Oportunidades", href: "/crm/oportunidades", icon: Handshake },
      { title: "Actividades", href: "/crm/actividades", icon: ClipboardList },
    ],
  },
  {
    title: "Ventas",
    icon: FileText,
    items: [
      { title: "Cotizaciones", href: "/ventas/cotizaciones", icon: FileText },
      { title: "Pedidos", href: "/ventas/pedidos", icon: ClipboardCheck },
      { title: "Despachos", href: "/ventas/despachos", icon: Truck },
      { title: "Devoluciones", href: "/ventas/devoluciones", icon: Undo2 },
    ],
  },
  {
    title: "Facturacion",
    icon: ReceiptText,
    items: [
      { title: "DTE emitidos", href: "/facturacion/dte", icon: ReceiptText },
      { title: "Notas de credito/debito", href: "/facturacion/notas", icon: FileBarChart },
    ],
  },
  {
    title: "Inventario",
    icon: Boxes,
    items: [
      { title: "Existencias", href: "/inventario/existencias", icon: Boxes },
      { title: "Entradas", href: "/inventario/entradas", icon: PackagePlus },
      { title: "Salidas", href: "/inventario/salidas", icon: PackageMinus },
      { title: "Reservas", href: "/inventario/reservas", icon: BookmarkCheck },
      { title: "Backorder", href: "/inventario/backorder", icon: PackageSearch },
      { title: "Transferencias", href: "/inventario/transferencias", icon: ArrowLeftRight },
      { title: "Ajustes", href: "/inventario/ajustes", icon: SlidersHorizontal },
      { title: "Conteos", href: "/inventario/conteos", icon: CheckSquare },
      { title: "Bodegas y ubicaciones", href: "/inventario/bodegas", icon: Warehouse },
      { title: "Lotes", href: "/inventario/lotes", icon: Layers },
    ],
  },
  {
    title: "Compras",
    icon: Package,
    items: [
      { title: "Ordenes locales", href: "/compras/ordenes-locales", icon: ClipboardList },
      { title: "Ordenes de importacion", href: "/compras/ordenes-importacion", icon: Container },
      { title: "Embarques", href: "/compras/embarques", icon: Ship },
      { title: "Costeo de importacion", href: "/compras/costeo", icon: Calculator },
      { title: "Recepciones", href: "/compras/recepciones", icon: PackageSearch },
    ],
  },
  {
    title: "Finanzas",
    icon: Landmark,
    items: [
      { title: "Cuentas por cobrar", href: "/finanzas/cuentas-por-cobrar", icon: Wallet },
      { title: "Cuentas por pagar", href: "/finanzas/cuentas-por-pagar", icon: CreditCard },
      { title: "Bancos", href: "/finanzas/bancos", icon: Banknote },
      { title: "Conciliacion", href: "/finanzas/conciliacion", icon: Scale },
    ],
  },
  {
    title: "Contabilidad",
    icon: Blocks,
    items: [
      { title: "Polizas", href: "/contabilidad/polizas", icon: FileText },
      { title: "Libro mayor", href: "/contabilidad/mayor", icon: BookOpen },
      { title: "Estados financieros", href: "/contabilidad/estados-financieros", icon: FileBarChart },
      { title: "Libros legales", href: "/contabilidad/libros-legales", icon: BookmarkCheck },
    ],
  },
  {
    title: "Logistica",
    icon: Anchor,
    items: [
      { title: "Navieras", href: "/logistica/navieras", icon: Ship },
      { title: "Contenedores", href: "/logistica/contenedores", icon: Container },
      { title: "Transportistas", href: "/logistica/transportistas", icon: Truck },
      { title: "Agentes aduaneros", href: "/logistica/agentes-aduaneros", icon: UserSquare2 },
      { title: "Distribuidores", href: "/logistica/distribuidores", icon: Map },
      { title: "Vehiculos", href: "/logistica/vehiculos", icon: Car },
      { title: "Rutas", href: "/logistica/rutas", icon: Route },
    ],
  },
  {
    title: "Catalogos",
    icon: Tags,
    items: [
      { title: "Productos", href: "/catalogos/productos", icon: ScanBarcode },
      { title: "Unidades de medida", href: "/catalogos/unidades-medida", icon: Ruler },
      { title: "Listas de precios", href: "/catalogos/listas-precios", icon: DollarSign },
      { title: "Proveedores", href: "/catalogos/proveedores", icon: Package },
      { title: "Vendedores", href: "/catalogos/vendedores", icon: Users },
      { title: "Partidas arancelarias", href: "/catalogos/partidas-arancelarias", icon: Tags },
    ],
  },
  {
    title: "Administracion",
    icon: Settings,
    items: [
      { title: "Usuarios", href: "/administracion/usuarios", icon: UserCog },
      { title: "Roles y permisos", href: "/administracion/roles", icon: ShieldCheck },
      { title: "Aprobaciones", href: "/administracion/aprobaciones", icon: CheckSquare },
      { title: "Parametros", href: "/administracion/parametros", icon: SlidersHorizontal },
    ],
  },
];

export const allNavItems: (NavItem & { groupTitle: string })[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, groupTitle: g.title }))
);

export function findNavItem(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    const item = group.items.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
    if (item) return { group, item };
  }
  return undefined;
}
