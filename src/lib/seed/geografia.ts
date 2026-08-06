export interface Departamento {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  departamentoId: string;
  nombre: string;
}

export const DEPARTAMENTOS: Departamento[] = [
  { id: "guatemala", nombre: "Guatemala" },
  { id: "sacatepequez", nombre: "Sacatepéquez" },
  { id: "escuintla", nombre: "Escuintla" },
  { id: "quetzaltenango", nombre: "Quetzaltenango" },
  { id: "chimaltenango", nombre: "Chimaltenango" },
  { id: "solola", nombre: "Sololá" },
  { id: "totonicapan", nombre: "Totonicapán" },
  { id: "retalhuleu", nombre: "Retalhuleu" },
  { id: "suchitepequez", nombre: "Suchitepéquez" },
  { id: "santa-rosa", nombre: "Santa Rosa" },
  { id: "jutiapa", nombre: "Jutiapa" },
  { id: "jalapa", nombre: "Jalapa" },
  { id: "izabal", nombre: "Izabal" },
  { id: "zacapa", nombre: "Zacapa" },
  { id: "chiquimula", nombre: "Chiquimula" },
  { id: "el-progreso", nombre: "El Progreso" },
  { id: "alta-verapaz", nombre: "Alta Verapaz" },
  { id: "baja-verapaz", nombre: "Baja Verapaz" },
  { id: "peten", nombre: "Petén" },
  { id: "huehuetenango", nombre: "Huehuetenango" },
  { id: "quiche", nombre: "Quiché" },
  { id: "san-marcos", nombre: "San Marcos" },
];

export const MUNICIPIOS: Municipio[] = [
  // Guatemala
  ...[
    "Guatemala",
    "Mixco",
    "Villa Nueva",
    "San José Pinula",
    "San Miguel Petapa",
    "Santa Catarina Pinula",
    "Villa Canales",
    "Chinautla",
    "Amatitlán",
    "Fraijanes",
    "San Pedro Ayampuc",
    "Chuarrancho",
    "San Raymundo",
    "San Juan Sacatepéquez",
    "San Pedro Sacatepéquez",
    "Palencia",
  ].map((nombre, i) => ({
    id: `guatemala-${i + 1}`,
    departamentoId: "guatemala",
    nombre,
  })),
  // Sacatepéquez
  ...[
    "Antigua Guatemala",
    "Jocotenango",
    "Pastores",
    "Sumpango",
    "Santo Domingo Xenacoj",
    "Santiago Sacatepéquez",
    "San Bartolomé Milpas Altas",
    "San Lucas Sacatepéquez",
    "Santa Lucía Milpas Altas",
    "Magdalena Milpas Altas",
    "Santa María de Jesús",
    "Ciudad Vieja",
    "San Miguel Dueñas",
    "Alotenango",
    "San Antonio Aguas Calientes",
    "Santa Catarina Barahona",
  ].map((nombre, i) => ({
    id: `sacatepequez-${i + 1}`,
    departamentoId: "sacatepequez",
    nombre,
  })),
  // Escuintla
  ...[
    "Escuintla",
    "Santa Lucía Cotzumalguapa",
    "La Democracia",
    "Siquinalá",
    "Masagua",
    "Tiquisate",
    "La Gomera",
    "Guanagazapa",
    "San José",
    "Iztapa",
    "Palín",
    "San Vicente Pacaya",
    "Nueva Concepción",
  ].map((nombre, i) => ({
    id: `escuintla-${i + 1}`,
    departamentoId: "escuintla",
    nombre,
  })),
  // Quetzaltenango
  ...[
    "Quetzaltenango",
    "Salcajá",
    "Olintepeque",
    "San Carlos Sija",
    "Sibilia",
    "Cabricán",
    "Cajolá",
    "San Miguel Sigüilá",
    "Ostuncalco",
    "San Mateo",
    "Concepción Chiquirichapa",
    "San Martín Sacatepéquez",
    "Almolonga",
    "Cantel",
    "Zunil",
    "Colomba",
    "Coatepeque",
    "Génova",
    "Flores Costa Cuca",
    "La Esperanza",
    "Palestina de Los Altos",
  ].map((nombre, i) => ({
    id: `quetzaltenango-${i + 1}`,
    departamentoId: "quetzaltenango",
    nombre,
  })),
  // Chimaltenango
  ...[
    "Chimaltenango",
    "San José Poaquil",
    "San Martín Jilotepeque",
    "San Juan Comalapa",
    "Santa Apolonia",
    "Tecpán Guatemala",
    "Patzún",
    "San Andrés Itzapa",
    "Zaragoza",
    "El Tejar",
  ].map((nombre, i) => ({
    id: `chimaltenango-${i + 1}`,
    departamentoId: "chimaltenango",
    nombre,
  })),
  // Sololá
  ...[
    "Sololá",
    "Panajachel",
    "Santa Catarina Palopó",
    "San Antonio Palopó",
    "Concepción",
    "San Andrés Semetabaj",
    "Santiago Atitlán",
    "San Lucas Tolimán",
  ].map((nombre, i) => ({ id: `solola-${i + 1}`, departamentoId: "solola", nombre })),
  // Totonicapán
  ...["Totonicapán", "San Cristóbal Totonicapán", "Momostenango"].map((nombre, i) => ({
    id: `totonicapan-${i + 1}`,
    departamentoId: "totonicapan",
    nombre,
  })),
  // Retalhuleu
  ...["Retalhuleu", "San Sebastián", "Champerico", "Nuevo San Carlos"].map((nombre, i) => ({
    id: `retalhuleu-${i + 1}`,
    departamentoId: "retalhuleu",
    nombre,
  })),
  // Suchitepéquez
  ...["Mazatenango", "Cuyotenango", "San Antonio Suchitepéquez", "Río Bravo"].map(
    (nombre, i) => ({ id: `suchitepequez-${i + 1}`, departamentoId: "suchitepequez", nombre }),
  ),
  // Santa Rosa
  ...["Cuilapa", "Barberena", "Chiquimulilla", "Taxisco"].map((nombre, i) => ({
    id: `santa-rosa-${i + 1}`,
    departamentoId: "santa-rosa",
    nombre,
  })),
  // Jutiapa
  ...["Jutiapa", "El Progreso", "Asunción Mita", "Agua Blanca"].map((nombre, i) => ({
    id: `jutiapa-${i + 1}`,
    departamentoId: "jutiapa",
    nombre,
  })),
  // Jalapa
  ...["Jalapa", "San Pedro Pinula", "Monjas"].map((nombre, i) => ({
    id: `jalapa-${i + 1}`,
    departamentoId: "jalapa",
    nombre,
  })),
  // Izabal
  ...["Puerto Barrios", "Livingston", "Morales", "Los Amates"].map((nombre, i) => ({
    id: `izabal-${i + 1}`,
    departamentoId: "izabal",
    nombre,
  })),
  // Zacapa
  ...["Zacapa", "Río Hondo", "Gualán", "Teculután"].map((nombre, i) => ({
    id: `zacapa-${i + 1}`,
    departamentoId: "zacapa",
    nombre,
  })),
  // Chiquimula
  ...["Chiquimula", "Esquipulas", "Jocotán", "Camotán"].map((nombre, i) => ({
    id: `chiquimula-${i + 1}`,
    departamentoId: "chiquimula",
    nombre,
  })),
  // El Progreso
  ...["Guastatoya", "Sanarate", "San Agustín Acasaguastlán"].map((nombre, i) => ({
    id: `el-progreso-${i + 1}`,
    departamentoId: "el-progreso",
    nombre,
  })),
  // Alta Verapaz
  ...["Cobán", "San Pedro Carchá", "San Juan Chamelco", "Tucurú"].map((nombre, i) => ({
    id: `alta-verapaz-${i + 1}`,
    departamentoId: "alta-verapaz",
    nombre,
  })),
  // Baja Verapaz
  ...["Salamá", "Rabinal", "Cubulco"].map((nombre, i) => ({
    id: `baja-verapaz-${i + 1}`,
    departamentoId: "baja-verapaz",
    nombre,
  })),
  // Petén
  ...["Flores", "San Benito", "Santa Elena", "Poptún"].map((nombre, i) => ({
    id: `peten-${i + 1}`,
    departamentoId: "peten",
    nombre,
  })),
  // Huehuetenango
  ...["Huehuetenango", "Chiantla", "La Democracia", "Malacatancito"].map((nombre, i) => ({
    id: `huehuetenango-${i + 1}`,
    departamentoId: "huehuetenango",
    nombre,
  })),
  // Quiché
  ...["Santa Cruz del Quiché", "Chichicastenango", "Santa Cruz Verapaz", "Nebaj"].map(
    (nombre, i) => ({ id: `quiche-${i + 1}`, departamentoId: "quiche", nombre }),
  ),
  // San Marcos
  ...["San Marcos", "San Pedro Sacatepéquez", "Malacatán", "Tecún Umán"].map((nombre, i) => ({
    id: `san-marcos-${i + 1}`,
    departamentoId: "san-marcos",
    nombre,
  })),
];

export function municipiosDe(departamentoId: string): Municipio[] {
  return MUNICIPIOS.filter((m) => m.departamentoId === departamentoId);
}
