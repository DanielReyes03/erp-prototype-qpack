export interface Locacion {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Bodega" | "Sucursal" | "Tránsito";
  responsable: string;
  departamentoId: string;
  municipioId: string;
  direccion: string;
  activo: boolean;
}

export const LOCACIONES_SEED: Locacion[] = [
  {
    id: "loc-central",
    codigo: "BOD-01",
    nombre: "Bodega Central Zona 12",
    tipo: "Bodega",
    responsable: "Otto Estuardo Recinos",
    departamentoId: "guatemala",
    municipioId: "guatemala-1",
    direccion: "Calzada Aguilar Batres 32-40, zona 12",
    activo: true,
  },
  {
    id: "loc-amatitlan",
    codigo: "CDA-01",
    nombre: "Centro de Distribución Amatitlán",
    tipo: "Bodega",
    responsable: "Silvia Marleny Coc",
    departamentoId: "guatemala",
    municipioId: "guatemala-9",
    direccion: "Km 22 Carretera a Amatitlán, Parque Industrial",
    activo: true,
  },
  {
    id: "loc-xela",
    codigo: "SUC-XELA",
    nombre: "Sucursal Quetzaltenango",
    tipo: "Sucursal",
    responsable: "Byron Estuardo de León",
    departamentoId: "quetzaltenango",
    municipioId: "quetzaltenango-1",
    direccion: "9a calle 13-40 zona 1",
    activo: true,
  },
  {
    id: "loc-escuintla",
    codigo: "SUC-ESC",
    nombre: "Sucursal Escuintla",
    tipo: "Sucursal",
    responsable: "Karla Yesenia Godoy",
    departamentoId: "escuintla",
    municipioId: "escuintla-1",
    direccion: "Km 88 Carretera al Pacífico",
    activo: true,
  },
  {
    id: "loc-puerto",
    codigo: "TRA-PQ",
    nombre: "Bodega Puerto Quetzal (tránsito aduanero)",
    tipo: "Tránsito",
    responsable: "Agencia Aduanal Recinos",
    departamentoId: "escuintla",
    municipioId: "escuintla-9",
    direccion: "Puerto Quetzal, Bodega Fiscal 7",
    activo: true,
  },
];
