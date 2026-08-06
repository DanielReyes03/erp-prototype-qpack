export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rolId: string;
  activo: boolean;
  createdAt: string;
}

export const USUARIOS_SEED: Usuario[] = [
  {
    id: "usr-001",
    nombre: "María Fernanda González",
    email: "mgonzalez@qpack.gt",
    telefono: "5512-3401",
    rolId: "rol-admin",
    activo: true,
    createdAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: "usr-002",
    nombre: "Carlos Enrique Morales",
    email: "cmorales@qpack.gt",
    telefono: "5512-3402",
    rolId: "rol-vendedor",
    activo: true,
    createdAt: "2025-01-20T08:00:00.000Z",
  },
  {
    id: "usr-003",
    nombre: "Ana Lucía Ramírez",
    email: "aramirez@qpack.gt",
    telefono: "5512-3403",
    rolId: "rol-vendedor",
    activo: true,
    createdAt: "2025-02-01T08:00:00.000Z",
  },
  {
    id: "usr-004",
    nombre: "Byron Estuardo Cabrera",
    email: "bcabrera@qpack.gt",
    telefono: "5512-3410",
    rolId: "rol-contador",
    activo: true,
    createdAt: "2025-02-10T08:00:00.000Z",
  },
  {
    id: "usr-005",
    nombre: "Silvia Patricia López",
    email: "slopez@qpack.gt",
    telefono: "5512-3405",
    rolId: "rol-gerente",
    activo: true,
    createdAt: "2025-01-10T08:00:00.000Z",
  },
  {
    id: "usr-006",
    nombre: "José Manuel Pérez",
    email: "jperez@qpack.gt",
    telefono: "5512-3404",
    rolId: "rol-vendedor",
    activo: true,
    createdAt: "2025-03-01T08:00:00.000Z",
  },
  {
    id: "usr-007",
    nombre: "Herbert Osvaldo Cifuentes",
    email: "hcifuentes@qpack.gt",
    telefono: "5512-3420",
    rolId: "rol-bodega",
    activo: true,
    createdAt: "2025-02-15T08:00:00.000Z",
  },
  {
    id: "usr-008",
    nombre: "Rosa Elvira Tzunún",
    email: "rtzunun@qpack.gt",
    telefono: "5512-3421",
    rolId: "rol-bodega",
    activo: false,
    createdAt: "2025-04-05T08:00:00.000Z",
  },
];
