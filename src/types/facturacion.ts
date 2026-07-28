export type TipoDte = "FACT" | "FCAM" | "NABN" | "NDEB" | "NCRE" | "RECI";

export type EstadoDte = "Certificado" | "Anulado" | "Rechazado" | "Pendiente";

export interface LineaDte {
  id: string;
  productoId: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  descuento: number;
  totalLinea: number;
  bienOServicio: "B" | "S";
}

export interface DteEmitido {
  id: string;
  tipo: TipoDte;
  serie: string;
  numero: string;
  numeroAutorizacion: string;
  pedidoId?: string;
  clienteId: string;
  receptorNit: string;
  receptorNombre: string;
  fechaEmision: string;
  fechaCertificacion?: string;
  estado: EstadoDte;
  moneda: "GTQ" | "USD";
  lineas: LineaDte[];
  subtotal: number;
  descuentoTotal: number;
  iva: number;
  total: number;
  motivoAnulacion?: string;
}

export type TipoNota = "Nota de credito" | "Nota de debito";

export interface NotaCreditoDebito {
  id: string;
  tipo: TipoNota;
  serie: string;
  numero: string;
  numeroAutorizacion: string;
  dteOrigenId: string;
  clienteId: string;
  motivo: string;
  fechaEmision: string;
  estado: EstadoDte;
  monto: number;
}
