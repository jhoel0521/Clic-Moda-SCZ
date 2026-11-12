# Arquitectura del API (hexagonal)

Estándar obligatorio para todo lo que se construya en `services/api`. Lo hace cumplir el linter
(`.oxlintrc.json`) y lo exigen `openspec/config.yaml` y los changes de OpenSpec.

## 1. Regla de oro

Las dependencias apuntan **hacia adentro**:

```
infrastructure  →  application  →  domain
```

| Capa | Contiene | Puede importar |
|---|---|---|
| `domain` | Entidades, objetos de valor, errores de dominio, **puertos de repositorio** | Nada de frameworks ni de otras capas (solo TypeScript y `shared/domain`) |
| `application` | Casos de uso, DTOs de comandos/consultas/resultados, **puertos de servicios externos** | `domain` y los decoradores `@Injectable`/`@Inject` de `@nestjs/common`. Nunca infraestructura, TypeORM ni Express |
| `infrastructure` | Adaptadores: persistencia, HTTP, CLI, paquetes de terceros | Todo |

## 2. Estructura

```
src/
  <contexto>/                      un contexto delimitado: identity, catalog, orders...
    domain/
      entities/        user.entity.ts
      value-objects/   email.vo.ts  user-id.vo.ts  role.vo.ts
      errors/          invalid-email.error.ts
      users.repository.port.ts     interfaz + token del puerto de repositorio
    application/
      use-cases/       authenticate-staff.use-case.ts
      dtos/            authenticate-staff.command.ts  authenticate-staff.result.ts
      ports/           password-hasher.port.ts        (servicios externos)
    infrastructure/
      persistence/     user.orm-entity.ts  user.mapper.ts  typeorm-users.repository.ts
      http/            auth.controller.ts  login.request.dto.ts  login.response.dto.ts  roles.guard.ts
      cli/             assign-roles.ts
      external/        authentication-package.password-hasher.ts
    <contexto>.module.ts           raíz de composición
  shared/
    domain/            domain-error.ts  value-object.ts
    application/       use-case.ts
    infrastructure/    config/  database/  docs/  http/ (filtro de errores)
  <modulo-tecnico>/infrastructure/ health/ …   módulos sin dominio: solo infraestructura
```

> Los nombres de contexto (`identity`) y de archivo de arriba son **ejemplos**; los reales se
> crean en cada rebanada. Lo que sí es fijo es la estructura de capas y las reglas.

## 3. Puertos: interfaz + token

Las interfaces de TypeScript no existen en ejecución y Nest necesita un valor para inyectar, así que
cada puerto es una **interfaz y un token `Symbol` definidos juntos**:

```ts
// domain/users.repository.port.ts
export interface UsersRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
export const USERS_REPOSITORY = Symbol('UsersRepository');
```

- Los puertos de **repositorio** pertenecen al dominio. Los de **servicios externos** (hash de
  contraseña, emisor de tokens, correo, reloj) a la aplicación.
- La **implementación** vive en `infrastructure` y solo se enlaza en el módulo:

```ts
// identity.module.ts
providers: [{ provide: USERS_REPOSITORY, useClass: TypeOrmUsersRepository }, AuthenticateStaffUseCase]
```

- El caso de uso recibe el puerto con `@Inject(USERS_REPOSITORY)` y no sabe quién lo implementa.

## 4. Objetos de valor

Inmutables, **autovalidados al crearse** y comparados **por valor**. Lanzan un error de dominio si
el valor no es válido; no existe una instancia inválida.

```ts
export class Email extends ValueObject<{ value: string }> {
  static of(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (!value.includes('@')) throw new InvalidEmailError(raw);
    return new Email({ value });
  }
  get value(): string { return this.props.value; }
}
```

## 5. DTOs: uno por capa, sin mezclar

| Dónde | Qué | Cómo |
|---|---|---|
| `infrastructure/http` | DTO de **petición** y de **respuesta** HTTP | Esquema Zod (`StandardSchemaValidationPipe`); es el único lugar donde se valida formato de transporte |
| `application/dtos` | **Comando**, **consulta** y **resultado** del caso de uso | Clases o interfaces de solo lectura, sin decoradores de transporte |
| `domain` | Entidades y objetos de valor | Nunca DTOs |

Los **mappers** convierten en cada frontera (`LoginRequestDto → AuthenticateStaffCommand`,
`UserOrmEntity ↔ User`, `AuthenticateStaffResult → LoginResponseDto`). Las entidades de TypeORM son
modelos de persistencia: **nunca entran al dominio** y el dominio **nunca sale por HTTP**.

## 6. Casos de uso

Una clase por caso de uso, nombre `<Verbo><Objeto>UseCase`, método `execute(input): Promise<output>`
(contrato `UseCase<Input, Output>` de `shared/application`). Sin lógica de negocio en controladores,
guards ni CLI: esos solo traducen entrada y salida. Las reglas de negocio que no dependen de ningún
puerto (invariantes) van en el dominio.

## 7. Errores

Los errores de negocio extienden `DomainError` (`ValidationError`, `NotFoundError`,
`ConflictError`, `ForbiddenError`…). Un **único filtro** en `shared/infrastructure/http` los traduce a
HTTP (400, 404, 409, 403). Ninguna otra capa conoce códigos HTTP.

## 8. Pruebas

| Capa | Cómo se prueba |
|---|---|
| `domain` | Unitarias puras: sin Nest, sin base de datos, sin *mocks* |
| `application` | Unitarias con **fakes en memoria** de los puertos |
| `infrastructure` | e2e con Postgres real (`pnpm test:e2e`, base `clic_moda_test`) |
| Puertos | **Prueba de contrato**: una misma suite (`xxxContract(factory)`) se ejecuta contra el *fake* y contra la implementación real, de modo que el fake no puede divergir |

Los **fakes en memoria y las suites de contrato** viven en `src/<contexto>/testing/` (fuera de las
tres capas, por eso pueden importar de todas). La suite `xxxRepositoryContract(label, make)` se
registra desde un `*.spec.ts` (contra el fake) y desde un `test/**/*.e2e-spec.ts` (contra la
implementación real). Cada llamada a `make` debe devolver un repositorio **vacío**.

Las migraciones generadas con `pnpm migration:generate` hay que revisarlas y cambiar su primera
línea a `import type { MigrationInterface, QueryRunner } from 'typeorm'`: en las e2e se cargan
directamente desde TypeScript y los tipos no existen en ejecución.

## 9. Nombres de archivo

`*.entity.ts`, `*.vo.ts`, `*.error.ts` (dominio) · `*.port.ts` · `*.use-case.ts` ·
`*.command.ts` / `*.query.ts` / `*.result.ts` / `*.request.dto.ts` / `*.response.dto.ts` ·
`*.mapper.ts` · `*.orm-entity.ts` · `typeorm-*.repository.ts` · `*.controller.ts` · `*.guard.ts`.

## 10. Cómo se hace cumplir

`.oxlintrc.json` define reglas `no-restricted-imports` por carpeta: una violación (p. ej. `domain`
importando `@nestjs/common`, o `application` importando `infrastructure`) hace fallar `pnpm lint` y
el commit, nombrando archivo e import. Además todo change de OpenSpec que toque el API debe ubicar
cada pieza en su capa y cada tarea indica la suya.

## 11. Checklist para una funcionalidad nueva

1. ¿Es una regla de negocio? → `domain` (entidad, objeto de valor, invariante).
2. ¿Hace falta algo externo (base de datos, correo, reloj)? → define el **puerto** (interfaz + token).
3. Caso de uso en `application` con su comando y su resultado; pruébalo con fakes.
4. Adaptadores en `infrastructure` (repositorio, controlador, CLI) y **prueba de contrato** del puerto.
5. Enlaza todo en el módulo del contexto.
6. `pnpm lint && pnpm test && pnpm test:e2e` en `services/api`.

## 12. Patrón: cola de comandos de escritura (inventario)

Las escrituras de stock no cambian el stock en la petición: **entran a una cola** y un procesador las aplica en orden. Así nunca se vende de más aunque lleguen muchas a la vez.

- **Entrada:** `POST /inventory/commands` valida, guarda un comando `PENDING` y responde **202** con `Location` y el cuerpo del comando. La cabecera `Idempotency-Key` (opcional; el panel siempre la envía) hace que un reintento con la misma clave y el mismo contenido devuelva el mismo comando; con la misma clave y otro contenido, conflicto. Sin clave no hay idempotencia.
- **Estados:** `PENDING → APPLIED | REJECTED` (final e inmutable). Motivos de rechazo: `INSUFFICIENT_STOCK`, `BELOW_RESERVED`, `NO_CHANGE`, `PROCESSING_FAILED`.
- **Procesamiento:** `StockCommandProcessor` (sondeo `STOCK_QUEUE_POLL_MS`, se apaga con `STOCK_QUEUE_WORKER=off`) llama a `StockCommandProcessingPort.processNext`: **una transacción por comando** (reclamo con bloqueo consultivo y `SKIP LOCKED`, decisión de `StockPolicy`, actualización condicional del nivel, movimiento inmutable y estado final). Solo el comando más antiguo de cada variante puede procesarse; uno en espera de reintento bloquea a los posteriores de su variante.
- **Reintentos:** `attempts` se incrementa en su propia transacción antes de procesar; espera creciente, máximo 5 y luego `REJECTED` por `PROCESSING_FAILED`.
- **Salida:** el cliente consulta `GET /inventory/commands/:id` hasta un estado final (el panel lo hace y muestra "En cola" → "Listo" o el motivo del rechazo).
- **Capas:** `StockCommand`, `StockLevel`, `StockPolicy` y los objetos de valor en `domain`; casos de uso y puertos en `application`; adaptadores SQL, controladores y el procesador en `infrastructure`. Cada puerto tiene su prueba de contrato contra el fake y contra Postgres.

Para otra escritura crítica con el mismo riesgo de carreras (por ejemplo, reservas), reutiliza este patrón en vez de inventar otro.

## 13. Pruebas de flujos y de carga

- **Flujos** (`apps/admin/e2e`, `pnpm test:flows`): Playwright contra la API real con su propia base `clic_moda_flows`.
- **Carga** (`e2e/load`, `pnpm load`): k6 en Docker con cada servicio limitado a 0.5 CPU y 250 MB. Los umbrales (p95, p99, errores y que nunca se venda de más) hacen fallar la corrida; los números medidos están en el `design.md` de `catalog-warehouse`.

## 14. Patrón: imágenes (contexto `media`)

Una foto se sube una vez y la API genera, **al subirla**, los formatos que cada canal necesita (`link` 1200×630, `square`, `portrait`, `story`, y `thumb`, `card` y `logo` en WebP para la tienda; `logo` conserva la transparencia y entra completo en 640×320). No hay redimensionado bajo demanda.

- **Dominio:** `MediaAsset`, `MediaVariant`; objetos de valor `MediaFormat`, `FocalPoint`, `Framing`, `AltText`, `ImageDimensions`, `Revision`; `computeCrop` (función pura que el admin copia en `apps/admin/src/lib/crop.ts` con los mismos casos de prueba). Puerto `MediaAssetsRepository`.
- **Aplicación:** puertos `MediaStoragePort` (archivos) e `ImageProcessorPort` (sharp); casos de uso `UploadMedia`, `ChangeFocalPoint`, `DeleteMedia`, `ListMedia`, `GetMediaMaster`, `GetPublicVariant`, `PurgeObsoleteMedia`.
- **Infraestructura:** `TypeOrmMediaAssetsRepository`, `SharpImageProcessor`, `S3MediaStorage` (SeaweedFS) y `DiskMediaStorage` (respaldo), elegidos con `MEDIA_STORAGE=s3|disk`; controladores `MediaAdminController` (`/media`, solo Gerente) y `MediaPublicController` (`/public/media/:id/:formato-:rev.:ext`).
- **Privacidad:** se valida el tipo por los bytes, se corrige la orientación y se **quitan los metadatos (EXIF y GPS)**; la copia maestra nunca sale por la ruta pública.
- **Revisiones inmutables:** cambiar el enfoque crea la revisión siguiente; la anterior se conserva 30 días y se depura sola. Las variantes se sirven con `Cache-Control: public, max-age=31536000, immutable` y `ETag`.
- **Entrega:** navegador o rastreador → tienda `/m/*` (Astro) → API → SeaweedFS. SeaweedFS no publica puertos en producción (en desarrollo solo `127.0.0.1:10002`) y la API es su único cliente. Sin CORS y sin exponer el almacenamiento.
- **Pruebas:** cada puerto tiene su contrato (fake, disco y SeaweedFS real para el almacenamiento; fake y Postgres para el repositorio); e2e con la API real; flujos del admin con Playwright. Las e2e de la API guardan en disco; el contrato de S3 y una e2e completa usan SeaweedFS si hay claves en `.env`.
- **Variables:** `MEDIA_STORAGE`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `MEDIA_DISK_DIR` (API); `SITE_URL` (tienda, origen público para canonical y `og:image`; se lee al ejecutar) y `SHOP_URL` (admin, dominio de las vistas previas).

## 15. Patrón: configuración de la tienda (contexto `settings`)

- **Una sola fila** (`store_settings`, `id = 1`): `StoreSettingsRepository` solo tiene `find` y `save`; el `PUT` reemplaza todo.
- **Validación en el dominio:** cada campo es un objeto de valor (`BrandName`, `WhatsAppNumber`, `SocialUrl`, `BrandColor`…). `BrandColor` solo existe si cumple el contraste AA (`palette.ts`, función pura que el admin copia con los mismos casos fijos).
- **Errores por campo:** `UpdateSettingsUseCase` junta todos los campos inválidos (`IssueCollector`) y lanza `FieldValidationError`; el filtro global lo traduce a HTTP 422 con `issues: [{ field, message }]`.
- **Otro contexto por un puerto:** el logo y la imagen de compartir son solo identificadores; `MediaReferencesPort` (implementado en `infrastructure/media` sobre el repositorio de `media`) comprueba que existan y entrega la revisión para armar `/m/<id>/<formato>-<revisión>.<ext>`. `settings` no importa nada de `media` fuera de ese adaptador.
- **Lectura pública:** `@Public()` en el `GET`, `ETag` fuerte (huella del cuerpo) y `Cache-Control: public, max-age=15`; sin datos de pago ni privados.

## 16. Patrón: lectura pública del catálogo (contexto `catalog`)

- **Slug estable del producto:** se fija al registrar (`Slug.fromTextOrDefault` + `allocateSlug`, con sufijo `-2`, `-3`…) y no cambia al renombrar, para que los enlaces compartidos sigan valiendo. La migración rellena los existentes en TypeScript (autocontenida: una migración no importa código del proyecto) y una prueba comprueba que da lo mismo que el dominio.
- **Fotos en el agregado:** `Product.photos` (`ProductPhotos`: 0 a 8, sin repetidos, la primera es la principal) y la tabla `product_photos` sin clave foránea hacia `media_assets` (borrar una imagen no falla; el lector la omite). `PUT /catalog/products/:id/photos` solo Gerente.
- **Otro contexto por un puerto, sin N+1:** `MediaReferencesPort` (adaptador único `CatalogMediaReferencesAdapter` sobre `MediaAssetsRepository.findByIds`) resuelve las fotos de TODA la página con una consulta. Una e2e comprueba que el listado de 48 productos hace las mismas consultas que el de 3.
- **Modelo de lectura separado del de escritura:** `PublicCatalogReader` (SQL) devuelve `PublishedProduct`; los casos de uso `ListPublicCatalog`, `GetPublicProduct`, `ListPublicFilters` y `ListPublishedSlugs` arman un DTO público **por lista blanca** (una prueba compara las claves permitidas) para que un campo interno nuevo nunca se filtre. La definición de «publicado» es una sola y la usan el listado, el detalle, los filtros y el sitemap.
- **Disponibilidad como estado:** `availabilityOf` (`in_stock`, `low` de 1 a 3, `out`) y `aggregateAvailability` son funciones puras del dominio; nunca sale la cantidad.
- **Caché:** `sendCacheableJson` (`ETag` fuerte y `Cache-Control: public, max-age=15`) lo comparten la configuración y el catálogo. Peor caso entre un movimiento de stock y lo que ve el visitante: cola (200 ms) + 15 s de la API + 15 s de la tienda ≈ 30 s.

## 17. Patrón: tipos de movimiento y eventos (contexto `inventory` + `shared/infrastructure/events`)

- **La clase manda, el tipo explica.** `type` (`RECEIVE`, `WITHDRAW`, `ADJUST`) sigue siendo lo que usa `StockPolicy`; `type_code` apunta a `movement_types` (datos que el Gerente administra: el código sale del nombre y nunca cambia, la clase tampoco, no se borra, los de sistema no se desactivan; triggers lo garantizan en la base). Un comando acepta un tipo activo de su misma clase; uno ya aceptado se procesa aunque su tipo se desactive después.
- **Idempotencia compatible hacia atrás.** `fingerprintOf` solo agrega el código del tipo a la huella cuando NO es el de sistema de la clase; una prueba con la huella calculada antes del cambio lo vigila.
- **Saldo en el movimiento (kardex).** `balance_after` se escribe en `apply()` con el `on_hand` que devuelve la misma sentencia que cambia el stock; el último saldo de una variante es su stock. La migración rellena el histórico por `seq` y falla nombrando las variantes si no coincide.
- **Outbox transaccional.** `apply()` guarda el evento `stock.applied` (`StockApplied`, objeto de valor del dominio, sin motivo ni operador) con el MISMO `EntityManager` que cambia el stock y crea una entrega por cada suscriptor registrado en ese momento (`EventOutbox`, en `shared/infrastructure/events`). La aplicación de `inventory` no conoce las tablas.
- **Entregas.** `EventDispatcher` (apagable con `EVENT_DISPATCHER=off`) reclama una entrega con una sentencia ya confirmada que suma el intento y la reserva (`FOR UPDATE … SKIP LOCKED`), ejecuta al suscriptor fuera de esa transacción y la marca `executed`, la reprograma con espera creciente o, a los 5 intentos, la pasa a `needs_review`. Garantía: **al menos una vez**; un suscriptor debe ser idempotente por el id del evento. `seq` solo ordena dentro de una variante.
- **Suscriptores.** Se registran solos con `EventSubscriberRegistry.register(this)` desde el constructor de su proveedor. En este change no hay ninguno en producción; las pruebas usan uno con fallos inyectados.
- **Pruebas.** `EventDeliveriesPort` tiene suite de contrato (fake en memoria y Postgres); el contrato de procesamiento comprueba saldo y eventos con una secuencia mezclada; las migraciones se prueban con datos anteriores usando el ejecutor real de TypeORM (`undoLastMigration` por nombre).
