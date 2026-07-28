import type { AgenteAduanero, Contenedor, Distribuidor, EstadoContenedor, Naviera, Ruta, TipoContenedor, Transportista, Vehiculo } from "@/types";
import { seededFloat, seededInt, seededPick } from "./seed";

export const navieras: Naviera[] = [
  { id: "nav-maersk", nombre: "Maersk Line", codigoScac: "MAEU", contacto: "Patricia Gonzalez", telefono: "+502 2422 1000", correo: "servicio.gt@maersk.com", rutasHabituales: ["Shanghai - Puerto Quetzal", "Houston - Puerto Barrios"] },
  { id: "nav-msc", nombre: "Mediterranean Shipping Company", codigoScac: "MSCU", contacto: "Fernando Solares", telefono: "+502 2422 2200", correo: "gt.import@msc.com", rutasHabituales: ["Ningbo - Puerto Quetzal", "Rotterdam - Puerto Santo Tomas"] },
  { id: "nav-cma", nombre: "CMA CGM", codigoScac: "CMDU", contacto: "Lorena Aju", telefono: "+502 2422 3300", correo: "gt.cs@cma-cgm.com", rutasHabituales: ["Kaohsiung - Puerto Quetzal"] },
  { id: "nav-hapag", nombre: "Hapag-Lloyd", codigoScac: "HLCU", contacto: "Marco Tulio Estrada", telefono: "+502 2422 4400", correo: "gtm@hlag.com", rutasHabituales: ["Hamburgo - Puerto Santo Tomas de Castilla"] },
  { id: "nav-evergreen", nombre: "Evergreen Marine", codigoScac: "EGLV", contacto: "Sun Li Fang", telefono: "+502 2422 5500", correo: "gt@evergreen-line.com", rutasHabituales: ["Kaohsiung - Puerto Quetzal", "Los Angeles - Puerto Quetzal"] },
];

export const agentesAduaneros: AgenteAduanero[] = [
  { id: "aa-01", nombre: "Werner Estuardo Villagran", colegiado: "AA-3312", empresa: "Agencia Aduanal Villagran", telefono: "+502 5566 7711", correo: "wvillagran@aduanalvillagran.gt", aduanasHabituales: ["Puerto Quetzal", "Aduana Central"] },
  { id: "aa-02", nombre: "Claudia Beatriz Recinos", colegiado: "AA-2894", empresa: "Recinos & Asociados", telefono: "+502 5566 7722", correo: "crecinos@recinosaduanas.gt", aduanasHabituales: ["Puerto Santo Tomas de Castilla"] },
  { id: "aa-03", nombre: "Douglas Enrique Pineda", colegiado: "AA-4021", empresa: "Grupo Aduanal Pineda", telefono: "+502 5566 7733", correo: "dpineda@aduanalpineda.gt", aduanasHabituales: ["Puerto Quetzal", "Aeropuerto La Aurora"] },
];

export const distribuidores: Distribuidor[] = [
  { id: "dist-01", nombre: "Distribuidora Metropolitana", zona: "Guatemala Metro", clientesAsignados: 34, contacto: "Erick Sagastume", telefono: "+502 5588 1200", activo: true },
  { id: "dist-02", nombre: "Distribuidora Occidente Plus", zona: "Occidente", clientesAsignados: 21, contacto: "Wendy Coyoy", telefono: "+502 5588 1300", activo: true },
  { id: "dist-03", nombre: "Distribuidora Oriente Rapido", zona: "Oriente", clientesAsignados: 18, contacto: "Manuel Archila", telefono: "+502 5588 1400", activo: true },
  { id: "dist-04", nombre: "Distribuidora Costa Sur", zona: "Costa Sur", clientesAsignados: 15, contacto: "Ingrid Letona", telefono: "+502 5588 1500", activo: true },
];

export const transportistas: Transportista[] = [
  { id: "trans-01", nombre: "Transportes Aguilar y Cia", nit: "4589021-5", tipo: "Local", telefono: "+502 5544 2201", vehiculosAsignados: 6, calificacion: 4.5, activo: true },
  { id: "trans-02", nombre: "Fletes Rapidos del Sur, S.A.", nit: "5892103-8", tipo: "Local", telefono: "+502 5544 2202", vehiculosAsignados: 4, calificacion: 4.2, activo: true },
  { id: "trans-03", nombre: "Transportes Internacionales CA", nit: "6903215-1", tipo: "Internacional", telefono: "+502 5544 2203", vehiculosAsignados: 3, calificacion: 4.7, activo: true },
  { id: "trans-04", nombre: "Logistica y Carga Chapina, S.A.", nit: "7014326-4", tipo: "Local", telefono: "+502 5544 2204", vehiculosAsignados: 5, calificacion: 4.0, activo: true },
];

export const vehiculos: Vehiculo[] = Array.from({ length: 14 }).map((_, i) => {
  const id = `veh-${String(i + 1).padStart(3, "0")}`;
  const tipo = seededPick(id + "-tipo", ["Camion", "Cabezal", "Pickup", "Furgon"] as const);
  return {
    id,
    placa: `P${seededInt(id + "-placa", 100, 999)}BCD`,
    tipo,
    capacidadKg: tipo === "Cabezal" ? 28000 : tipo === "Camion" ? 8000 : tipo === "Furgon" ? 3500 : 1200,
    transportistaId: transportistas[i % transportistas.length].id,
    estado: seededPick(id + "-estado", ["Disponible", "En ruta", "Mantenimiento"] as const),
  };
});

export const rutas: Ruta[] = [
  { id: "ruta-01", nombre: "Ruta Guatemala Zona 1-11", zona: "Guatemala Metro", municipios: ["Guatemala", "Mixco"], distribuidorId: "dist-01", diasVisita: ["Lunes", "Miercoles", "Viernes"] },
  { id: "ruta-02", nombre: "Ruta Villa Nueva - Amatitlan", zona: "Guatemala Metro", municipios: ["Villa Nueva", "Amatitlan"], distribuidorId: "dist-01", diasVisita: ["Martes", "Jueves"] },
  { id: "ruta-03", nombre: "Ruta Quetzaltenango - San Marcos", zona: "Occidente", municipios: ["Quetzaltenango", "San Marcos"], distribuidorId: "dist-02", diasVisita: ["Lunes", "Jueves"] },
  { id: "ruta-04", nombre: "Ruta Huehuetenango", zona: "Occidente", municipios: ["Huehuetenango"], distribuidorId: "dist-02", diasVisita: ["Miercoles"] },
  { id: "ruta-05", nombre: "Ruta Chiquimula - Zacapa", zona: "Oriente", municipios: ["Chiquimula", "Zacapa"], distribuidorId: "dist-03", diasVisita: ["Martes", "Viernes"] },
  { id: "ruta-06", nombre: "Ruta Jalapa - Jutiapa", zona: "Oriente", municipios: ["Jalapa", "Jutiapa"], distribuidorId: "dist-03", diasVisita: ["Lunes"] },
  { id: "ruta-07", nombre: "Ruta Escuintla - Retalhuleu", zona: "Costa Sur", municipios: ["Escuintla", "Retalhuleu"], distribuidorId: "dist-04", diasVisita: ["Miercoles", "Sabado"] },
];

const estadosContenedor: EstadoContenedor[] = ["En origen", "En transito", "En puerto", "Liberado", "Devuelto"];
const tiposContenedor: TipoContenedor[] = ["20 pies", "40 pies", "40 pies HC", "LCL"];

export const contenedores: Contenedor[] = Array.from({ length: 16 }).map((_, i) => {
  const id = `cont-${String(i + 1).padStart(3, "0")}`;
  const naviera = navieras[i % navieras.length];
  return {
    id,
    numero: `${seededPick(id + "-pre", ["MAEU", "MSCU", "CMDU", "HLCU", "EGLV"])}${seededInt(id + "-num", 4000000, 4999999)}`,
    tipo: seededPick(id + "-tipo", tiposContenedor),
    navieraId: naviera.id,
    embarqueId: `emb-${String((i % 10) + 1).padStart(3, "0")}`,
    estado: seededPick(id + "-estado", estadosContenedor),
    pesoKg: seededFloat(id + "-peso", 8000, 24000, 0),
    precintoNumero: `SL${seededInt(id + "-precinto", 100000, 999999)}`,
  };
});
