# QPack ERP — Prototipo funcional

Prototipo navegable de un ERP para una empresa guatemalteca importadora y
distribuidora de plásticos industriales (resinas, envases, bolsas, tapas,
film y aditivos). Cubre el ciclo completo de negocio — datos maestros,
inventario, ventas, compras, CRM, facturación electrónica (DTE), tesorería,
cuentas por cobrar/pagar, contabilidad de partida doble, reportería y
seguridad — con datos guatemaltecos realistas (NIT, departamentos y
municipios reales, catálogo de productos plásticos) y persistencia en
`localStorage` del navegador.

No hay base de datos ni backend: todo el estado vive en stores de
[Zustand](https://github.com/pmndrs/zustand) en el cliente, con `persist` a
`localStorage`. Cada operación de escritura simula latencia de red
(250–600 ms) y dispara efectos en cascada reales entre módulos — por
ejemplo, emitir una factura (DTE) cambia el estado del pedido de venta,
genera el documento de cuentas por cobrar y registra automáticamente la
póliza contable correspondiente en el libro diario.

## Stack

- **Next.js 15** (App Router, TypeScript, carpeta `src/`)
- **HeroUI v3** (`@heroui/react`) + Tailwind CSS v4
- **Zustand** (estado + `persist`) — un store por dominio en `src/lib/store/`
- **react-hook-form + zod** para todos los formularios
- **date-fns** (locale `es`) para fechas
- **lucide-react** para iconos

## Puesta en marcha

Requiere Node.js 20+.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) — redirige automáticamente
a `/dashboard`.

Para verificar un build de producción:

```bash
npm run build
npm run start
```

### Restablecer los datos de demo

El botón **"Restablecer datos de demo"** en la barra superior borra todo el
estado persistido en `localStorage` y vuelve a sembrar los datos desde cero.
Usalo si el estado queda en una combinación rara durante una demo.

### Cambiar de usuario / rol (permisos)

El menú del avatar (esquina superior derecha) incluye un selector
**"Cambiar usuario (demo)"** que simula iniciar sesión como distintos
usuarios del sistema, cada uno con un rol distinto (Administrador, Gerente
Comercial, Vendedor, Contador, Encargado de bodega). Cambiar de usuario
oculta o muestra en vivo las secciones del menú lateral según la matriz de
permisos configurada en **Seguridad → Roles y permisos**.

## Estructura del proyecto

```
src/
  app/                  Rutas (App Router) — una carpeta por módulo/pantalla
  components/
    layout/             Sidebar, Topbar, CommandPalette, AppShell
    patterns/           Componentes reutilizables (DataTable, FormModal,
                         StatusChip, KpiCard, LineItemsEditor, etc.)
  lib/
    seed/                Datos semilla realistas por dominio
    store/               Un store de Zustand por dominio (fuente de verdad)
    format.ts, status.ts, nav.ts, csv.ts, date-value.ts, async.ts, cn.ts
```

## Módulos incluidos

- **Dashboard** — KPIs operativos, ventas de los últimos 6 meses, top
  productos, documentos pendientes de acción.
- **Datos maestros** — Clientes, Proveedores, Vendedores, Productos, Listas
  de precios, Geografía (departamentos/municipios de Guatemala).
- **Inventario** — Existencias por locación, entradas/salidas/ajustes,
  kardex con costeo promedio ponderado, traslados entre bodegas.
- **Ventas** — Órdenes de venta con máquina de estados completa
  (borrador → confirmado → despachado → entregado → facturado), despachos y
  rutas, cotizaciones.
- **Compras** — Órdenes de compra, recepciones parciales/totales, facturas
  de proveedor y notas de crédito.
- **CRM** — Oportunidades (kanban con arrastrar y soltar), actividades
  (lista + vista de calendario mensual), reclamos (prioridad, SLA y
  estados).
- **Facturación electrónica (DTE)** — Emisión de FACT/NCRE/NDEB con UUID
  simulado, listado, anulación, representación gráfica del documento.
- **Tesorería** — Cuentas bancarias (GTQ/USD), depósitos/cheques/
  transferencias, cajas chicas con liquidación de gastos.
- **CxC / CxP** — Antigüedad de saldos, aplicación de pagos, comisiones de
  vendedores.
- **Contabilidad** — Catálogo de cuentas jerárquico, asientos manuales (con
  validación de cuadre que bloquea el guardado), pólizas automáticas
  visibles en cada factura/compra, libro diario, libro mayor, balance de
  saldos, libro de ventas y libro de compras.
- **Reportería** — Ventas por período/vendedor/cliente, compras por
  proveedor, kardex valorizado — todos con exportación real a CSV.
- **Seguridad** — Usuarios, roles y matriz de permisos que oculta
  secciones del menú lateral según el rol activo.

## Guion de demo (5 minutos)

Un recorrido que muestra el ciclo de negocio completo, de principio a fin,
con los efectos en cascada entre módulos.

1. **Dashboard** (`/dashboard`) — Punto de partida. Señalá los KPIs
   (ventas del mes, cartera vencida, valor de inventario, DTEs emitidos) y
   la tabla de "Documentos pendientes de acción".

2. **Crear un cliente** (`/maestros/clientes` → "Nuevo cliente") — Llenar
   el formulario (NIT con dígito verificador real, departamento/municipio,
   vendedor asignado, límite de crédito) y guardar. Aparece de inmediato en
   el listado.

3. **Crear un producto** (`/maestros/productos` → "Nuevo producto") —
   Definir SKU, categoría, costo y precio base. Aparece en existencias con
   saldo cero.

4. **Registrar entrada de inventario** (`/inventario/movimientos` →
   "Nueva entrada") — Ingresar cantidad y costo unitario para el producto
   recién creado. El costeo promedio ponderado se recalcula y el saldo
   aparece en `/inventario/existencias` y en el kardex del producto.

5. **Levantar un pedido de venta** (`/ventas/ordenes/nueva`) — Elegir el
   cliente creado, agregar el producto a la orden, guardar como borrador.
   Confirmar el pedido desde el detalle: el `DocumentStepper` avanza a
   "Confirmado".

6. **Despachar y entregar** (desde el detalle de la orden) — Usar los
   botones de acción para despachar y luego marcar como entregado. El
   stepper refleja cada estado; el inventario baja automáticamente.

7. **Emitir la factura (DTE)** (botón "Facturar" en el detalle de la orden,
   o `/dte/nuevo?ovId=...`) — Al emitir: se genera un UUID simulado, el
   pedido pasa a "Facturado", el documento aparece en `/dte`, se crea el
   registro de cuentas por cobrar en `/cxc`, **y se registra la póliza
   contable automáticamente** (visible en el detalle del DTE, sección
   "Póliza contable").

8. **Aplicar un pago** (`/cxc` → seleccionar el documento → "Aplicar
   pago") — El saldo pendiente baja, el estado de la cuenta cambia, y se
   genera una nueva póliza de cobro.

9. **Cerrar el ciclo en contabilidad** (`/contabilidad/libro-diario` o
   `/contabilidad/balance`) — Mostrar que las pólizas de la venta, el costo
   de venta y el cobro ya están reflejadas en el libro diario, y que el
   balance de saldos sigue cuadrado (chip "Balance cuadrado").

10. **(Opcional) CRM y permisos** — Arrastrar una oportunidad entre columnas
    en `/crm/oportunidades`, y luego abrir el menú del avatar → "Cambiar
    usuario (demo)" → elegir un usuario con rol "Vendedor" para mostrar
    cómo el menú lateral se reduce en vivo según sus permisos.

## Notas de alcance

Este es un prototipo de demostración: no hay backend, autenticación real ni
persistencia fuera del navegador. Los cálculos de negocio (costeo
promedio ponderado, partida doble, antigüedad de saldos, SLA de reclamos)
son reales y consistentes entre pantallas, pero los datos se reinician con
el botón "Restablecer datos de demo" o al limpiar el `localStorage` del
navegador.
