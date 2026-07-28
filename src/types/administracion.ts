export interface Aprobacion {
  id: string;
  tipo: "Descuento" | "Credito" | "Ajuste inventario" | "Orden de compra" | "Devolucion";
  documentoReferencia: string;
  solicitadoPor: string;
  fechaSolicitud: string;
  montoGTQ: number;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  aprobador: string;
  justificacion: string;
}

export interface ParametroSistema {
  id: string;
  categoria: string;
  clave: string;
  valor: string;
  descripcion: string;
  editable: boolean;
}
