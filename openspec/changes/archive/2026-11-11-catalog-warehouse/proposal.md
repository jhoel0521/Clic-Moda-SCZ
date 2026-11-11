# Proposal

## Why

El negocio vende en Live y por WhatsApp con el pago confirmado a mano (respuestas del cliente, sección 5 de `docs/prototipo/auditoria.md`). Hoy no existe nada que registre **qué productos hay, cuántos y dónde**: el prototipo guardaba el stock como un JSON en un archivo, sin historial, y descontaba sin atomicidad (hallazgo H4), con el riesgo de prometer el mismo par a dos clientes. Tres personas anotan todo en un cuaderno y preparan al día siguiente.

Este change construye la base de todo lo demás (carrito, pedidos, reservas, Live): un **catálogo** administrable (categorías, productos y variantes) y un **mini almacén** con inventario auditable. El stock es el recurso más disputado del negocio, así que se diseña desde el inicio como lo pidió el cliente: **todas las operaciones sobre el stock entran a una cola persistida y las procesa una máquina de estados**. Pueden llegar una o un millón de solicitudes sobre la misma variante: solo las primeras que alcanzan stock tienen éxito, el resto se rechaza de forma ordenada y nada se pierde.

Se ejecuta **antes** de la rebanada 1 (marca y configuración) por decisión del usuario; el orden de la hoja de ruta se actualiza.

## What Changes

- **Catálogo (API + admin):** CRUD de categorías, y registro, edición, activación/desactivación y consulta de productos con sus **variantes** (talla, color, SKU, precio). Dinero en centavos de Bs (objeto de valor `Money`). Un producto nunca se borra: se desactiva. Una categoría con productos no se puede borrar.
- **Almacén e inventario (API + admin):** un almacén único implícito con el **stock por variante** (`on_hand`, `reserved`, ubicación opcional como "Estante A-2", umbral de reposición), un **libro de movimientos** inmutable (ingreso de mercadería, ajuste por conteo, salida, con motivo y operador) y la consulta de **stock bajo**.
- **Cola de comandos de stock (API):** los ingresos, ajustes y salidas **no modifican el stock directamente**: se encolan como comandos persistidos en PostgreSQL con identificador de idempotencia, un **estado** (`PENDING → PROCESSING → APPLIED | REJECTED`) y orden de llegada fijado por el reloj del servidor. Un procesador los aplica **en orden por variante** (en paralelo entre variantes distintas) con una actualización condicional atómica. La API responde `202 Accepted` con el id del comando y el resultado se consulta por ese id. Es el mismo mecanismo sobre el que se montarán reservar/liberar/confirmar en la rebanada de pedidos.
- **Roles reales por primera vez:** Gerente hace todo; Despacho registra ingresos y ajustes y consulta; Atención solo consulta. Estas son las primeras rutas con `@Roles` de la API real, lo que permite cerrar la tarea 9.2 de `platform-foundation` (Gerente 200, otro rol 403).
- **Admin (Astro + islas React):** pantallas de categorías, productos (con variantes) y almacén (stock, ingreso, ajuste, movimientos, stock bajo), con los tokens de `.ux/standard/tokens.json` volcados al tema del admin.
- **Datos de ejemplo (seed):** categorías y productos genéricos (calzado como catálogo inicial, sin atar el modelo a zapatos).

## Capabilities

### New Capabilities
- `product-categories`: alta, edición, listado y baja protegida de categorías.
- `product-catalog`: registro, edición, activación y consulta de productos y sus variantes (talla, color, SKU, precio en centavos).
- `warehouse-stock`: stock por variante (disponible = `on_hand - reserved`), ubicación, umbral, libro de movimientos auditable y consulta de stock bajo.
- `stock-command-queue`: cola persistida de comandos de stock con máquina de estados, idempotencia, orden de llegada, procesamiento serial por variante y resultado consultable.
- `warehouse-admin`: pantallas del admin para categorías, productos y almacén, con control de acceso por rol.

### Modified Capabilities
<!-- Ninguna: staff-auth (platform-foundation) no cambia sus requisitos; solo se usa @Roles. -->

## Impact

- **services/api:** dos contextos nuevos, `catalog` y `inventory` (hexagonales, `domain/application/infrastructure`), un procesador de cola en `inventory/infrastructure`, 5 migraciones (categorías, productos, variantes, stock, movimientos y comandos), seed, y pruebas de contrato por puerto y de concurrencia.
- **apps/admin:** primeras pantallas reales; tema con tokens del estándar UX.
- **Documentación:** `docs/database.dbml`, `openspec/ROADMAP.md` (orden y alcance de la rebanada 2) y `README`.
- **Dependencias:** ninguna infraestructura nueva (la cola vive en PostgreSQL).

## Fase del roadmap

Rebanada 2 — Catálogo (con la parte de inventario que la hoja de ruta ya preveía), ejecutada antes de la rebanada 1 por decisión del usuario.

## Fuera de alcance

- **Reservar, liberar y confirmar stock para pedidos** (rebanadas 4 y 5): aquí solo se deja la columna `reserved` y la cola lista; los casos de uso de reserva y su vencimiento llegan con los pedidos.
- **Carga y almacenamiento de imágenes** (decisión abierta nº 7): los productos no llevan imágenes todavía; sigue como un change aparte.
- **Catálogo público de la tienda, SEO y páginas móviles de `apps/shop`**: change posterior `shop-catalog`.
- **Varios almacenes o traslados entre almacenes**, lotes y números de serie por prenda.
- **Etiquetas, ventas flash, cupones y banners** (rebanada 6), reseñas, pasarela de pago y cuentas de cliente.
- **Mensajería externa (Redis, RabbitMQ, SQS):** la cola es de PostgreSQL detrás de un puerto; cambiarla por otra no afecta a los casos de uso.

## Supuestos (a revisar con el cliente)

- Roles: Gerente todo; Despacho ingresos, ajustes y consulta; Atención solo consulta.
- Un solo almacén; la ubicación es una etiqueta de texto libre con límite de largo.
- Calzado como catálogo inicial: tallas y colores son etiquetas validadas, no un enum.
- Los productos y categorías se editan de forma síncrona (CRUD); solo el **stock** es asíncrono por cola.
