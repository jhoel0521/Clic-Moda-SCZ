# Design

## Context

Estado verificado en el código:

- La cola ya es el centro del inventario: `stock_commands` (con `seq` único, `type` limitado por `CHECK` a `RECEIVE`, `WITHDRAW`, `ADJUST`, huella `request_hash`, clave de idempotencia única) y `stock_movements` (una fila inmutable por comando, con `command_id` único, `type` con el mismo `CHECK` y un trigger que prohíbe `UPDATE` y `DELETE`). `TypeOrmStockProcessingAdapter.inTransaction` reclama el comando, decide con `StockPolicy.decide(command, level)`, actualiza `stock_levels` (el `UPDATE ... RETURNING on_hand` ya devuelve el saldo) y escribe el movimiento y el estado final, todo en una transacción con candado por variante.
- `StockPolicy` decide por `command.type` (la clase). El `Quantity` del ajuste es el conteo físico. `StockLevel.reserved` existe, pero nada lo escribe todavía.
- La huella del comando (`fingerprintOf`) es `sha256(JSON([tipo, variante, unidades, motivo]))`; cambiarla rompería la comparación de los comandos ya aceptados con clave.
- El admin fija los tres tipos en `lib/stock.ts` (`MovementKind`, `KIND_LABELS`) y los usa `CellPanel`, `MovementSheet` y `MovementsPanel`. Los fakes en memoria y las suites de contrato (`testing/`) cubren cola, procesamiento, niveles y consultas.
- `ARCHITECTURE.md` y `.oxlintrc.json` hacen cumplir las capas: el dominio no importa frameworks ni capas; la aplicación solo `@nestjs/common`; la infraestructura puede todo. `shared/` ya tiene `domain`, `application` e `infrastructure`.
- Referencia de concepto (solo ideas, no código): `almacen-api` (tipo de movimiento como fila con una clase primitiva y activación sin tocar código; kardex con saldo ya calculado) y `tenant-hub` (contrato del bus: evento guardado con el cambio, una entrega por suscriptor, intentos, `needs_review`, deduplicación y reintento manual; es una simulación en el navegador, no un broker).

## Goals / Non-Goals

**Goals:** (1) que el motivo de un movimiento sea un dato administrable; (2) que cada movimiento sepa su saldo; (3) que cada cambio de stock sea un hecho entregable a otras piezas con garantías.

**Non-Goals:** documentos con varias líneas, `RESERVE`/`RELEASE`, tiempo real hacia la tienda, cualquier suscriptor de producción, costos y libro diario. El comando sigue siendo una sola variante: tomar varias a la vez choca con el orden por variante de la cola y nace con el carrito.

## Decisions

**D1. El tipo agrega un código; la clase sigue mandando.** `type` conserva su significado (la clase `RECEIVE`/`WITHDRAW`/`ADJUST`) y `StockPolicy` no cambia. Se agrega `type_code` a comandos y movimientos. Así las reglas de stock no dependen de datos editables y el `CHECK` de `type` se queda como está (no se relaja). *Alternativa descartada:* reemplazar `type` por el código del catálogo (obligaría a que `StockPolicy` consulte datos y rompe la prueba pura de la política).

**D2. Catálogo `movement_types`.** Tabla con `code` (clave primaria, `^[A-Z0-9_]{2,30}$`, **generado por el sistema a partir del nombre** con `TypeCode.fromName` y sufijo `_2`, `_3` si se repite; la persona nunca lo escribe), `name` (3 a 60), `kind` (`RECEIVE`/`WITHDRAW`/`ADJUST`), `active`, `system` y `created_at`. Se siembran en la migración los 3 tipos de sistema con código igual a su clase y los 6 sugeridos (`PURCHASE`, `CUSTOMER_RETURN`, `SALE`, `SHRINKAGE`, `GIFT`, `COUNT`). El código y la clase no cambian jamás, no se borra (clave foránea `RESTRICT`), los de sistema no se desactivan. Ubicación: **domain** (entidad `MovementType`, objetos de valor `TypeCode`, `TypeName`, errores, puerto `MovementTypesRepository`); **application** (casos de uso `ListMovementTypes`, `CreateMovementType`, `RenameMovementType`, `SetMovementTypeActive`); **infrastructure** (repositorio TypeORM, controlador `/inventory/movement-types`, solo Gerente para escribir). Prueba de contrato del repositorio contra el fake y Postgres.

**D3. Comando y movimiento con `type_code`.** Columna `type_code` en `stock_commands` y `stock_movements`, con clave foránea a `movement_types`. La migración rellena lo existente con el código de la clase y luego exige `NOT NULL`. `EnqueueStockCommand` busca el tipo por un puerto de lectura, comprueba que esté activo y que su clase coincida con la del comando, y usa el tipo de sistema si no viene código. Un comando ya aceptado con un tipo que luego se desactiva **se procesa igual**: el rechazo es solo al aceptar.

**D4. La idempotencia no cambia para lo anterior.** La huella pasa a ser `[tipo, variante, unidades, motivo]` cuando el código es el de sistema de la clase (idéntica a la actual) y `[tipo, variante, unidades, motivo, código]` cuando no. Un comando viejo repetido con su clave sigue dando el mismo resultado, y reutilizar la clave con otro tipo da conflicto. Se prueba con una huella calculada antes del cambio y escrita como valor fijo.

**D5. Saldo en el movimiento.** `stock_movements.balance_after` (`integer NOT NULL`, `>= 0`), escrito en `apply()` con el `on_hand` que ya devuelve `changeStock` dentro de la transacción. La migración rellena lo existente con `SUM(delta) OVER (PARTITION BY variant_id ORDER BY command.seq)` y, como el trigger prohíbe `UPDATE`, lo deshabilita y vuelve a habilitar **dentro de la misma migración**. Antes de confirmar comprueba que el último saldo de cada variante coincide con `stock_levels.on_hand`; si no, aborta con un mensaje que nombra las variantes. El historial devuelve `balance_after` y el nombre del tipo (por unión).

**D6. Evento guardado con el cambio (outbox).** Tabla `domain_events` (`id`, `seq` bigint con identidad, `type` = `stock.applied`, `aggregate_id` = variante, `payload` jsonb, `occurred_at`). `apply()` inserta el evento con el mismo `manager` que actualiza el stock, de modo que existen ambos o ninguno. Payload: variante, movimiento, código del tipo, clase, variación, unidades físicas y disponibles después (físicas menos reservadas, ambas devueltas por la misma sentencia que cambia el stock), hora; **sin** motivo, operador ni datos de personas. Ubicación: el evento es un objeto de valor de **domain** (`StockApplied`), el adaptador de procesamiento (**infrastructure**) lo serializa con un `EventOutbox` genérico que vive en `shared/infrastructure/events` (recibe el `EntityManager`); la **aplicación** de `inventory` no conoce la tabla. No se emite evento al rechazar un comando.

**D7. Entregas por suscriptor, creadas con el evento.** Tabla `event_deliveries` (`id`, `event_id`, `subscriber`, `status` = `pending | executed | needs_review`, `attempts`, `last_error`, `available_at`, `executed_at`, `deduplicated`; única `(event_id, subscriber)`) y tabla `event_subscribers (name, registered_at)`. Los suscriptores se declaran en código (puerto `EventSubscriber { name; handle(event) }` en `shared/application`, token multi-proveedor) y el despachador los **registra** (inserción idempotente) al arrancar y al inicio de cada pasada. Al guardar un evento, `apply()` crea en **la misma transacción** una entrega por cada fila de `event_subscribers` (`INSERT … SELECT`): así un suscriptor registrado después no recibe el pasado y no existe ningún cursor sobre `seq` (que se asigna al insertar, no al confirmar, y se saltaría eventos con instancias en paralelo). **Reclamo:** una sentencia propia ya confirmada elige la entrega pendiente que le toca (`FOR UPDATE SKIP LOCKED`), suma el intento y la reserva por un plazo (`available_at` hacia adelante); el suscriptor se ejecuta fuera de esa transacción y luego se marca `executed` o se reprograma. **Garantía:** al menos una vez (una caída entre el efecto y la marca repite la entrega tras el plazo); una entrega ya `executed` no se vuelve a entregar y un suscriptor cuyo efecto no sea atómico con la marca debe ser idempotente. El número de orden (`seq`) solo es creciente dentro de una variante (se asigna dentro del candado de la variante); el payload lleva el estado resultante para que un suscriptor ignore un evento viejo.

**D8. Despachador apagable.** `EventDispatcher` (infrastructure) como el procesador de la cola, con `EVENT_DISPATCHER=off` y `EVENT_DISPATCH_POLL_MS`; reintentos con espera creciente (5 intentos; la política de la cola se reutiliza como constante propia). Los eventos guardados nunca se pierden al apagarlo. El estado de la cola (`GET /inventory/queue`) suma `events: { pending, needsReview, oldestPendingAgeSeconds }`, y el Gerente puede ver el último error y reintentar una entrega (`POST /inventory/event-deliveries/:id/retry`).

**D9. Sin suscriptores de producción.** En este change nadie escucha en producción. Los eventos se verifican con un suscriptor de prueba con fallos inyectados (tres fallos y recuperación, cinco y revisión, repetición y duplicado, y un suscriptor tardío). El primer oyente real llega con el change de la página de estado, que también decide el transporte hacia la tienda.

**D10. Admin: clase primero, tipo después.** La hoja de movimiento conserva el primer paso (Ingreso, Retiro, Ajuste), y agrega un campo «Tipo» con el tipo de sistema preseleccionado, de modo que quien no quiera elegir no hace un paso más. Con más de 7 tipos activos en una clase se muestran los 7 primeros (el tipo de sistema primero, después por fecha de creación) y «Ver todos» (Hick). Pantalla nueva bajo Inventario (`/productos/tipos`), alcanzable con un enlace secundario desde la pantalla de Inventario, **sin pestaña nueva** en la navegación principal (Gerente: crear, renombrar, activar o desactivar; resto del personal: solo lectura). Estados: cargando, error con reintento y sin permiso. El historial muestra tipo, variación y saldo. `lib/stock.ts` deja de fijar los tres tipos: la clase queda como tipo TypeScript y los nombres vienen de la API.

**D11. UX declarada (ux-laws).** Hick: máximo 7 tipos visibles por clase, una acción principal por pantalla. Fitts: controles de 44×44 px con 8 px de separación; acción principal al alcance del pulgar en el teléfono. Final del flujo: tras enviar, el panel sigue mostrando «En cola» y luego el resultado, como hoy. Se pasa `ux-plan-review` y luego `ux-check` con las leyes.

## Risks / Trade-offs

- **[Relleno de saldos con el trigger de inmutabilidad]** → se deshabilita y rehabilita dentro de la misma migración transaccional y se comprueba el último saldo contra el stock actual; si no coincide, la migración falla sin cambiar nada. Se prueba con datos reales de varias variantes y con una discrepancia fabricada.
- **[Cambiar la huella rompe comandos viejos]** → D4 la deja idéntica para los de sistema; prueba con valor fijo precalculado.
- **[Entregas al menos una vez]** → deduplicación por `(evento, suscriptor)` y payload con estado resultante; los suscriptores futuros deben ser idempotentes.
- **[El outbox crece sin límite]** → no se purga en este change; se anota para el despliegue (purga de eventos ejecutados con antigüedad configurable).
- **[Un tipo desactivado con comandos pendientes]** → se procesan igual (D3), por lo que el historial nunca queda con un tipo inexistente.
- **[Hick en el selector]** → tipo preseleccionado y tope de 7.

## Migration Plan

1. Migración 1: `movement_types` con su siembra; `type_code` en comandos y movimientos (relleno y `NOT NULL`); `balance_after` con su relleno y comprobación; tablas `domain_events`, `event_subscribers` y `event_deliveries`.
2. Desplegar la API; el despachador arranca sin suscriptores (no hace nada).
3. Desplegar el admin con el campo de tipo y la pantalla de tipos.
4. Reversión: la migración tiene `down` que elimina lo agregado; los movimientos conservan su `type` (clase), por lo que el sistema anterior sigue funcionando.

## Open Questions

- Cuántos días se conservan los eventos ya ejecutados antes de purgarlos (se decide al desplegar; no cambia el código de este change).

## Comprobaciones previas (tarea 1.2)

Verificadas leyendo el código antes de implementar:

- La huella se calcula en `services/api/src/inventory/domain/entities/stock-command.entity.ts:41` (`fingerprintOf`) y se compara en `typeorm-stock-commands.repository.ts:61` (`original.requestHash !== command.requestHash`); la columna es `request_hash character(64)` y `inventory.rows.ts:68` la recorta al leerla. El fake en memoria usa la misma propiedad del comando.
- `stock_movements.command_id` es único (`UQ_stock_movements_command`, migración `1794400000004`, línea 29), por lo que cada comando produce como máximo un movimiento y un evento por movimiento no se duplica.
- El admin fija los tres tipos en `apps/admin/src/lib/stock.ts` (`MovementKind`, línea 3; `KIND_LABELS`, 36; textos por clase, 43 y 49) y los consumen `CellPanel.tsx`, `MovementSheet.tsx` y `MovementsPanel.tsx`.
