export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  costo: number;
  precioBase: number;
  existenciaTotal: number;
  puntoReorden: number;
  activo: boolean;
  createdAt: string;
}

export const CATEGORIAS_PRODUCTO = [
  "Resinas",
  "Bolsas",
  "Envases",
  "Tapas y cierres",
  "Aditivos y colorantes",
  "Film y empaque",
] as const;

interface ProductoSeedInput {
  sku: string;
  nombre: string;
  categoria: (typeof CATEGORIAS_PRODUCTO)[number];
  unidadMedida: string;
  costo: number;
  margen: number; // multiplicador sobre costo para precioBase
  existenciaTotal: number;
  puntoReorden: number;
}

const RESINAS: ProductoSeedInput[] = [
  { sku: "RES-PEAD-25K", nombre: "Resina PEAD Alta Densidad 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 320, margen: 1.35, existenciaTotal: 840, puntoReorden: 200 },
  { sku: "RES-PEBD-25K", nombre: "Resina PEBD Baja Densidad 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 335, margen: 1.35, existenciaTotal: 610, puntoReorden: 180 },
  { sku: "RES-PP-HOMO-25K", nombre: "Resina PP Homopolímero 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 340, margen: 1.32, existenciaTotal: 520, puntoReorden: 150 },
  { sku: "RES-PP-COPO-25K", nombre: "Resina PP Copolímero 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 365, margen: 1.32, existenciaTotal: 280, puntoReorden: 100 },
  { sku: "RES-PVC-RIG-25K", nombre: "Resina PVC Rígido 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 310, margen: 1.3, existenciaTotal: 390, puntoReorden: 120 },
  { sku: "RES-PVC-FLEX-25K", nombre: "Resina PVC Flexible 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 300, margen: 1.3, existenciaTotal: 210, puntoReorden: 90 },
  { sku: "RES-PET-GB-25K", nombre: "Resina PET Grado Botella 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 380, margen: 1.38, existenciaTotal: 460, puntoReorden: 150 },
  { sku: "RES-PS-CRIS-25K", nombre: "Resina PS Cristal 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 355, margen: 1.33, existenciaTotal: 190, puntoReorden: 80 },
  { sku: "RES-PS-AI-25K", nombre: "Resina PS Alto Impacto 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 365, margen: 1.33, existenciaTotal: 150, puntoReorden: 70 },
  { sku: "RES-ABS-25K", nombre: "Resina ABS Industrial 25 kg", categoria: "Resinas", unidadMedida: "saco", costo: 420, margen: 1.3, existenciaTotal: 95, puntoReorden: 40 },
];

const BOLSAS: ProductoSeedInput[] = [
  { sku: "BOL-CAM-150N", nombre: "Bolsa Camiseta Calibre 150 Negra (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 95, margen: 1.25, existenciaTotal: 1200, puntoReorden: 300 },
  { sku: "BOL-CAM-175N", nombre: "Bolsa Camiseta Calibre 175 Negra (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 105, margen: 1.25, existenciaTotal: 980, puntoReorden: 280 },
  { sku: "BOL-CAM-200N", nombre: "Bolsa Camiseta Calibre 200 Negra (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 120, margen: 1.25, existenciaTotal: 1450, puntoReorden: 350 },
  { sku: "BOL-CAM-250N", nombre: "Bolsa Camiseta Calibre 250 Negra (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 140, margen: 1.25, existenciaTotal: 620, puntoReorden: 200 },
  { sku: "BOL-CAM-200B", nombre: "Bolsa Camiseta Calibre 200 Blanca (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 122, margen: 1.25, existenciaTotal: 540, puntoReorden: 180 },
  { sku: "BOL-CAM-200C", nombre: "Bolsa Camiseta Calibre 200 Colores Surtidos (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 128, margen: 1.25, existenciaTotal: 310, puntoReorden: 120 },
  { sku: "BOL-BAS-200G", nombre: "Bolsa para Basura Calibre 200 Grande Negra (paquete)", categoria: "Bolsas", unidadMedida: "paquete", costo: 68, margen: 1.28, existenciaTotal: 890, puntoReorden: 250 },
  { sku: "BOL-BAS-300G", nombre: "Bolsa para Basura Calibre 300 Grande Negra (paquete)", categoria: "Bolsas", unidadMedida: "paquete", costo: 82, margen: 1.28, existenciaTotal: 610, puntoReorden: 200 },
  { sku: "BOL-BAS-200M", nombre: "Bolsa para Basura Calibre 200 Mediana Negra (paquete)", categoria: "Bolsas", unidadMedida: "paquete", costo: 58, margen: 1.28, existenciaTotal: 720, puntoReorden: 220 },
  { sku: "BOL-IND-400", nombre: "Bolsa Industrial Calibre 400 Reforzada (fardo)", categoria: "Bolsas", unidadMedida: "fardo", costo: 210, margen: 1.22, existenciaTotal: 180, puntoReorden: 60 },
  { sku: "BOL-EMP-T-PEQ", nombre: "Bolsa de Empaque Transparente Pequeña (millar)", categoria: "Bolsas", unidadMedida: "millar", costo: 145, margen: 1.3, existenciaTotal: 320, puntoReorden: 100 },
  { sku: "BOL-EMP-T-MED", nombre: "Bolsa de Empaque Transparente Mediana (millar)", categoria: "Bolsas", unidadMedida: "millar", costo: 175, margen: 1.3, existenciaTotal: 260, puntoReorden: 90 },
  { sku: "BOL-EMP-T-GDE", nombre: "Bolsa de Empaque Transparente Grande (millar)", categoria: "Bolsas", unidadMedida: "millar", costo: 210, margen: 1.3, existenciaTotal: 150, puntoReorden: 60 },
  { sku: "BOL-HIELO-1LB", nombre: "Bolsa para Hielo 1 Libra (millar)", categoria: "Bolsas", unidadMedida: "millar", costo: 95, margen: 1.3, existenciaTotal: 400, puntoReorden: 130 },
  { sku: "BOL-VACIO-EST", nombre: "Bolsa al Vacío Estándar (paquete)", categoria: "Bolsas", unidadMedida: "paquete", costo: 110, margen: 1.27, existenciaTotal: 240, puntoReorden: 80 },
];

const ENVASES: ProductoSeedInput[] = [
  { sku: "ENV-PET-250A", nombre: "Envase PET 250 ml Boca Angosta", categoria: "Envases", unidadMedida: "unidad", costo: 0.85, margen: 1.4, existenciaTotal: 18500, puntoReorden: 4000 },
  { sku: "ENV-PET-500A", nombre: "Envase PET 500 ml Boca Angosta", categoria: "Envases", unidadMedida: "unidad", costo: 1.1, margen: 1.4, existenciaTotal: 22000, puntoReorden: 5000 },
  { sku: "ENV-PET-500B", nombre: "Envase PET 500 ml Boca Ancha", categoria: "Envases", unidadMedida: "unidad", costo: 1.25, margen: 1.4, existenciaTotal: 15200, puntoReorden: 4000 },
  { sku: "ENV-PET-1000A", nombre: "Envase PET 1000 ml Boca Angosta", categoria: "Envases", unidadMedida: "unidad", costo: 1.65, margen: 1.38, existenciaTotal: 9800, puntoReorden: 2500 },
  { sku: "ENV-PET-1500A", nombre: "Envase PET 1500 ml Boca Angosta", categoria: "Envases", unidadMedida: "unidad", costo: 2.1, margen: 1.38, existenciaTotal: 6200, puntoReorden: 1800 },
  { sku: "ENV-PET-2000A", nombre: "Envase PET 2000 ml Boca Angosta", categoria: "Envases", unidadMedida: "unidad", costo: 2.6, margen: 1.35, existenciaTotal: 4100, puntoReorden: 1200 },
  { sku: "ENV-HDPE-250", nombre: "Frasco HDPE 250 ml", categoria: "Envases", unidadMedida: "unidad", costo: 0.95, margen: 1.4, existenciaTotal: 8600, puntoReorden: 2000 },
  { sku: "ENV-HDPE-500", nombre: "Frasco HDPE 500 ml", categoria: "Envases", unidadMedida: "unidad", costo: 1.35, margen: 1.4, existenciaTotal: 6400, puntoReorden: 1600 },
  { sku: "ENV-HDPE-1000", nombre: "Frasco HDPE 1000 ml", categoria: "Envases", unidadMedida: "unidad", costo: 1.9, margen: 1.36, existenciaTotal: 3900, puntoReorden: 1000 },
  { sku: "ENV-GAL-1G", nombre: "Galón HDPE 1 Galón", categoria: "Envases", unidadMedida: "unidad", costo: 4.2, margen: 1.32, existenciaTotal: 2600, puntoReorden: 700 },
  { sku: "ENV-GAL-5G", nombre: "Garrafón HDPE 5 Galones", categoria: "Envases", unidadMedida: "unidad", costo: 12.5, margen: 1.28, existenciaTotal: 850, puntoReorden: 250 },
  { sku: "ENV-VASO-8OZ", nombre: "Vaso Plástico Rígido 8 oz (paquete 50u)", categoria: "Envases", unidadMedida: "paquete", costo: 14.5, margen: 1.3, existenciaTotal: 1400, puntoReorden: 400 },
  { sku: "ENV-VASO-12OZ", nombre: "Vaso Plástico Rígido 12 oz (paquete 50u)", categoria: "Envases", unidadMedida: "paquete", costo: 17.8, margen: 1.3, existenciaTotal: 1100, puntoReorden: 350 },
  { sku: "ENV-TARR-500", nombre: "Tarrina PP con Tapa 500 ml (paquete 25u)", categoria: "Envases", unidadMedida: "paquete", costo: 28, margen: 1.3, existenciaTotal: 620, puntoReorden: 200 },
  { sku: "ENV-TARR-1000", nombre: "Tarrina PP con Tapa 1000 ml (paquete 25u)", categoria: "Envases", unidadMedida: "paquete", costo: 38, margen: 1.28, existenciaTotal: 410, puntoReorden: 150 },
];

const TAPAS: ProductoSeedInput[] = [
  { sku: "TAP-R28-BL", nombre: "Tapa Rosca 28 mm Blanca (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 210, margen: 1.32, existenciaTotal: 610, puntoReorden: 180 },
  { sku: "TAP-R28-NG", nombre: "Tapa Rosca 28 mm Negra (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 210, margen: 1.32, existenciaTotal: 480, puntoReorden: 150 },
  { sku: "TAP-R38-BL", nombre: "Tapa Rosca 38 mm Blanca (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 260, margen: 1.3, existenciaTotal: 320, puntoReorden: 100 },
  { sku: "TAP-R38-AZ", nombre: "Tapa Rosca 38 mm Azul (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 260, margen: 1.3, existenciaTotal: 210, puntoReorden: 80 },
  { sku: "TAP-DISP-24", nombre: "Tapa Dispensadora Flip-Top 24 mm (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 340, margen: 1.28, existenciaTotal: 150, puntoReorden: 60 },
  { sku: "TAP-SEG-38", nombre: "Tapa con Anillo de Seguridad 38 mm (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 295, margen: 1.28, existenciaTotal: 190, puntoReorden: 70 },
  { sku: "TAP-GAL-1G", nombre: "Tapa para Galón 1G con Sello (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 230, margen: 1.3, existenciaTotal: 240, puntoReorden: 90 },
  { sku: "TAP-BOMBA-28", nombre: "Tapa Bomba Dosificadora 28 mm (millar)", categoria: "Tapas y cierres", unidadMedida: "millar", costo: 410, margen: 1.25, existenciaTotal: 85, puntoReorden: 40 },
];

const ADITIVOS: ProductoSeedInput[] = [
  { sku: "ADT-MB-NEG", nombre: "Masterbatch Colorante Negro 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 380, margen: 1.3, existenciaTotal: 120, puntoReorden: 40 },
  { sku: "ADT-MB-BLA", nombre: "Masterbatch Colorante Blanco 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 400, margen: 1.3, existenciaTotal: 95, puntoReorden: 35 },
  { sku: "ADT-MB-AZUL", nombre: "Masterbatch Colorante Azul 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 420, margen: 1.28, existenciaTotal: 60, puntoReorden: 25 },
  { sku: "ADT-MB-ROJO", nombre: "Masterbatch Colorante Rojo 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 420, margen: 1.28, existenciaTotal: 55, puntoReorden: 25 },
  { sku: "ADT-MB-VERDE", nombre: "Masterbatch Colorante Verde 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 420, margen: 1.28, existenciaTotal: 40, puntoReorden: 20 },
  { sku: "ADT-ANTIOX", nombre: "Antioxidante para Resinas 25 kg", categoria: "Aditivos y colorantes", unidadMedida: "saco", costo: 520, margen: 1.25, existenciaTotal: 30, puntoReorden: 15 },
];

const FILM: ProductoSeedInput[] = [
  { sku: "FLM-STR-500", nombre: "Film Stretch Industrial 500 mm (rollo)", categoria: "Film y empaque", unidadMedida: "rollo", costo: 145, margen: 1.3, existenciaTotal: 340, puntoReorden: 100 },
  { sku: "FLM-STR-380", nombre: "Film Stretch Manual 380 mm (rollo)", categoria: "Film y empaque", unidadMedida: "rollo", costo: 42, margen: 1.35, existenciaTotal: 610, puntoReorden: 180 },
  { sku: "FLM-TERM-40", nombre: "Film Termoencogible 40 micras (rollo)", categoria: "Film y empaque", unidadMedida: "rollo", costo: 380, margen: 1.28, existenciaTotal: 140, puntoReorden: 50 },
  { sku: "FLM-LAM-MET", nombre: "Laminado Metalizado para Empaque (rollo)", categoria: "Film y empaque", unidadMedida: "rollo", costo: 620, margen: 1.25, existenciaTotal: 60, puntoReorden: 25 },
  { sku: "FLM-BURB-100", nombre: "Plástico de Burbuja 100 cm (rollo)", categoria: "Film y empaque", unidadMedida: "rollo", costo: 210, margen: 1.3, existenciaTotal: 95, puntoReorden: 35 },
  { sku: "FLM-ZIP-MED", nombre: "Bolsa con Cierre Zip Mediana (paquete 100u)", categoria: "Film y empaque", unidadMedida: "paquete", costo: 68, margen: 1.32, existenciaTotal: 280, puntoReorden: 90 },
];

const ALL: ProductoSeedInput[] = [...RESINAS, ...BOLSAS, ...ENVASES, ...TAPAS, ...ADITIVOS, ...FILM];

export const PRODUCTOS_SEED: Producto[] = ALL.map((raw, i) => ({
  id: `prod-${String(i + 1).padStart(3, "0")}`,
  sku: raw.sku,
  nombre: raw.nombre,
  categoria: raw.categoria,
  unidadMedida: raw.unidadMedida,
  costo: raw.costo,
  precioBase: Math.round(raw.costo * raw.margen * 100) / 100,
  existenciaTotal: raw.existenciaTotal,
  puntoReorden: raw.puntoReorden,
  activo: true,
  createdAt: new Date(2023, (i * 4) % 12, ((i * 9) % 27) + 1).toISOString(),
}));
