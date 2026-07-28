# QPack ERP — Prototipo navegable

Prototipo de interfaz (solo UI, sin backend) de un ERP a la medida para **QPack S.A.**,
empresa guatemalteca importadora y comercializadora de productos plasticos. Construido
para validar flujos de trabajo con el cliente antes de iniciar el desarrollo real.

> Este proyecto es un prototipo. No hay API, base de datos ni autenticacion real:
> todos los datos viven en memoria (`/src/lib/mock`) y las acciones que normalmente
> escribirian datos (guardar, enviar, aprobar, certificar, etc.) se simulan con
> notificaciones (`sonner`) y, cuando aplica, cambios de estado locales en el
> componente.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Base UI)
- [lucide-react](https://lucide.dev) para iconos
- [recharts](https://recharts.org) para graficas (via el wrapper `Chart` de shadcn)
- [next-themes](https://github.com/pacocoursey/next-themes) para modo claro/oscuro
- Datos 100% mock, tipados en `/src/types` y generados en `/src/lib/mock`

## Requisitos

- Node.js 20 o superior
- npm (el proyecto incluye `package-lock.json`)

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — la raiz redirige a `/inicio`.

Otros comandos utiles:

```bash
npm run build   # build de produccion (usado tambien para validar tipos)
npm run start   # sirve el build de produccion
npm run lint    # ESLint
```

## Estructura de carpetas

```
src/
├── app/
│   ├── (app)/                  # Route group con el shell de la aplicacion
│   │   ├── layout.tsx          # SidebarProvider + AppSidebar + AppTopbar
│   │   ├── inicio/             # Dashboard gerencial (por rol)
│   │   ├── crm/                # Clientes, oportunidades, actividades
│   │   ├── ventas/             # Cotizaciones, pedidos, despachos, devoluciones
│   │   ├── facturacion/        # DTE (FEL), notas de credito/debito
│   │   ├── inventario/         # Existencias, kardex, reservas, backorder, etc.
│   │   ├── compras/            # Ordenes locales/importacion, embarques, costeo, recepciones
│   │   ├── finanzas/           # CxC, CxP, bancos, conciliacion bancaria
│   │   ├── contabilidad/       # Polizas, libro mayor, estados financieros, libros legales
│   │   ├── logistica/          # Navieras, contenedores, transportistas, rutas, etc.
│   │   ├── catalogos/          # Productos, unidades, listas de precios, proveedores...
│   │   └── administracion/     # Usuarios, roles, aprobaciones, parametros
│   ├── layout.tsx              # Layout raiz (fuentes, ThemeProvider, Toaster)
│   └── page.tsx                # Redirige a /inicio
├── components/
│   ├── ui/                     # Componentes shadcn/ui (no editar a mano salvo necesario)
│   ├── layout/                 # Sidebar, topbar, breadcrumb, buscador global, etc.
│   ├── shared/                 # DataTable, DetailSheet, StatusBadge, QuickCreateDialog...
│   ├── dashboard/               # Graficas y tabla de alertas del panel gerencial
│   └── <modulo>/                # Componentes especificos de un modulo (ej. ventas/cotizacion-editor)
├── hooks/                       # use-mock-loading, use-mobile
├── lib/
│   ├── mock/                    # Generadores de datos mock, tipados, deterministicos
│   ├── format.ts                # Formato de moneda (GTQ/USD), fecha dd/mm/aaaa, numeros
│   ├── nav-config.ts            # Definicion de modulos/submodulos del sidebar
│   └── utils.ts                 # cn() de shadcn
└── types/                       # Tipos de dominio (Cliente, Pedido, Embarque, DTE, ...)
```

## Patron de pantallas

La mayoria de los listados siguen el mismo patron construido sobre `<DataTable>`:
busqueda, filtros por columna, chips de estado, paginacion, exportar a CSV, estado
vacio y estado de carga (skeleton), acciones por fila, y un drawer lateral
(`<DetailSheet>`) con el detalle del registro seleccionado.

Las pantallas explicitamente solicitadas como "completas y detalladas" tienen su
propia implementacion a medida:

| Pantalla | Ruta |
|---|---|
| Dashboard gerencial (KPIs, graficas, alertas, vistas por rol) | `/inicio` |
| Listado de pedidos | `/ventas/pedidos` |
| Editor de cotizacion (lineas, margen, totales, convertir a pedido) | `/ventas/cotizaciones/[id]`, `/ventas/cotizaciones/nueva` |
| Existencias con drawer de kardex | `/inventario/existencias` |
| Expediente de embarque (timeline, OC, documentos, gastos) | `/compras/embarques/[id]` |
| Costeo de importacion (prorrateo por valor/peso/volumen) | `/compras/costeo/[id]` |
| Emision de factura FEL (certificacion, XML/PDF) | `/facturacion/dte/nueva`, `/facturacion/dte/[id]` |
| Conciliacion bancaria (dos paneles + conciliar) | `/finanzas/conciliacion` |
| Poliza contable (debe/haber, validacion de cuadre) | `/contabilidad/polizas/[id]`, `/contabilidad/polizas/nueva` |
| Recepcion movil de bodega (lector de codigo simulado) | `/compras/recepciones/[id]/movil` |

## Datos mock

Todos los datos (empresas, clientes, productos, pedidos, embarques, facturas, etc.)
se generan en `/src/lib/mock` usando funciones deterministicas basadas en un hash del
`id` de cada registro (ver `seed.ts`). Esto evita usar `Math.random()` directamente,
por lo que el contenido es estable entre recargas y no genera diferencias de
hidratacion entre servidor y cliente.

Para modificar el volumen o el contenido de los datos, edita los archivos dentro de
`/src/lib/mock` — no se requiere ninguna base de datos ni variables de entorno.

## Idioma y formato

- Interfaz completamente en espanol (Guatemala).
- Moneda en Quetzales (Q) y Dolares (US$), formato `Q12,345.67`.
- Fechas en formato `dd/mm/aaaa`.
- Terminologia local: DTE/FEL, NIT, DUCA, partida arancelaria, quintal, bodega,
  agente aduanero, naviera, contenedor, incoterm.

## Modo claro/oscuro y responsive

El boton de sol/luna en la barra superior alterna el tema (`next-themes`, clase
`.dark` en `<html>`). El sidebar es colapsable a icono en escritorio y se convierte
en un menu tipo `Sheet` en pantallas moviles. Las tablas anchas hacen scroll
horizontal dentro de su propio contenedor.
