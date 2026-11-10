# Tasks

## 1. Esquema de base de datos (capa shared/infrastructure)

- [x] 1.1 Migración `CreateCategories` (`categories`: id uuid, `name` citext único, `slug` único, `active`, fechas) y `CreateProducts` (`products` con FK `category_id ON DELETE RESTRICT`; `product_variants` con `sku` citext único, `size`, `color` nulo, `price_cents` con `CHECK > 0 AND <= 10000000`, `active`, único `(product_id, size, color)`), con `import type` y `down` completo; verificar subiendo y bajando con `pnpm db:migrate` / `db:revert` y que las restricciones rechazan datos inválidos con SQL directo.
- [x] 1.2 Migración `CreateStockTables` (`stock_levels` con los tres `CHECK`, `location` ≤ 40, `reorder_level` ≥ 0; `stock_movements` inmutable con `command_id` único, `type`, `delta`, `reason`, `operator`, `occurred_at`); verificar con SQL directo que un `on_hand` negativo y un `reserved > on_hand` son rechazados por la base.
- [x] 1.3 Migración `CreateStockCommands` (`stock_commands`: id, `seq` secuencia, `variant_id` FK, `type`, `quantity`, `reason`, `operator`, `idempotency_key` único nulo, `request_hash`, `status`, `reject_reason`, `attempts`, `available_at`, `accepted_at`, `resolved_at`, `movement_id`; índice parcial sobre `PENDING` por `(variant_id, seq)`); verificar con `EXPLAIN` que la consulta de reclamo usa el índice.
- [x] 1.4 Actualizar `docs/database.dbml` con las tablas nuevas y comprobar que cada columna coincide con las migraciones.

## 2. Catálogo — dominio (capa domain)

- [x] 2.1 Objetos de valor `CategoryName`, `Slug` (derivado del nombre, sin tildes ni símbolos) y `ProductName` con sus errores de valor; pruebas unitarias de límites y normalización (ñ, tildes, espacios).
- [x] 2.2 Objetos de valor `Money` (centavos enteros, 0 < x ≤ 10 000 000, conversión exacta desde decimales de dos cifras, rechazo de más decimales), `Sku`, `Size` y `Color`; pruebas unitarias incluyendo `349.90` sin pérdida de precisión.
- [x] 2.3 Entidades `Category`, `Variant` y `Product` (raíz: exige al menos una variante, no permite SKU repetido dentro del producto, activar/desactivar, agregar variante) y servicio `SkuGenerator`; pruebas unitarias puras de invariantes y de generación.
- [x] 2.4 Puertos `CategoriesRepository` y `ProductsRepository` con sus tokens, y las suites de contrato `categoriesRepositoryContract` y `productsRepositoryContract` más sus implementaciones en memoria; verificar que la suite pasa contra la implementación en memoria (alta atómica, SKU y nombre duplicados, búsqueda, paginación, conteo por categoría).

## 3. Catálogo — aplicación (capa application)

- [x] 3.1 DTOs de comando, consulta y resultado del catálogo y los casos de uso `CreateCategory`, `UpdateCategory`, `DeleteCategory` (conflicto si tiene productos) y `ListCategories` con conteo; pruebas unitarias con repositorios en memoria.
- [x] 3.2 Casos de uso `RegisterProduct` (categoría inexistente → no encontrada; SKU generado con reintento; todo o nada), `UpdateProduct`, `SetProductActive`; pruebas unitarias de cada escenario de `product-catalog`.
- [x] 3.3 Casos de uso `AddVariant`, `UpdateVariant` (el SKU no cambia si ya hay movimientos: consulta mediante un puerto de aplicación `VariantHasMovementsPort`), `SetVariantActive`, `SearchProducts` (texto, categoría, estado, paginación) y `GetProduct`; puerto `VariantHasMovementsPort` con su suite de contrato y su doble en memoria; pruebas unitarias.

## 4. Catálogo — infraestructura (capa infrastructure)

- [x] 4.1 Entidades ORM, mappers y `TypeOrmCategoriesRepository`; ejecutar `categoriesRepositoryContract` contra `clic_moda_test` y verificar que pasa igual que en memoria.
- [x] 4.2 `TypeOrmProductsRepository` (guardado en cascada atómico, traducción del error 23505 a `ConflictError`, búsqueda con paginación y conteo) y `SqlVariantHasMovements`; ejecutar `productsRepositoryContract` y la suite de `VariantHasMovementsPort` contra la base real, incluida la atomicidad con un SKU repetido en la segunda variante.
- [x] 4.3 Controladores y DTOs HTTP (Zod) de categorías y productos con `@Roles` (Gerente escribe, todo el personal lee) y `catalog.module.ts` registrado en `AppModule`; prueba e2e de cada ruta con Gerente 2xx, Despacho/Atención 403 en escritura y 401 sin sesión.

## 5. Inventario — dominio (capa domain)

- [ ] 5.1 Objetos de valor `Quantity`, `Reason` (3–200), `IdempotencyKey` (8–64), `CommandId`, `MovementType` y `CommandStatus`; pruebas unitarias de límites.
- [ ] 5.2 Entidades `StockLevel` (disponible = físico − reservado, invariantes), `StockMovement` y `StockCommand` con la máquina de estados `PENDING → APPLIED | REJECTED`; pruebas unitarias de cada transición válida, de las inválidas y de la inmutabilidad de los estados finales.
- [ ] 5.3 `StockPolicy.decide(command, level)` (`INSUFFICIENT_STOCK`, `BELOW_RESERVED`, delta del ajuste por conteo) con pruebas unitarias por tipo de comando, incluido el borde de stock exacto.
- [ ] 5.4 Puertos `StockCommandsRepository` y `StockLevelsRepository` con tokens, implementaciones en memoria y las suites de contrato `stockCommandsRepositoryContract` (encolado, idempotencia y orden) y `stockLevelsRepositoryContract`; verificar que pasan en memoria.

## 6. Inventario — aplicación (capa application)

- [ ] 6.1 Puertos `VariantLookupPort`, `ClockPort`, `StockCommandProcessingPort` y `StockQueryPort` con tokens y sus dobles en memoria; suites de contrato de `VariantLookupPort`, `StockQueryPort` y `StockCommandProcessingPort` (reclamo del más antiguo por variante, que un comando en espera de reintento bloquea a los posteriores de su variante, y reversión completa si falla a mitad); verificar que pasan contra los dobles en memoria.
- [ ] 6.2 Caso de uso `EnqueueStockCommand` (variante inexistente o inactiva, validación, idempotencia con huella, respuesta `PENDING`); pruebas unitarias de aceptación, reintento con la misma clave y conflicto con otra huella.
- [ ] 6.3 Caso de uso `ProcessNextStockCommand` (usa `StockCommandProcessingPort` y `StockPolicy`; devuelve resultado o `null` si no hay trabajo) y `GetStockCommand`; pruebas unitarias con el procesamiento en memoria, incluidos 100 comandos sobre 3 unidades con el resultado esperado.
- [ ] 6.4 Casos de uso de lectura `ListStock`, `ListLowStock`, `ListMovements`, `GetQueueStatus` y `UpdateStockSettings` (ubicación y umbral, síncrono); pruebas unitarias.

## 7. Inventario — infraestructura (capa infrastructure)

- [ ] 7.1 Entidades ORM y mappers de stock, movimientos y comandos; `TypeOrmStockLevelsRepository` y `SqlVariantLookup`; ejecutar las suites de contrato correspondientes contra la base real.
- [ ] 7.2 `TypeOrmStockCommandsRepository`: encolado con `pg_advisory_xact_lock(NS_ENQUEUE, …)` por variante, `INSERT … ON CONFLICT DO NOTHING` para la idempotencia y reintentos; ejecutar `stockCommandsRepositoryContract` contra la base real y verificar que `seq` respeta el orden de confirmación con encolados simultáneos.
- [ ] 7.3 `TypeOrmStockProcessingAdapter`: una transacción por comando (reclamo con `pg_try_advisory_xact_lock(NS_PROCESS, …)` y `SKIP LOCKED`, solo el más antiguo de la variante sin filtrar por `available_at`, actualización condicional, movimiento y estado final); ejecutar la suite de contrato de `StockCommandProcessingPort` contra la base real y verificar con una caída simulada a mitad de transacción que el comando sigue `PENDING` y el stock no cambia; verificar con un encolado simultáneo que un encolado no espera a un procesamiento en curso de la misma variante.
- [ ] 7.4 Política de reintentos (`attempts` incrementado en su propia transacción confirmada antes de procesar, espera creciente, máximo 5, `PROCESSING_FAILED`) y `TypeOrmStockQueries` (stock, bajo stock, movimientos paginados, estado de la cola); pruebas de integración de reintentos agotados, de un comando que tumba el proceso y se agota entre reinicios, y de cada consulta.
- [ ] 7.5 `StockCommandProcessor` (sondeo configurable `STOCK_QUEUE_POLL_MS`, despertar tras encolar, `STOCK_QUEUE_WORKER`, apagado ordenado) registrado en el ciclo de vida de Nest, con variables en `env.schema.ts` y `.env.example`; verificar que arranca con la API, procesa comandos y termina el comando en curso al apagar.

## 8. Inventario — HTTP y roles (capa infrastructure)

- [ ] 8.1 Controladores y DTOs HTTP (Zod): `POST /inventory/commands` (202, `Location`, cabecera `Idempotency-Key`), `GET /inventory/commands/:id` y `GET /inventory/queue` con `@Roles`; `inventory.module.ts` registrado en `AppModule`; prueba e2e del 202 y de la consulta del resultado tras `drain`.
- [ ] 8.2 Rutas de lectura y ajustes (`/inventory/stock`, `/stock/low`, `/variants/:id/movements`, `PATCH /stock/:variantId/settings`) con `@Roles`; prueba e2e por rol (Gerente y Despacho escriben, Atención 403 y solo lee, 401 sin sesión).
- [ ] 8.3 Cerrar la tarea 9.2 de `platform-foundation` con una prueba e2e sobre una ruta real: el Gerente inicia sesión y recibe 200, Despacho recibe 403 en una ruta solo de Gerente; marcarla como hecha en esa lista.

## 9. Pruebas de concurrencia y de carga (capa infrastructure)

- [ ] 9.1 Prueba de concurrencia: 200 salidas simultáneas de 1 unidad sobre una variante con 5 unidades, con varias instancias de procesador; verificar que exactamente 5 quedan `APPLIED`, 195 `REJECTED` con `INSUFFICIENT_STOCK`, el stock termina en 0 y la suma de movimientos coincide con el stock; añadir el caso en que el más antiguo falla y espera un reintento, y comprobar que ningún comando posterior de esa variante lo adelanta.
- [ ] 9.2 Prueba de idempotencia y de caída: mismo `Idempotency-Key` enviado 50 veces en paralelo produce un solo comando, y un proceso detenido a mitad no duplica ni pierde stock al reanudar.
- [ ] 9.3 Prueba de carga: 10 000 comandos repartidos entre 50 variantes; medir comandos por segundo y latencia hasta el estado final, registrar los números en `design.md` (Riesgos) y comprobar que no queda ningún `PENDING`.

## 10. Datos de ejemplo y documentación (capas infrastructure y docs)

- [ ] 10.1 CLI `seed:catalog` idempotente con categorías y productos genéricos de calzado ingresados por la cola (`EnqueueStockCommand` + `drain`), script `pnpm db:seed:catalog` en la raíz; verificar ejecutándolo dos veces (la segunda no duplica) y listando el stock resultante.
- [ ] 10.2 Actualizar `README`, `openspec/ROADMAP.md` (la rebanada 2 pasa antes que la 1, con su alcance real y lo diferido) y `services/api/ARCHITECTURE.md` con el patrón de cola de comandos; verificar que los comandos del README funcionan tal cual.

## 11. Admin — base (apps/admin)

- [ ] 11.1 Resolver los tres pares de contraste que fallan en `tokens.json` mediante **ux-discover** (que es quien modifica el estándar y su CHANGELOG, con `contrast.mjs --suggest`) y volcar los tokens resultantes al tema del admin; verificar con `tokens.mjs` que todos los pares pasan.
- [ ] 11.2 Inicio de sesión: página, ruta `/api/login` que llama a la API y guarda el token en cookie `httpOnly`, y cierre de sesión; pruebas de integración de credenciales válidas, inválidas y cookie sin acceso desde JavaScript.
- [ ] 11.3 Protección de pantallas: middleware que exige sesión y redirige con el destino, y pantalla de acceso denegado por rol; pruebas de integración de cada caso.
- [ ] 11.4 Cliente de la API del lado del servidor y rutas `/api/*` que reenvían con el `Authorization` (sin exponer el token), manejo uniforme de errores del servidor y diseño base (navegación según el rol); pruebas unitarias con Vitest.

## 12. Admin — pantallas (apps/admin)

- [ ] 12.1 Categorías: listado con conteo, crear, editar y borrar (con aviso si tiene productos), con validación y error junto al campo; pruebas de componentes (Vitest + Testing Library) de cada estado: carga, vacío, error y éxito.
- [ ] 12.2 Productos: listado paginado con búsqueda por nombre o SKU y filtros por categoría y estado; pruebas de componentes.
- [ ] 12.3 Formulario de producto con variantes dinámicas (agregar y quitar tallas y colores, SKU opcional), edición y activar o desactivar; pruebas de componentes, incluido el error de SKU duplicado junto al campo.
- [ ] 12.4 Almacén: tabla de stock por variante (físico, reservado, disponible, ubicación, umbral) con la lista de stock bajo; pruebas de componentes.
- [ ] 12.5 Ingreso, salida y ajuste con motivo, estado "En cola" actualizado hasta el estado final, rechazo explicado y bloqueo del doble envío; pruebas de componentes con una API simulada.
- [ ] 12.6 Historial de movimientos de una variante y vista de la cola (pendientes y antigüedad); pruebas de componentes.
- [ ] 12.7 Instalar y configurar Playwright en `apps/admin` (versión fijada, proyectos de escritorio y móvil de 360 px, arranque de la API y Docker desde la prueba, datos de prueba por flujo); verificar con una prueba mínima que abre el inicio de sesión.
- [ ] 12.8 Flujos e2e con Playwright contra la API real: el Gerente registra un producto, Despacho ingresa stock y ve "Aplicado", una salida mayor al stock se muestra rechazada, y Atención no ve los botones de modificar.

## 13. Cierre y verificación

- [ ] 13.1 `ux-check` sobre todas las pantallas nuevas (contraste AA, objetivos táctiles de 44 px, foco, estados, 360 px sin desplazamiento horizontal) y corregir lo que reporte.
- [ ] 13.2 Ejecutar `pnpm check:full` con Docker levantado y comprobar que lint (incluidos los límites de capa y las funciones de 25 líneas), pruebas unitarias, e2e y build pasan en los tres proyectos.
- [ ] 13.3 Recorrido manual del flujo con `pnpm dev`: registrar un producto, ingresar stock, ver "En cola" y luego "Aplicado", y comprobar en la base que la suma de movimientos coincide con el stock de cada variante.
