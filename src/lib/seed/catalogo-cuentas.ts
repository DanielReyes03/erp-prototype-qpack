export type TipoCuenta = "Activo" | "Pasivo" | "Patrimonio" | "Ingreso" | "Costo" | "Gasto";

export interface CuentaContable {
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  nivel: 1 | 2 | 3;
  padreCodigo?: string;
  imputable: boolean;
}

export const CATALOGO_CUENTAS: CuentaContable[] = [
  // 1. ACTIVO
  { codigo: "1", nombre: "Activo", tipo: "Activo", nivel: 1, imputable: false },
  { codigo: "1.1", nombre: "Activo Corriente", tipo: "Activo", nivel: 2, padreCodigo: "1", imputable: false },
  { codigo: "1.1.01", nombre: "Caja General", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.02", nombre: "Bancos Quetzales", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.03", nombre: "Bancos Dólares", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.04", nombre: "Clientes Nacionales", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.05", nombre: "Estimación para Cuentas Incobrables", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.06", nombre: "Inventario de Mercadería", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.07", nombre: "IVA Crédito Fiscal", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.1.08", nombre: "Anticipo a Proveedores", tipo: "Activo", nivel: 3, padreCodigo: "1.1", imputable: true },
  { codigo: "1.2", nombre: "Activo No Corriente", tipo: "Activo", nivel: 2, padreCodigo: "1", imputable: false },
  { codigo: "1.2.01", nombre: "Mobiliario y Equipo", tipo: "Activo", nivel: 3, padreCodigo: "1.2", imputable: true },
  { codigo: "1.2.02", nombre: "Vehículos de Reparto", tipo: "Activo", nivel: 3, padreCodigo: "1.2", imputable: true },
  { codigo: "1.2.03", nombre: "Equipo de Cómputo", tipo: "Activo", nivel: 3, padreCodigo: "1.2", imputable: true },
  { codigo: "1.2.04", nombre: "Depreciación Acumulada", tipo: "Activo", nivel: 3, padreCodigo: "1.2", imputable: true },

  // 2. PASIVO
  { codigo: "2", nombre: "Pasivo", tipo: "Pasivo", nivel: 1, imputable: false },
  { codigo: "2.1", nombre: "Pasivo Corriente", tipo: "Pasivo", nivel: 2, padreCodigo: "2", imputable: false },
  { codigo: "2.1.01", nombre: "Proveedores Locales", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.1.02", nombre: "Proveedores del Exterior", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.1.03", nombre: "IVA Débito Fiscal", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.1.04", nombre: "ISR por Pagar", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.1.05", nombre: "Sueldos y Prestaciones por Pagar", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.1.06", nombre: "Comisiones por Pagar", tipo: "Pasivo", nivel: 3, padreCodigo: "2.1", imputable: true },
  { codigo: "2.2", nombre: "Pasivo No Corriente", tipo: "Pasivo", nivel: 2, padreCodigo: "2", imputable: false },
  { codigo: "2.2.01", nombre: "Préstamos Bancarios a Largo Plazo", tipo: "Pasivo", nivel: 3, padreCodigo: "2.2", imputable: true },

  // 3. PATRIMONIO
  { codigo: "3", nombre: "Patrimonio", tipo: "Patrimonio", nivel: 1, imputable: false },
  { codigo: "3.1", nombre: "Capital Contable", tipo: "Patrimonio", nivel: 2, padreCodigo: "3", imputable: false },
  { codigo: "3.1.01", nombre: "Capital Social", tipo: "Patrimonio", nivel: 3, padreCodigo: "3.1", imputable: true },
  { codigo: "3.1.02", nombre: "Utilidades Retenidas", tipo: "Patrimonio", nivel: 3, padreCodigo: "3.1", imputable: true },
  { codigo: "3.1.03", nombre: "Utilidad del Ejercicio", tipo: "Patrimonio", nivel: 3, padreCodigo: "3.1", imputable: true },

  // 4. INGRESOS
  { codigo: "4", nombre: "Ingresos", tipo: "Ingreso", nivel: 1, imputable: false },
  { codigo: "4.1", nombre: "Ventas", tipo: "Ingreso", nivel: 2, padreCodigo: "4", imputable: false },
  { codigo: "4.1.01", nombre: "Ventas Locales", tipo: "Ingreso", nivel: 3, padreCodigo: "4.1", imputable: true },
  { codigo: "4.1.02", nombre: "Ventas de Exportación", tipo: "Ingreso", nivel: 3, padreCodigo: "4.1", imputable: true },
  { codigo: "4.1.03", nombre: "Devoluciones y Descuentos sobre Ventas", tipo: "Ingreso", nivel: 3, padreCodigo: "4.1", imputable: true },
  { codigo: "4.2", nombre: "Otros Ingresos", tipo: "Ingreso", nivel: 2, padreCodigo: "4", imputable: false },
  { codigo: "4.2.01", nombre: "Ingresos Financieros", tipo: "Ingreso", nivel: 3, padreCodigo: "4.2", imputable: true },

  // 5. COSTOS
  { codigo: "5", nombre: "Costos", tipo: "Costo", nivel: 1, imputable: false },
  { codigo: "5.1", nombre: "Costo de Ventas", tipo: "Costo", nivel: 2, padreCodigo: "5", imputable: false },
  { codigo: "5.1.01", nombre: "Costo de Mercadería Vendida", tipo: "Costo", nivel: 3, padreCodigo: "5.1", imputable: true },

  // 6. GASTOS
  { codigo: "6", nombre: "Gastos", tipo: "Gasto", nivel: 1, imputable: false },
  { codigo: "6.1", nombre: "Gastos de Venta", tipo: "Gasto", nivel: 2, padreCodigo: "6", imputable: false },
  { codigo: "6.1.01", nombre: "Comisiones sobre Ventas", tipo: "Gasto", nivel: 3, padreCodigo: "6.1", imputable: true },
  { codigo: "6.1.02", nombre: "Fletes sobre Ventas", tipo: "Gasto", nivel: 3, padreCodigo: "6.1", imputable: true },
  { codigo: "6.2", nombre: "Gastos de Administración", tipo: "Gasto", nivel: 2, padreCodigo: "6", imputable: false },
  { codigo: "6.2.01", nombre: "Sueldos Administrativos", tipo: "Gasto", nivel: 3, padreCodigo: "6.2", imputable: true },
  { codigo: "6.2.02", nombre: "Papelería y Útiles", tipo: "Gasto", nivel: 3, padreCodigo: "6.2", imputable: true },
  { codigo: "6.2.03", nombre: "Depreciaciones", tipo: "Gasto", nivel: 3, padreCodigo: "6.2", imputable: true },
  { codigo: "6.2.04", nombre: "Gastos de Caja Chica", tipo: "Gasto", nivel: 3, padreCodigo: "6.2", imputable: true },
  { codigo: "6.3", nombre: "Gastos Financieros", tipo: "Gasto", nivel: 2, padreCodigo: "6", imputable: false },
  { codigo: "6.3.01", nombre: "Intereses Bancarios", tipo: "Gasto", nivel: 3, padreCodigo: "6.3", imputable: true },
];

export function cuentaDe(codigo: string): CuentaContable | undefined {
  return CATALOGO_CUENTAS.find((c) => c.codigo === codigo);
}

export function hijosDe(codigo: string | undefined): CuentaContable[] {
  return CATALOGO_CUENTAS.filter((c) => c.padreCodigo === codigo);
}
