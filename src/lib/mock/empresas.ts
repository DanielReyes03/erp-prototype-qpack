import type { Empresa } from "@/types";

export const empresaPorDefecto: Empresa = {
  id: "emp-qpack-gt",
  nombre: "QPack Sociedad Anonima",
  nombreComercial: "QPack S.A.",
  nit: "5589214-3",
  direccion: {
    linea1: "Km 14.5 Carretera al Pacifico, Bodega 7",
    municipio: "Villa Nueva",
    departamento: "Guatemala",
    pais: "Guatemala",
    zona: "N/A",
  },
  logoIniciales: "QP",
  colorMarca: "#2E5AAC",
  moneda: "GTQ",
  regimenFel: "General",
};
