import { formatNit } from "@/lib/nit";

export interface DatosBancarios {
  banco: string;
  tipoCuenta: "Monetaria" | "Ahorro";
  numeroCuenta: string;
  moneda: "GTQ" | "USD";
}

export interface Proveedor {
  id: string;
  nit: string;
  nombreComercial: string;
  razonSocial: string;
  direccion: string;
  departamentoId: string;
  municipioId: string;
  telefono: string;
  email: string;
  contactoNombre: string;
  diasCredito: number;
  datosBancarios: DatosBancarios;
  activo: boolean;
  createdAt: string;
}

export const BANCOS_GT = [
  "Banco Industrial",
  "Banco G&T Continental",
  "Banrural",
  "BAC Credomatic",
  "Banco Promerica",
];

interface ProveedorSeedInput {
  nombreComercial: string;
  razonSocial: string;
  calle: string;
  departamentoId: string;
  municipioId: string;
  contactoNombre: string;
  diasCredito: number;
  bancoIndex: number;
  moneda: "GTQ" | "USD";
}

const RAW: ProveedorSeedInput[] = [
  { nombreComercial: "Petroquímica Centroamericana", razonSocial: "Petroquímica Centroamericana, S.A.", calle: "Km 14.5 Carretera al Pacífico, Zona Franca", departamentoId: "guatemala", municipioId: "guatemala-3", contactoNombre: "Ricardo Alfonso Meza", diasCredito: 45, bancoIndex: 0, moneda: "USD" },
  { nombreComercial: "Resinas del Istmo", razonSocial: "Resinas del Istmo, S.A.", calle: "5a calle 8-40 zona 4", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Gabriela Montserrat Aldana", diasCredito: 30, bancoIndex: 1, moneda: "USD" },
  { nombreComercial: "Polímeros de México GT", razonSocial: "Polímeros de México Representaciones, S.A.", calle: "12 calle 1-25 zona 10, Torre Empresarial", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Fernando Adrián Solórzano", diasCredito: 60, bancoIndex: 0, moneda: "USD" },
  { nombreComercial: "Empaques Flexibles de Guatemala", razonSocial: "Empaques Flexibles de Guatemala, S.A.", calle: "Zona 12 de Villa Nueva, Parque Industrial Amatitlán", departamentoId: "guatemala", municipioId: "guatemala-3", contactoNombre: "Lourdes Patricia Xitumul", diasCredito: 30, bancoIndex: 2, moneda: "GTQ" },
  { nombreComercial: "Maquinaria y Moldes Industriales", razonSocial: "Maquinaria y Moldes Industriales, S.A.", calle: "3a avenida 14-20 zona 11", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Edgar Rolando Chocoj", diasCredito: 30, bancoIndex: 0, moneda: "USD" },
  { nombreComercial: "Colorantes y Aditivos Plásticos", razonSocial: "Colorantes y Aditivos Plásticos, S.A.", calle: "7a calle 22-18 zona 12", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Mónica Alejandra Barillas", diasCredito: 30, bancoIndex: 1, moneda: "USD" },
  { nombreComercial: "Envases y Tapas Industriales", razonSocial: "Envases y Tapas Industriales, S.A.", calle: "Km 21.5 Carretera a Amatitlán", departamentoId: "guatemala", municipioId: "guatemala-9", contactoNombre: "Julio César Sandoval", diasCredito: 15, bancoIndex: 2, moneda: "GTQ" },
  { nombreComercial: "Distribuidora de Insumos Plásticos", razonSocial: "Distribuidora de Insumos Plásticos, S.A.", calle: "18 avenida 5-30 zona 1", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Astrid Carolina Foronda", diasCredito: 15, bancoIndex: 3, moneda: "GTQ" },
  { nombreComercial: "Reciclados Industriales de Centroamérica", razonSocial: "Reciclados Industriales de Centroamérica, S.A.", calle: "Km 88 Carretera al Pacífico", departamentoId: "escuintla", municipioId: "escuintla-1", contactoNombre: "Byron Adolfo Cifuentes", diasCredito: 30, bancoIndex: 4, moneda: "GTQ" },
  { nombreComercial: "Transportes de Carga El Quetzal", razonSocial: "Transportes El Quetzal, S.A.", calle: "4a calle 9-15 zona 3 de Mixco", departamentoId: "guatemala", municipioId: "guatemala-2", contactoNombre: "Marco Tulio Ramírez", diasCredito: 15, bancoIndex: 2, moneda: "GTQ" },
  { nombreComercial: "Etiquetas y Empaques Impresos", razonSocial: "Etiquetas y Empaques Impresos, S.A.", calle: "2a avenida 11-08 zona 7", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Kimberly Suceth Pérez", diasCredito: 30, bancoIndex: 0, moneda: "GTQ" },
  { nombreComercial: "Repuestos Industriales Continental", razonSocial: "Repuestos Industriales Continental, S.A.", calle: "6a calle 4-55 zona 9", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Selvin Otoniel Mazariegos", diasCredito: 15, bancoIndex: 1, moneda: "USD" },
  { nombreComercial: "Naviera y Logística del Pacífico", razonSocial: "Naviera y Logística del Pacífico, S.A.", calle: "Puerto Quetzal, Bodega 14", departamentoId: "escuintla", municipioId: "escuintla-9", contactoNombre: "Alejandro José Recinos", diasCredito: 45, bancoIndex: 0, moneda: "USD" },
  { nombreComercial: "Servicios Aduanales Integrados", razonSocial: "Servicios Aduanales Integrados, S.A.", calle: "5a avenida 3-12 zona 4", departamentoId: "guatemala", municipioId: "guatemala-1", contactoNombre: "Heidy Marisol Chun", diasCredito: 15, bancoIndex: 3, moneda: "GTQ" },
  { nombreComercial: "Equipos de Extrusión y Soplado", razonSocial: "Equipos de Extrusión y Soplado de Centroamérica, S.A.", calle: "Km 16 Carretera a El Salvador", departamentoId: "guatemala", municipioId: "guatemala-5", contactoNombre: "Pablo Enrique Villatoro", diasCredito: 60, bancoIndex: 0, moneda: "USD" },
];

export const PROVEEDORES_SEED: Proveedor[] = RAW.map((raw, i) => {
  const id = `prov-${String(i + 1).padStart(3, "0")}`;
  const base = String(2000000 + i * 6737).slice(0, 7);
  return {
    id,
    nit: formatNit(base),
    nombreComercial: raw.nombreComercial,
    razonSocial: raw.razonSocial,
    direccion: raw.calle,
    departamentoId: raw.departamentoId,
    municipioId: raw.municipioId,
    telefono: `2${String(4000000 + i * 53).slice(0, 7)}`,
    email: `contacto@${raw.nombreComercial.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com.gt`,
    contactoNombre: raw.contactoNombre,
    diasCredito: raw.diasCredito,
    datosBancarios: {
      banco: BANCOS_GT[raw.bancoIndex],
      tipoCuenta: i % 3 === 0 ? "Ahorro" : "Monetaria",
      numeroCuenta: String(100000000 + i * 987654).slice(0, 12),
      moneda: raw.moneda,
    },
    activo: true,
    createdAt: new Date(2023, (i * 5) % 12, ((i * 11) % 27) + 1).toISOString(),
  };
});
