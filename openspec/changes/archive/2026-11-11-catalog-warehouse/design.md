# Design

## Context

Ver `proposal.md` para el motivo. Estado actual relevante:

- `services/api` tiene un solo contexto hexagonal, `identity` (`domain/application/infrastructure`), con pruebas de contrato por puerto contra una implementación en memoria y otra TypeORM sobre `clic_moda_test`. Las reglas de capas las exige `.oxlintrc.json`; las funciones tienen un máximo de 25 líneas.
- El patrón de auditoría atómica ya existe (`user_role_events`: el cambio y su evento se escriben en la misma transacción) y `@Roles` + `RolesGuard` ya protegen rutas (probado solo con una ruta de prueba en e2e).
- `apps/admin` es un Astro con una isla React y un tema que solo importa Tailwind; no hay pantallas reales ni sesión.
- El cliente pidió (mensaje del 2026-11-10): **todo el stock pasa por una cola y una máquina de estados; ante muchas solicitudes simultáneas gana la primera**. El cliente no cobra con pasarela: el pago es manual por WhatsApp, por lo que el stock debe poder reservarse (rebanadas 4 y 5).
- La API no tiene `refresh` (solo `login`, `me`): el token de acceso dura 8 horas.

## Goals / Non-Goals

**Goals:**
- Un modelo de catálogo y de stock que las rebanadas de pedidos reutilicen sin migrar la tabla caliente.
- Garantía fuerte: el stock nunca es negativo ni se aplica dos veces, aunque haya reintentos, reinicios o solicitudes simultáneas.
- Orden de llegada determinista por variante, sin dependencia externa nueva (sin Redis).

**Non-Goals:**
- Casos de uso de reservar/liberar/confirmar (llegan con pedidos; aquí solo se deja la columna `reserved` y el mecanismo de cola).
- Capacidad de millones de comandos por segundo: el diseño la **permite sustituyendo el adaptador de la cola** (ver Riesgos), pero este change la mide y no la promete.

## Decisions

### D1. Dos contextos: `catalog` e `inventory`
- `catalog` (Category, Product con sus Variant) e `inventory` (StockLevel, StockMovement, StockCommand). `inventory` se refiere a una variante solo por `VariantId`; no importa código de `catalog`.
- *Por qué*: pedidos hablará sobre todo con inventario (reservar, liberar, confirmar); un contexto estrecho evita reorganizar después. *Descartado*: un único contexto `warehouse` (mezcla agregados con ritmos de cambio muy distintos).

### D2. Sin transacciones entre contextos
- Registrar un producto crea producto y variantes (una transacción de `catalog`). El stock inicial es un **ingreso de mercadería** aparte, como en un almacén real, y no una parte del registro.
- Una variante sin fila de stock equivale a stock cero: la fila de `stock_levels` se crea con `INSERT … ON CONFLICT` en el primer movimiento o al fijar ubicación/umbral. Así `inventory` no necesita enterarse del alta de variantes.
- `inventory` verifica que la variante existe y está activa con el puerto `VariantLookupPort`, implementado con una consulta de solo lectura a `product_variants`; la clave foránea de la base garantiza la integridad.

### D3. Dinero, SKU y atributos
- `Money`: entero de centavos de Bs (`price_cents`, `CHECK > 0 AND <= 10000000`); la API recibe y devuelve decimales con dos cifras y lo convierte en el borde.
- `Sku`: 3–40 caracteres `[A-Za-z0-9.-]`, columna `citext` única. Si falta, `SkuGenerator` (servicio de dominio puro) la compone con producto + talla + color y el caso de uso reintenta con sufijo si choca.
- `Size` y `Color` son etiquetas validadas (largo y caracteres), no enumeraciones: el catálogo inicial son zapatos, pero el modelo no se ata a ellos. Restricción única `(product_id, size, color)`.
- Los productos y variantes se **desactivan, no se borran**; `categories.id` se referencia con `ON DELETE RESTRICT` y el caso de uso devuelve un conflicto legible antes de tocar la base.

### D4. Stock: tabla caliente con restricciones de base
`stock_levels(variant_id PK, on_hand, reserved, location, reorder_level, updated_at)` con `CHECK (on_hand >= 0)`, `CHECK (reserved >= 0)`, `CHECK (reserved <= on_hand)`. Disponible = `on_hand - reserved` (calculado, no almacenado). Cada cambio es una actualización condicional (`UPDATE … SET on_hand = on_hand + :delta WHERE on_hand + :delta >= reserved`) más una fila en `stock_movements`, en la misma transacción; las restricciones son la última línea de defensa si el código fallara.

### D5. La cola (decisión central)
**Dónde vive.** Tabla `stock_commands` en PostgreSQL, detrás del puerto `StockCommandsRepository` (dominio de `inventory`). Sin infraestructura nueva: el negocio factura menos de 5 mil Bs/mes y no justifica operar Redis o RabbitMQ.

**Máquina de estados** (entidad `StockCommand`, dominio): `PENDING → APPLIED | REJECTED`. Las transiciones inválidas lanzan error de dominio; los finales son inmutables. No hay estado `PROCESSING` persistido: cada comando se resuelve en **una sola transacción** (reclamar, decidir, aplicar al stock, escribir el movimiento y fijar el estado final). Si el proceso cae a mitad, la transacción se revierte y el comando sigue `PENDING`: no quedan comandos atascados ni cambios a medias, y no hace falta un temporizador de arrendamiento.

**Orden de llegada.** `seq` (secuencia de PostgreSQL) más `accepted_at` del reloj del servidor. Como una secuencia puede asignar números que se confirman fuera de orden, el **encolado** toma `pg_advisory_xact_lock(NS_ENQUEUE, hashtext(variant_id))` antes del `INSERT`, de modo que para una misma variante el orden de `seq` coincide con el orden de confirmación. Los encolados de una variante se serializan durante un `INSERT` (microsegundos); entre variantes no hay contención. El procesamiento usa **otro espacio de claves** (`NS_PROCESS`) a propósito: si compartieran clave, cada encolado de una variante disputada esperaría a que termine el procesamiento, justo en la ráfaga de un Live. No hace falta compartirla: un encolado en vuelo siempre recibe un `seq` mayor que cualquier comando ya visible, así que no puede adelantarse a ninguno.

**Procesamiento serial por variante, paralelo entre variantes.** El procesador reclama, en una transacción, el comando `PENDING` más antiguo de una variante que no esté ya bloqueada: `pg_try_advisory_xact_lock(NS_PROCESS, hashtext(variant_id))` + `FOR UPDATE SKIP LOCKED`. Solo el más antiguo (por `seq`) de cada variante es candidato, y esa comprobación **no filtra por `available_at`**: si el más antiguo está esperando por un reintento, **ningún comando posterior de esa variante lo adelanta** (si no, se rompería «el primero que llega gana»). El filtro `available_at <= now()` solo decide si el candidato puede intentarse ya. Varias instancias de la API pueden procesar a la vez sin pisarse. Una colisión de `hashtext` solo causa serialización extra, nunca un error.

**Decisión de negocio en el dominio.** `StockPolicy.decide(command, stockLevel)` (puro) devuelve `APPLY(delta)` o `REJECT(motivo)`: salida mayor que el disponible → `INSUFFICIENT_STOCK`; ajuste por debajo de lo reservado → `BELOW_RESERVED`. El ajuste por conteo (`ADJUST`) lleva la cantidad contada y el delta se calcula al procesar, no al encolar.

**Idempotencia.** Clave opcional (`Idempotency-Key`, 8–64 caracteres) con índice único y huella SHA-256 del contenido. Misma clave y huella → se devuelve el comando original; misma clave y otra huella → conflicto. El encolado usa `INSERT … ON CONFLICT DO NOTHING` y relee, así que es seguro ante reintentos simultáneos.

**Reintentos.** `attempts` se incrementa en **su propia transacción confirmada, antes** de abrir la de procesamiento. Así el máximo de 5 también se cumple si el comando tumba el proceso (el contador no depende de un `catch` en proceso) y un comando venenoso no se reintenta eternamente entre reinicios. Un error transitorio revierte la transacción de procesamiento y `available_at` con espera creciente reprograma el comando; al agotar los intentos queda `REJECTED` con `PROCESSING_FAILED` y se registra para revisión.

**Cuándo corre.** `StockCommandProcessor` (infraestructura, ciclo de vida de Nest) consulta cada `STOCK_QUEUE_POLL_MS` (200 por defecto) y se despierta de inmediato tras cada encolado del mismo proceso; `STOCK_QUEUE_WORKER=off` permite ejecutarlo en un proceso aparte. Al apagar, termina el comando en curso. En pruebas se invoca `drain()` de forma determinista en lugar del temporizador.

**Alternativas descartadas.** *pg-boss*: no garantiza orden estricto por variante. *BullMQ/Redis*: más infraestructura y una segunda fuente de verdad con riesgo de desfase. *`SELECT … FOR UPDATE` directo en la petición*: más simple, pero la petición espera y no hay cola, estado ni resultado consultable, que el cliente pidió explícitamente.

### D6. Ubicación de cada pieza por capa

**`catalog`**
| Capa | Piezas |
|---|---|
| domain | Entidades `Category`, `Product` (raíz) y `Variant`; objetos de valor `CategoryName`, `Slug`, `ProductName`, `Money`, `Sku`, `Size`, `Color`, `CategoryId`, `ProductId`, `VariantId`; servicio `SkuGenerator`; errores de valor; puertos `CategoriesRepository` (`CATEGORIES_REPOSITORY`) y `ProductsRepository` (`PRODUCTS_REPOSITORY`) |
| application | Casos de uso `CreateCategory`, `UpdateCategory`, `DeleteCategory`, `ListCategories`, `RegisterProduct`, `UpdateProduct`, `SetProductActive`, `AddVariant`, `UpdateVariant`, `SetVariantActive`, `SearchProducts`, `GetProduct`; DTOs de comando, consulta y resultado; puerto `VariantHasMovementsPort` (¿la variante ya tiene movimientos de inventario?, para bloquear el cambio de SKU) |
| infrastructure | Controladores y DTOs HTTP (Zod), entidades ORM y mappers, `TypeOrmCategoriesRepository`, `TypeOrmProductsRepository` (traduce el error 23505 de unicidad a `ConflictError`), `SqlVariantHasMovements` (consulta de solo lectura a `stock_movements`, sin importar código de `inventory`), `catalog.module.ts` |

**`inventory`**
| Capa | Piezas |
|---|---|
| domain | `StockLevel`, `StockMovement`, `StockCommand` (máquina de estados); objetos de valor `Quantity`, `Reason`, `IdempotencyKey`, `CommandId`, `MovementType`, `CommandStatus`; `StockPolicy`; puertos `StockCommandsRepository` y `StockLevelsRepository` |
| application | Casos de uso `EnqueueStockCommand`, `ProcessNextStockCommand`, `GetStockCommand`, `ListStock`, `ListLowStock`, `ListMovements`, `GetQueueStatus`, `UpdateStockSettings`; puertos `VariantLookupPort`, `ClockPort`, `StockCommandProcessingPort` (transacción de procesamiento) y `StockQueryPort` (lecturas) |
| infrastructure | `TypeOrmStockCommandsRepository`, `TypeOrmStockProcessingAdapter` (transacción y bloqueos), `TypeOrmStockQueries`, `SqlVariantLookup`, `StockCommandProcessor`, controladores y DTOs HTTP, CLI de seed |

**Pruebas de contrato (una por puerto, contra memoria y TypeORM):** `CategoriesRepository`, `ProductsRepository`, `VariantHasMovementsPort`, `StockCommandsRepository` (encolado, idempotencia y orden), `StockLevelsRepository`, `VariantLookupPort`, `StockQueryPort` y `StockCommandProcessingPort` (reclamo por variante, orden, bloqueo y reversión; el reclamo vive aquí y no en el repositorio).

### D7. Roles y rutas
`@Roles` en cada ruta: catálogo de escritura solo Gerente; lectura de todo el personal; comandos y ajustes de stock Gerente y Despacho; consultas Atención. Rutas: `/catalog/categories`, `/catalog/products`, `/catalog/products/:id/variants`, `POST /inventory/commands` (202 con `Location`), `GET /inventory/commands/:id`, `GET /inventory/queue`, `GET /inventory/stock`, `GET /inventory/stock/low`, `GET /inventory/variants/:id/movements`, `PATCH /inventory/stock/:variantId/settings`. La ubicación y el umbral **no** son contendidos, por lo que se actualizan de forma síncrona. Estas son las primeras rutas reales con rol: cierran la tarea 9.2 de `platform-foundation`.

### D8. Admin: sesión en el servidor
Astro SSR guarda el token de acceso en una cookie `httpOnly`, `Secure` (salvo en desarrollo) y `SameSite=Lax`, que nunca ve el JavaScript del navegador; las islas React llaman a rutas de Astro (`/api/*`) que reenvían a la API añadiendo el `Authorization`. Un middleware protege las pantallas y redirige al inicio de sesión con el destino. Como la API no tiene `refresh`, la sesión dura lo que el token (8 h) y luego se vuelve a iniciar sesión. Las islas consultan el estado de un comando cada 750 ms hasta su estado final o 30 s (después muestran "sigue en cola"). Formularios con React Hook Form + Zod (versiones exactas a fijar al implementar tras comprobar npm).

### D9. Tema y UX
El tema del admin recibe los tokens de `.ux/standard/tokens.json`. Tres pares de contraste de ese archivo hoy fallan (borde, éxito y advertencia sobre el fondo): antes de usarlos se proponen valores con `contrast.mjs --suggest` y se registran en el CHANGELOG del estándar. Cada pantalla pasa `ux-check`.

### D10. Datos de ejemplo
`seed:catalog` (CLI, idempotente) crea categorías y productos genéricos de calzado y los ingresa por la **misma cola** (`EnqueueStockCommand` + `drain`), de modo que el seed también prueba el camino real.

## Risks / Trade-offs

- **Cuello de botella por variante:** una variante muy disputada se procesa de uno en uno. Es intencional (es lo que da el orden); cada comando es una transacción de milisegundos. *Medición:* una tarea de carga fija el rendimiento real y lo documenta. Si algún día hiciera falta más, el puerto permite cambiar el adaptador (por ejemplo, Kafka o Redis Streams particionados por `variant_id`) sin tocar los casos de uso.
- **Latencia de la cola:** el resultado no es inmediato (≈ 200 ms con el sondeo por defecto, y menos con el despertar inmediato). Se acepta a cambio de orden, resultado consultable y cero pérdidas; la UI muestra "En cola".
- **Comando que bloquea la fila de su variante:** un fallo persistente retrasa los siguientes de esa variante. Se acota con 5 intentos y espera creciente, tras los cuales se rechaza y la cola avanza.
- **`reserved` sin usar:** la columna existe antes que su caso de uso. Es deliberado para no migrar una tabla caliente después; sus restricciones se prueban ya con datos de prueba.
- **Contención en el encolado por variante:** el bloqueo consultivo serializa los `INSERT` de una misma variante. Con el volumen del negocio es irrelevante; si no lo fuera, se movería el orden a una columna por variante.
- **Sin `refresh` de sesión:** el personal debe volver a iniciar sesión cada 8 horas; se registra como mejora futura de `staff-auth`.
- **Imágenes diferidas:** un producto sin foto es poco útil para la tienda pública, pero no bloquea el almacén ni el admin; el change de imágenes resuelve la decisión abierta nº 7.
- **Configuración de proyecto desactualizada:** `openspec/config.yaml` aún menciona "Verashoe", pago por QR y que `apps/shop` usa Next.js. Este change se apoya en las respuestas del cliente (`docs/prototipo/auditoria.md`, sección 5) y en el stack real; el config conviene corregirlo aparte.

### Medición de carga (2026-11-10, `pnpm load`)

Laboratorio en Docker (`e2e/load`): base, API y k6, **cada uno con 0.5 CPU y 250 MB**; scrypt a 2^14 solo en el laboratorio.

| Escenario | Resultado |
|---|---|
| Lectura, rampa a 30 usuarios virtuales (catálogo, inventario, resumen) | p95 49–90 ms, p99 95–172 ms según la ruta, 0 % de errores |
| Encolar una salida | p50 112 ms, p95 312 ms, p99 367 ms |
| 60 salidas simultáneas contra 5 unidades | 5 aplicadas y 55 rechazadas, hasta el estado final p95 1.5 s |
| 50 envíos con la misma clave | 1 solo comando |
| Consumo máximo | API 90 MB y 50 % de CPU (el tope), base 64 MB, k6 37 MB; ningún OOM |

Lectura: la API llegó al tope de CPU con 30 usuarios que piensan 1 s entre pasos (unas 54 peticiones por segundo en total), muy por encima de lo que harán 3 personas. Falta una prueba de estrés para hallar el punto de quiebre.

## Migration Plan

Cinco migraciones nuevas, todas aditivas y reversibles (`down` las deshace en orden inverso): `categories`; `products` y `product_variants`; `stock_levels` y `stock_movements`; `stock_commands`; índices. No hay datos previos que migrar. Despliegue: `pnpm db:migrate`, luego arrancar la API (que inicia el procesador). El seed es opcional.

## Open Questions

Ninguna que cambie lo que se construye. Los supuestos de roles y de almacén único están en `proposal.md` y se pueden corregir sin rehacer el diseño.
