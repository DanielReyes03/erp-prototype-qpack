export interface Locacion {
  id: string;
  nombre: string;
  tipo: "Bodega" | "Sucursal" | "Tránsito";
  departamentoId: string;
  municipioId: string;
  direccion: string;
  activo: boolean;
}

export const LOCACIONES_SEED: Locacion[] = [
  {
    id: "loc-central",
    nombre: "Bodega Central Zona 12",
    tipo: "Bodega",
    departamentoId: "guatemala",
    municipioId: "guatemala-1",
    direccion: "Calzada Aguilar Batres 32-40, zona 12",
    activo: true,
  },
  {
    id: "loc-amatitlan",
    nombre: "Centro de Distribución Amatitlán",
    tipo: "Bodega",
    departamentoId: "guatemala",
    municipioId: "guatemala-9",
    direccion: "Km 22 Carretera a Amatitlán, Parque Industrial",
    activo: true,
  },
  {
    id: "loc-xela",
    nombre: "Sucursal Quetzaltenango",
    tipo: "Sucursal",
    departamentoId: "quetzaltenango",
    municipioId: "quetzaltenango-1",
    direccion: "9a calle 13-40 zona 1",
    activo: true,
  },
  {
    id: "loc-escuintla",
    nombre: "Sucursal Escuintla",
    tipo: "Sucursal",
    departamentoId: "escuintla",
    municipioId: "escuintla-1",
    direccion: "Km 88 Carretera al Pacífico",
    activo: true,
  },
  {
    id: "loc-puerto",
    nombre: "Bodega Puerto Quetzal (tránsito aduanero)",
    tipo: "Tránsito",
    departamentoId: "escuintla",
    municipioId: "escuintla-9",
    direccion: "Puerto Quetzal, Bodega Fiscal 7",
    activo: true,
  },
];
