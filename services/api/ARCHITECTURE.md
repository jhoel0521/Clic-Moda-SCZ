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
