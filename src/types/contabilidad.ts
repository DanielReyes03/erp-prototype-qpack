export interface CuentaContable {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Activo" | "Pasivo" | "Patrimonio" | "Ingreso" | "Costo" | "Gasto";
  naturaleza: "Deudora" | "Acreedora";
  nivel: number;
  cuentaPadreId?: string;
}

export interface LineaPoliza {
  id: string;
  cuentaId: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export type TipoPoliza = "Ingreso" | "Egreso" | "Diario";

export interface Poliza {
  id: string;
  folio: string;
  tipo: TipoPoliza;
  fecha: string;
  concepto: string;
  estado: "Borrador" | "Contabilizada" | "Anulada";
  lineas: LineaPoliza[];
  elaboradoPor: string;
  origenModulo: string;
}

export interface MovimientoMayor {
  id: string;
  cuentaId: string;
  fecha: string;
  polizaFolio: string;
  concepto: string;
  debe: number;
  haber: number;
  saldo: number;
}

export interface EstadoFinancieroLinea {
  concepto: string;
  nivel: number;
  montoActual: number;
  montoAnterior: number;
  esTotal?: boolean;
}

export interface LibroLegal {
  id: string;
  nombre: "Libro de Compras" | "Libro de Ventas" | "Inventarios" | "Estados Financieros";
  periodo: string;
  estado: "Al dia" | "Pendiente de impresion" | "Presentado";
  fechaLimite: string;
}
