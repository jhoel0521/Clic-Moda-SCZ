# Tasks

## 1. Revisión previa

- [x] 1.1 `ux-plan-review` de este change con las leyes (Hick, Fitts, final del flujo) y corregir lo que marque. Verificación: informe en `.ux/reports/` con veredicto LISTO
- [x] 1.2 Comprobar en el código que lo supuesto en el diseño es cierto: cómo se calcula `requestHash` en el repositorio de comandos, que `command_id` es único en `stock_movements` y dónde fija el admin los tres tipos. Verificación: nota corta en el change con las rutas y líneas comprobadas

## 2. Tipos de movimiento (services/api, contexto inventory)

- [x] 2.1 (domain) `TypeCode` (`^[A-Z0-9_]{2,30}$`, con `fromName` que lo genera del nombre y agrega sufijo si se repite), `TypeName` (3 a 60) y la entidad `MovementType` (clase fija, activo, sistema), con sus errores y el puerto `MovementTypesRepository`. Verificación: pruebas de dominio (código generado con acentos y espacios, sufijo por repetición, sistema no desactivable, clase inmutable)
- [x] 2.2 (application) Casos de uso `ListMovementTypes`, `CreateMovementType`, `RenameMovementType` y `SetMovementTypeActive` con DTOs por capa. Verificación: pruebas de caso de uso con el fake (duplicado, sistema protegido, renombrar conserva código)
- [x] 2.3 (infrastructure) Migración de `movement_types` con la siembra de los 9 tipos, repositorio TypeORM y fake en memoria. Verificación: suite de contrato del repositorio contra el fake y contra Postgres real
- [x] 2.4 (infrastructure) Controlador `/inventory/movement-types`: lectura para todo el personal, escritura solo Gerente, errores 422 por campo. Verificación: e2e de permisos por rol y de errores por campo

## 3. Comando y movimiento con tipo (services/api)

- [x] 3.1 (domain) `type_code` en `StockCommand` y `StockMovement`, y la huella que no cambia para los tipos de sistema. Verificación: prueba con una huella precalculada antes del cambio, escrita como valor fijo, más un caso con tipo distinto
- [x] 3.2 (application) `EnqueueStockCommand` valida tipo existente, activo y de la misma clase, y usa el de sistema por omisión; el puerto de lectura de tipos va aparte. Verificación: pruebas (sin código, desconocido, inactivo, de otra clase) y un comando pendiente cuyo tipo se desactiva se procesa
- [x] 3.3 (infrastructure) Migración de `type_code` en comandos y movimientos con relleno, clave foránea y `NOT NULL`; mapeos y consultas; fakes. Verificación: suites de contrato de comandos y procesamiento pasan contra fake y Postgres, con datos anteriores a la migración
- [x] 3.4 (infrastructure) e2e de punta a punta: una salida con tipo "Merma o daño" y el historial filtrado por código. Verificación: el e2e pasa con Postgres real

## 4. Saldo en el historial (services/api)

- [x] 4.1 (infrastructure) `balance_after` escrito en `apply()` con el `on_hand` de la transacción; incluido en el movimiento, en la consulta y en el fake. Verificación: contrato del procesamiento (el último saldo de cada variante es igual a su stock) y propiedad con muchos comandos mezclados
- [x] 4.2 (infrastructure) Migración con relleno por `seq` (trigger deshabilitado y vuelto a habilitar dentro de la misma migración) y comprobación contra `stock_levels`. Verificación: prueba de migración con varias variantes y otra con una discrepancia fabricada que aborta sin cambiar nada
- [x] 4.3 (infrastructure) El historial devuelve tipo (nombre) y saldo y filtra por código de tipo. Verificación: e2e del historial con los tres filtros y la paginación

## 5. Eventos (services/api, shared e inventory)

- [x] 5.1 (shared/application) Puerto `EventSubscriber`, el contrato del evento y la política de reintentos (5 intentos, espera creciente). Verificación: pruebas de la política
- [x] 5.2 (domain) Evento `StockApplied` como objeto de valor de `inventory` (variante, movimiento, tipo, clase, variación, físicas y disponibles, hora) sin motivo ni operador. Verificación: prueba que compara las claves permitidas
- [x] 5.3 (shared/infrastructure) `EventOutbox` genérico con el `EntityManager` (guarda el evento y crea una entrega por suscriptor registrado en la misma transacción), migración de `domain_events`, `event_subscribers` y `event_deliveries`. Verificación: suite de contrato del almacén contra el fake y Postgres real
- [x] 5.4 (infrastructure) `apply()` guarda el evento en la misma transacción. Verificación: pruebas de aplicado (1 evento), rechazado (0) y falla dentro de la transacción (ni movimiento ni evento ni stock)
- [x] 5.5 (shared/infrastructure) `EventDispatcher` apagable (`EVENT_DISPATCHER`, `EVENT_DISPATCH_POLL_MS`): crea las entregas faltantes, las procesa por suscriptor, deduplica y reintenta. Verificación: pruebas con un suscriptor de prueba (éxito, dos fallos y recuperación, cinco fallos y revisión, repetición marcada como duplicada, falla de uno sin frenar al otro, suscriptor tardío)
- [x] 5.6 (infrastructure) Estado de la cola con las entregas (pendientes, en revisión, antigüedad), último error visible al Gerente y reintento manual. Verificación: e2e de las tres lecturas y del reintento solo Gerente

## 6. Admin (apps/admin)

- [x] 6.1 `lib/stock.ts` sin tipos fijos (la clase como tipo, los nombres desde la API) y cliente de los tipos. Verificación: pruebas unitarias y `pnpm build:admin`
- [x] 6.2 Hoja de movimiento con campo «Tipo» (preseleccionado, máximo 7 y «Ver todos») y envío del código. Verificación: pruebas del componente (tipo por omisión, elegir otro, más de 7, doble envío) y medición en Chromium a 390 px
- [x] 6.3 Historial con tipo, variación y saldo. Verificación: pruebas del componente con y sin movimientos
- [x] 6.4 Pantalla de tipos bajo Inventario (`/productos/tipos`, con enlace secundario, sin pestaña nueva) (Gerente: crear, renombrar, activar o desactivar; resto: solo lectura) con errores junto al campo y confirmaciones. Verificación: pruebas del componente por rol y un flujo Playwright de crear y desactivar un tipo

## 7. Cierre

- [x] 7.1 Flujo Playwright de punta a punta: registrar una salida con tipo, ver el saldo en el historial y el estado de la cola con entregas. Verificación: el flujo pasa en `pnpm test:flows`
- [x] 7.2 `ux-check` con las leyes sobre las pantallas nuevas a 390 px. Verificación: informe en `.ux/reports/` sin bloqueantes o con la excepción que decida el usuario
- [x] 7.3 Documentar el patrón de eventos en `services/api/ARCHITECTURE.md`, actualizar `docs/database.dbml` y el `ROADMAP.md`. Verificación: `openspec validate --specs` y `pnpm check:full` pasan

## Workflow follow-up

- Archivar el change con `/opsx:archive stock-movements-events` cuando todo lo anterior esté hecho.
- El change siguiente (`reservations-cart`) agrega `RESERVE`/`RELEASE`, las líneas múltiples y el primer suscriptor real.
