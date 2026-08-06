export interface Vendedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  zonaAsignada: string;
  porcentajeComision: number;
  activo: boolean;
}

export const ZONAS_VENTA = [
  "Zona Metropolitana",
  "Zona Occidente",
  "Zona Costa Sur",
  "Zona Oriente",
  "Zona Norte / Verapaces",
] as const;

export const VENDEDORES_SEED: Vendedor[] = [
  {
    id: "vend-001",
    nombre: "María Fernanda González",
    email: "mgonzalez@qpack.gt",
    telefono: "5512-3401",
    zonaAsignada: "Zona Metropolitana",
    porcentajeComision: 2.5,
    activo: true,
  },
  {
    id: "vend-002",
    nombre: "Carlos Enrique Morales",
    email: "cmorales@qpack.gt",
    telefono: "5512-3402",
    zonaAsignada: "Zona Occidente",
    porcentajeComision: 3,
    activo: true,
  },
  {
    id: "vend-003",
    nombre: "Ana Lucía Ramírez",
    email: "aramirez@qpack.gt",
    telefono: "5512-3403",
    zonaAsignada: "Zona Costa Sur",
    porcentajeComision: 3,
    activo: true,
  },
  {
    id: "vend-004",
    nombre: "José Manuel Pérez",
    email: "jperez@qpack.gt",
    telefono: "5512-3404",
    zonaAsignada: "Zona Oriente",
    porcentajeComision: 2.75,
    activo: true,
  },
  {
    id: "vend-005",
    nombre: "Silvia Patricia López",
    email: "slopez@qpack.gt",
    telefono: "5512-3405",
    zonaAsignada: "Zona Metropolitana",
    porcentajeComision: 2.5,
    activo: true,
  },
  {
    id: "vend-006",
    nombre: "Byron Estuardo Cabrera",
    email: "bcabrera@qpack.gt",
    telefono: "5512-3406",
    zonaAsignada: "Zona Norte / Verapaces",
    porcentajeComision: 3.25,
    activo: true,
  },
  {
    id: "vend-007",
    nombre: "Karla Waleska Juárez",
    email: "kjuarez@qpack.gt",
    telefono: "5512-3407",
    zonaAsignada: "Zona Occidente",
    porcentajeComision: 2.75,
    activo: false,
  },
];
