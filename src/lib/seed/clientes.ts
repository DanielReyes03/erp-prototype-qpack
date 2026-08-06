import { formatNit } from "@/lib/nit";
import { VENDEDORES_SEED } from "./vendedores";
import { LISTAS_PRECIOS_SEED } from "./listas-precios";

export interface Contacto {
  id: string;
  nombre: string;
  cargo: string;
  telefono: string;
  email: string;
}

export interface Cliente {
  id: string;
  nit: string;
  nombreComercial: string;
  razonSocial: string;
  direccion: string;
  departamentoId: string;
  municipioId: string;
  zona: string;
  vendedorId: string;
  listaPrecioId: string;
  limiteCredito: number;
  diasCredito: number;
  activo: boolean;
  contactos: Contacto[];
  createdAt: string;
}

interface ClienteSeedInput {
  nombreComercial: string;
  razonSocial: string;
  calle: string;
  departamentoId: string;
  municipioId: string;
  zona: string;
  vendedorIndex: number;
  listaIndex: number;
  limiteCredito: number;
  diasCredito: number;
  contacto: { nombre: string; cargo: string };
}

const RAW: ClienteSeedInput[] = [
  { nombreComercial: "Distribuidora El Progreso", razonSocial: "Distribuidora El Progreso, S.A.", calle: "12 avenida 4-25", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 12", vendedorIndex: 0, listaIndex: 1, limiteCredito: 150000, diasCredito: 30, contacto: { nombre: "Luis Fernando Aguilar", cargo: "Gerente de Compras" } },
  { nombreComercial: "Plásticos de Occidente", razonSocial: "Plásticos de Occidente, S.A.", calle: "0 calle 8-12 zona 3", departamentoId: "quetzaltenango", municipioId: "quetzaltenango-1", zona: "Zona 3", vendedorIndex: 1, listaIndex: 1, limiteCredito: 220000, diasCredito: 45, contacto: { nombre: "Diego Alejandro Hidalgo", cargo: "Gerente General" } },
  { nombreComercial: "Envases y Empaques de Guatemala", razonSocial: "Envases y Empaques de Guatemala, S.A.", calle: "Km 14.5 Carretera a El Salvador", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 10", vendedorIndex: 4, listaIndex: 2, limiteCredito: 350000, diasCredito: 30, contacto: { nombre: "Andrea Sofía Castillo", cargo: "Directora de Operaciones" } },
  { nombreComercial: "Comercializadora San Miguel", razonSocial: "Comercializadora San Miguel, S.A.", calle: "5a avenida 12-30", departamentoId: "guatemala", municipioId: "guatemala-2", zona: "Zona 2 Mixco", vendedorIndex: 0, listaIndex: 0, limiteCredito: 65000, diasCredito: 15, contacto: { nombre: "Marvin Estuardo Chávez", cargo: "Encargado de Bodega" } },
  { nombreComercial: "Grupo Mercantil Xela", razonSocial: "Grupo Mercantil Xela, S.A.", calle: "9a calle 13-40 zona 1", departamentoId: "quetzaltenango", municipioId: "quetzaltenango-1", zona: "Zona 1", vendedorIndex: 1, listaIndex: 1, limiteCredito: 180000, diasCredito: 30, contacto: { nombre: "Paola Isabel Roldán", cargo: "Gerente de Compras" } },
  { nombreComercial: "Bolsas y Empaques del Sur", razonSocial: "Bolsas y Empaques del Sur, S.A.", calle: "3a avenida 6-18", departamentoId: "escuintla", municipioId: "escuintla-1", zona: "Zona 1", vendedorIndex: 2, listaIndex: 1, limiteCredito: 140000, diasCredito: 30, contacto: { nombre: "Rodrigo Antonio Solís", cargo: "Gerente General" } },
  { nombreComercial: "Ferretería y Plásticos La Unión", razonSocial: "Comercial La Unión, S.A.", calle: "18 calle 5-60 zona 1", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 1", vendedorIndex: 0, listaIndex: 0, limiteCredito: 45000, diasCredito: 15, contacto: { nombre: "Estela Marina Ordóñez", cargo: "Propietaria" } },
  { nombreComercial: "Envasadora Metropolitana", razonSocial: "Envasadora Metropolitana, S.A.", calle: "Calzada Aguilar Batres 32-15", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 11", vendedorIndex: 4, listaIndex: 2, limiteCredito: 280000, diasCredito: 45, contacto: { nombre: "Hugo René Palencia", cargo: "Gerente de Producción" } },
  { nombreComercial: "Distribuidora Mixco Plast", razonSocial: "Mixco Plast, S.A.", calle: "6a avenida 3-22 zona 4 de Mixco", departamentoId: "guatemala", municipioId: "guatemala-2", zona: "Zona 4 Mixco", vendedorIndex: 0, listaIndex: 0, limiteCredito: 70000, diasCredito: 15, contacto: { nombre: "Claudia Verónica Recinos", cargo: "Encargada de Compras" } },
  { nombreComercial: "Supermercados La Colonia", razonSocial: "Corporación La Colonia, S.A.", calle: "Boulevard Los Próceres 18-01", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 10", vendedorIndex: 4, listaIndex: 2, limiteCredito: 500000, diasCredito: 45, contacto: { nombre: "Fernando José Batres", cargo: "Gerente de Abastecimiento" } },
  { nombreComercial: "Plastiempaques de Guatemala", razonSocial: "Plastiempaques de Guatemala, S.A.", calle: "Zona 4 de Villa Nueva, 2a calle 8-19", departamentoId: "guatemala", municipioId: "guatemala-3", zona: "Zona 4", vendedorIndex: 0, listaIndex: 1, limiteCredito: 160000, diasCredito: 30, contacto: { nombre: "Wendy Lissette Morán", cargo: "Gerente Comercial" } },
  { nombreComercial: "Distribuidora Antigua", razonSocial: "Distribuidora Antigua, S.A.", calle: "4a calle Oriente #12", departamentoId: "sacatepequez", municipioId: "sacatepequez-1", zona: "Centro Histórico", vendedorIndex: 1, listaIndex: 1, limiteCredito: 95000, diasCredito: 30, contacto: { nombre: "Pablo César Iboy", cargo: "Gerente General" } },
  { nombreComercial: "Comercial San Bartolo", razonSocial: "Comercial San Bartolo, S.A.", calle: "1a avenida 2-14", departamentoId: "sacatepequez", municipioId: "sacatepequez-8", zona: "Centro", vendedorIndex: 1, listaIndex: 0, limiteCredito: 38000, diasCredito: 15, contacto: { nombre: "Gladys Marisol Tuy", cargo: "Propietaria" } },
  { nombreComercial: "Reciclajes y Plásticos del Pacífico", razonSocial: "Reciplast del Pacífico, S.A.", calle: "Km 92 Carretera al Pacífico", departamentoId: "escuintla", municipioId: "escuintla-2", zona: "Zona 1", vendedorIndex: 2, listaIndex: 1, limiteCredito: 210000, diasCredito: 30, contacto: { nombre: "Osmán Aroldo Chacón", cargo: "Gerente de Planta" } },
  { nombreComercial: "Envases Tiquisate", razonSocial: "Envases Tiquisate, S.A.", calle: "3a calle 2-40", departamentoId: "escuintla", municipioId: "escuintla-6", zona: "Zona 1", vendedorIndex: 2, listaIndex: 0, limiteCredito: 52000, diasCredito: 15, contacto: { nombre: "Brenda Judith Solares", cargo: "Encargada de Bodega" } },
  { nombreComercial: "Comercializadora Coatepeque", razonSocial: "Comercializadora Coatepeque, S.A.", calle: "5a avenida 4-10 zona 1", departamentoId: "quetzaltenango", municipioId: "quetzaltenango-17", zona: "Zona 1", vendedorIndex: 1, listaIndex: 1, limiteCredito: 130000, diasCredito: 30, contacto: { nombre: "Nery Waldemar Boc", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora El Cambray", razonSocial: "Distribuidora El Cambray, S.A.", calle: "Carretera a El Salvador Km 16.5", departamentoId: "guatemala", municipioId: "guatemala-5", zona: "Zona Central", vendedorIndex: 4, listaIndex: 1, limiteCredito: 175000, diasCredito: 30, contacto: { nombre: "Ingrid Susana Letona", cargo: "Gerente de Compras" } },
  { nombreComercial: "Tiendas de Conveniencia GO", razonSocial: "Operadora GO Guatemala, S.A.", calle: "Boulevard Vista Hermosa 24-56", departamentoId: "guatemala", municipioId: "guatemala-1", zona: "Zona 15", vendedorIndex: 4, listaIndex: 2, limiteCredito: 420000, diasCredito: 45, contacto: { nombre: "Jorge Mario Estrada", cargo: "Director de Cadena de Suministro" } },
  { nombreComercial: "Empacadora San Rafael", razonSocial: "Empacadora San Rafael, S.A.", calle: "Finca San Rafael, Km 88", departamentoId: "escuintla", municipioId: "escuintla-1", zona: "Zona Industrial", vendedorIndex: 2, listaIndex: 2, limiteCredito: 300000, diasCredito: 45, contacto: { nombre: "Marlon Otoniel Véliz", cargo: "Gerente de Planta" } },
  { nombreComercial: "Distribuidora Petapa", razonSocial: "Distribuidora Petapa, S.A.", calle: "Calzada San Juan 21-08", departamentoId: "guatemala", municipioId: "guatemala-5", zona: "Zona 8", vendedorIndex: 0, listaIndex: 0, limiteCredito: 58000, diasCredito: 15, contacto: { nombre: "Rosa Elvira Us", cargo: "Encargada de Compras" } },
  { nombreComercial: "Comercial Chinautla", razonSocial: "Comercial Chinautla, S.A.", calle: "2a calle 3-11", departamentoId: "guatemala", municipioId: "guatemala-8", zona: "Zona 1", vendedorIndex: 0, listaIndex: 0, limiteCredito: 32000, diasCredito: 15, contacto: { nombre: "Elder Geovani Tzoc", cargo: "Propietario" } },
  { nombreComercial: "Plásticos Industriales de Villa Nueva", razonSocial: "Plásticos Industriales de Villa Nueva, S.A.", calle: "Zona 12 de Villa Nueva, 4a avenida 9-30", departamentoId: "guatemala", municipioId: "guatemala-3", zona: "Zona 12", vendedorIndex: 0, listaIndex: 1, limiteCredito: 195000, diasCredito: 30, contacto: { nombre: "Verónica Alejandra Marroquín", cargo: "Gerente de Producción" } },
  { nombreComercial: "Envases del Norte", razonSocial: "Envases del Norte, S.A.", calle: "3a calle 5-20 zona 1", departamentoId: "alta-verapaz", municipioId: "alta-verapaz-1", zona: "Zona 1", vendedorIndex: 5, listaIndex: 1, limiteCredito: 110000, diasCredito: 30, contacto: { nombre: "Sergio Iván Coy", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora Carchá", razonSocial: "Distribuidora Carchá, S.A.", calle: "1a avenida 2-05", departamentoId: "alta-verapaz", municipioId: "alta-verapaz-2", zona: "Centro", vendedorIndex: 5, listaIndex: 0, limiteCredito: 40000, diasCredito: 15, contacto: { nombre: "Delia Maribel Caal", cargo: "Encargada de Compras" } },
  { nombreComercial: "Comercializadora Zacapaneca", razonSocial: "Comercializadora Zacapaneca, S.A.", calle: "6a calle 4-15 zona 1", departamentoId: "zacapa", municipioId: "zacapa-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 1, limiteCredito: 98000, diasCredito: 30, contacto: { nombre: "Manuel de Jesús Interiano", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora Oriente Chiquimula", razonSocial: "Distribuidora Oriente, S.A.", calle: "4a avenida 6-08", departamentoId: "chiquimula", municipioId: "chiquimula-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 1, limiteCredito: 105000, diasCredito: 30, contacto: { nombre: "Yesenia Paola Mejía", cargo: "Gerente de Compras" } },
  { nombreComercial: "Comercial Jutiapa Plast", razonSocial: "Jutiapa Plast, S.A.", calle: "3a calle 7-21 zona 1", departamentoId: "jutiapa", municipioId: "jutiapa-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 0, limiteCredito: 47000, diasCredito: 15, contacto: { nombre: "Douglas Enrique Godoy", cargo: "Propietario" } },
  { nombreComercial: "Distribuidora Cuilapa", razonSocial: "Distribuidora Cuilapa, S.A.", calle: "2a avenida 4-40", departamentoId: "santa-rosa", municipioId: "santa-rosa-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 0, limiteCredito: 39000, diasCredito: 15, contacto: { nombre: "Ana Gabriela Reyes", cargo: "Encargada de Bodega" } },
  { nombreComercial: "Empaques del Ixil", razonSocial: "Empaques del Ixil, S.A.", calle: "1a calle 3-10 zona 1", departamentoId: "quiche", municipioId: "quiche-1", zona: "Zona 1", vendedorIndex: 5, listaIndex: 1, limiteCredito: 85000, diasCredito: 30, contacto: { nombre: "Miguel Ángel Toma", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora Huehueteca", razonSocial: "Distribuidora Huehueteca, S.A.", calle: "5a avenida 2-33 zona 1", departamentoId: "huehuetenango", municipioId: "huehuetenango-1", zona: "Zona 1", vendedorIndex: 1, listaIndex: 1, limiteCredito: 120000, diasCredito: 30, contacto: { nombre: "Herbert Otoniel Pérez", cargo: "Gerente de Compras" } },
  { nombreComercial: "Comercializadora San Marcos", razonSocial: "Comercializadora San Marcos, S.A.", calle: "4a calle 6-12 zona 3", departamentoId: "san-marcos", municipioId: "san-marcos-1", zona: "Zona 3", vendedorIndex: 1, listaIndex: 0, limiteCredito: 55000, diasCredito: 15, contacto: { nombre: "Lesbia Noemí Orozco", cargo: "Encargada de Compras" } },
  { nombreComercial: "Envases Retalteca", razonSocial: "Envases Retalteca, S.A.", calle: "2a avenida 5-19 zona 1", departamentoId: "retalhuleu", municipioId: "retalhuleu-1", zona: "Zona 1", vendedorIndex: 2, listaIndex: 1, limiteCredito: 100000, diasCredito: 30, contacto: { nombre: "Cristian Adolfo Barrios", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora Mazate", razonSocial: "Distribuidora Mazatenango, S.A.", calle: "6a calle 3-25 zona 1", departamentoId: "suchitepequez", municipioId: "suchitepequez-1", zona: "Zona 1", vendedorIndex: 2, listaIndex: 0, limiteCredito: 42000, diasCredito: 15, contacto: { nombre: "Karen Michelle Ruano", cargo: "Encargada de Compras" } },
  { nombreComercial: "Comercial Atitlán", razonSocial: "Comercial Atitlán, S.A.", calle: "Calle Santander 6-40", departamentoId: "solola", municipioId: "solola-2", zona: "Centro", vendedorIndex: 1, listaIndex: 1, limiteCredito: 68000, diasCredito: 30, contacto: { nombre: "Juan Diego Sicay", cargo: "Propietario" } },
  { nombreComercial: "Distribuidora Chimaltenango", razonSocial: "Distribuidora Chimaltenango, S.A.", calle: "3a avenida 4-18 zona 2", departamentoId: "chimaltenango", municipioId: "chimaltenango-1", zona: "Zona 2", vendedorIndex: 1, listaIndex: 1, limiteCredito: 115000, diasCredito: 30, contacto: { nombre: "Elmer Rolando Xicay", cargo: "Gerente de Compras" } },
  { nombreComercial: "Envases del Progreso Guastatoya", razonSocial: "Envases del Progreso, S.A.", calle: "1a calle 2-09 zona 1", departamentoId: "el-progreso", municipioId: "el-progreso-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 0, limiteCredito: 36000, diasCredito: 15, contacto: { nombre: "Cindy Roxana Argueta", cargo: "Encargada de Compras" } },
  { nombreComercial: "Distribuidora Puerto Barrios", razonSocial: "Distribuidora Puerto Barrios, S.A.", calle: "5a avenida 9-22 zona 1", departamentoId: "izabal", municipioId: "izabal-1", zona: "Zona 1", vendedorIndex: 5, listaIndex: 1, limiteCredito: 145000, diasCredito: 30, contacto: { nombre: "Aracely Beatriz Xol", cargo: "Gerente General" } },
  { nombreComercial: "Comercializadora Petén Plast", razonSocial: "Petén Plast, S.A.", calle: "2a calle 7-14 zona 1", departamentoId: "peten", municipioId: "peten-1", zona: "Zona 1", vendedorIndex: 5, listaIndex: 1, limiteCredito: 90000, diasCredito: 30, contacto: { nombre: "Walter Estuardo Chan", cargo: "Gerente General" } },
  { nombreComercial: "Distribuidora Salamá", razonSocial: "Distribuidora Salamá, S.A.", calle: "4a avenida 3-16", departamentoId: "baja-verapaz", municipioId: "baja-verapaz-1", zona: "Zona 1", vendedorIndex: 5, listaIndex: 0, limiteCredito: 33000, diasCredito: 15, contacto: { nombre: "Ottoniel de Jesús Cux", cargo: "Propietario" } },
  { nombreComercial: "Envasadora Jalapaneca", razonSocial: "Envasadora Jalapaneca, S.A.", calle: "3a calle 5-11 zona 1", departamentoId: "jalapa", municipioId: "jalapa-1", zona: "Zona 1", vendedorIndex: 3, listaIndex: 0, limiteCredito: 37000, diasCredito: 15, contacto: { nombre: "Flor de María Barrera", cargo: "Encargada de Compras" } },
  { nombreComercial: "Distribuidora Fraijanes", razonSocial: "Distribuidora Fraijanes, S.A.", calle: "Km 22.5 Carretera a Fraijanes", departamentoId: "guatemala", municipioId: "guatemala-10", zona: "Centro", vendedorIndex: 0, listaIndex: 0, limiteCredito: 41000, diasCredito: 15, contacto: { nombre: "Nancy Elizabeth Solórzano", cargo: "Encargada de Bodega" } },
  { nombreComercial: "Comercial San José Pinula", razonSocial: "Comercial San José Pinula, S.A.", calle: "1a calle 4-02 zona 1", departamentoId: "guatemala", municipioId: "guatemala-4", zona: "Zona 1", vendedorIndex: 0, listaIndex: 0, limiteCredito: 29000, diasCredito: 15, contacto: { nombre: "Otto René Villagrán", cargo: "Propietario" } },
];

function seedContactos(id: string, contacto: { nombre: string; cargo: string }, i: number): Contacto[] {
  return [
    {
      id: `${id}-ct1`,
      nombre: contacto.nombre,
      cargo: contacto.cargo,
      telefono: `4${String(1000000 + i * 37).slice(0, 7)}`,
      email: `${contacto.nombre.split(" ")[0].toLowerCase()}@${id.replace("cli-", "")}.com.gt`,
    },
  ];
}

export const CLIENTES_SEED: Cliente[] = RAW.map((raw, i) => {
  const id = `cli-${String(i + 1).padStart(3, "0")}`;
  const base = String(1000000 + i * 8171).slice(0, 7);
  return {
    id,
    nit: formatNit(base),
    nombreComercial: raw.nombreComercial,
    razonSocial: raw.razonSocial,
    direccion: raw.calle,
    departamentoId: raw.departamentoId,
    municipioId: raw.municipioId,
    zona: raw.zona,
    vendedorId: VENDEDORES_SEED[raw.vendedorIndex].id,
    listaPrecioId: LISTAS_PRECIOS_SEED[raw.listaIndex].id,
    limiteCredito: raw.limiteCredito,
    diasCredito: raw.diasCredito,
    activo: true,
    contactos: seedContactos(id, raw.contacto, i),
    createdAt: new Date(2024, (i * 3) % 12, ((i * 7) % 27) + 1).toISOString(),
  };
});
