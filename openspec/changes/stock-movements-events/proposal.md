# Proposal

## Why

Hoy el inventario solo conoce tres movimientos fijos (ingreso, salida, ajuste). El negocio necesita distinguir **por qué** se movió el stock (compra, venta, devolución, merma, regalo) para medir si se gana o se pierde, y necesita que cada cambio de stock sea un **hecho** que otras piezas puedan escuchar (la tienda, la página de estado, el libro diario) sin tocar la cola otra vez. Este change prepara esa base: no vende nada nuevo, pero hace posibles las reservas y el libro diario sin reescribir el inventario.

## What Changes

- **Tipos de movimiento como datos**: una tabla de tipos (código, nombre, clase ingreso/salida/ajuste, activo) que el Gerente puede ampliar y desactivar. Se siembran los 3 tipos de siempre y 6 tipos útiles (compra, devolución de cliente, venta, merma o daño, regalo o muestra, ajuste por conteo). La clase sigue decidiendo cómo cambia el stock; el tipo solo dice por qué.
- **Cada comando y cada movimiento llevan el código de su tipo.** Lo que ya existe sigue valiendo: un comando sin tipo usa el tipo de sistema de su clase.
- **Historial con saldo**: cada movimiento guarda cuánto stock físico quedó después de aplicarlo, calculado en la misma transacción. Los movimientos existentes se rellenan al migrar y la migración se detiene si el último saldo no coincide con el stock actual.
- **Eventos**: al aplicar un comando se guarda en la misma transacción un hecho («el stock de esta variante cambió») con el estado resultante y un número de orden. Un despachador entrega cada hecho a sus suscriptores con reintentos, deduplicación y estado «necesita revisión», visibles en el estado de la cola y con reintento manual del Gerente.
- **Admin**: al registrar un movimiento se elige primero la clase (ingreso, salida, ajuste) y luego el tipo; una pantalla para ver y administrar los tipos; el historial de la variante muestra el nombre del tipo y el saldo.

## Capabilities

### New Capabilities
- `movement-types`: catálogo de tipos de movimiento administrable (crear, renombrar, desactivar), con los tipos de sistema protegidos.
- `stock-events`: hechos de cambio de stock guardados con el movimiento, entrega a suscriptores con reintentos y deduplicación, y revisión manual de los fallidos.

### Modified Capabilities
- `warehouse-stock`: el movimiento registra el código de su tipo y el saldo resultante; el historial se puede filtrar por tipo y muestra el saldo.
- `stock-command-queue`: el comando lleva el código del tipo (con la idempotencia intacta) y el estado de la cola informa las entregas de eventos.
- `warehouse-admin`: elegir clase y tipo al registrar, pantalla de tipos y saldo en el historial.

## Impact

- **API (`services/api`)**: contexto `inventory` (tipos, comando y movimiento con código de tipo, saldo, evento en `apply`); motor de eventos genérico en `shared` (puerto de suscriptor, despachador, almacén de eventos y entregas); migraciones (tabla de tipos, columnas nuevas con relleno, tablas de eventos y entregas); fakes y suites de contrato actualizados.
- **Admin (`apps/admin`)**: hoja de movimiento (clase, luego tipo), historial con saldo y una pantalla de tipos. Cumple las leyes de `.ux/` (Hick: no más de 7 tipos visibles a la vez por clase).
- **Tienda**: sin cambios.
- **Fase del roadmap**: base de las rebanadas 4, 5 y 8 (reservas y pedidos) y del libro diario; recorta la rebanada 2 (catálogo y almacén) añadiendo lo que le faltaba al inventario.

## Out of scope

- Movimientos con varias líneas y reservar todo o nada (change `reservations-cart`, donde nace la necesidad de tomar varias variantes a la vez).
- Los tipos de reserva y liberación (`RESERVE`, `RELEASE`) y escribir `reserved`.
- Tiempo real hacia la tienda, SSE o WebSocket, y el cambio del requisito de caché de `public-catalog`. Este change deja los eventos listos; el primer suscriptor real llega con el change de la página de estado.
- Libro diario, costos de compra, gastos y métricas.
- Cuentas, notas de venta y datos de clientes.
- Pantalla del admin para las entregas de eventos: en este change se consultan y reintentan solo por la API.
- Cualquier suscriptor de producción: en este change los eventos se verifican con un suscriptor de prueba con fallos inyectados.
