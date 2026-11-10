# Design

## Context

Ver `proposal.md` (Why) y `specs/` (requisitos). Estado y datos verificados el 2026-11-10:

- **Repo**: monorepo pnpm sin workspace compartido. `apps/shop` y `apps/admin` ya son proyectos Astro 7.4.8 (commits `7a55149` y `2550864`); `services/api` sigue siendo un placeholder. El hook de commit corre `verify:projects`, secretlint, `lint:all`, `test:all` y `build:all`.
- **Versiones** (npm): NestJS `12.4.2` (CLI `12.0.12`), `@nestjs/typeorm 12.0.3` (acepta `typeorm ^1.0.0-dev`, por tanto 1.1.2), `@nestjs/swagger 12.1.1`, `@nestjs/config 12.1.1`, `@nestjs/terminus 12.1.0`, `@nestjs/throttler 6.7.1`, **`@nestjs/authentication 0.1.5`** y **`@nestjs/authorization 0.1.3`** (oficiales, aún pre-1.0), TypeORM `1.1.2`, `pg 8.23.1`, Vitest `5.1.0` en Astro y `^4.1.2` en el template de Nest.
- **El generador de Nest 12 produce** (verificado): proyecto **solo ESM** (`"type": "module"`, imports con `.js`, sin `__dirname`), pruebas con **Vitest** (no Jest), lint con **oxlint** type-aware (no ESLint), un `AGENTS.md` con guía para agentes y la lista de paquetes oficiales que conviene usar antes de escribir código propio. oxlint soporta `max-lines-per-function` con `skipBlankLines` y `skipComments` (probado: cuenta 28 líneas donde corresponde).
- **`@nestjs/authentication`** (documentación oficial): contraseña con `scrypt` (`PasswordHasher`), Google por OIDC (`oidc.providers`), enlaces mágicos, verificación de correo y recuperación de contraseña, tokens de acceso JWT con refresh rotativo (`TokenService`) y sesión por cookie. **No vincula cuentas entre proveedores** (eso lo decide la aplicación con `OidcAccountResolver`), no incluye límite de intentos (lo hace `@nestjs/throttler`) ni roles (son datos de la app). En producción exige un almacén persistente: ofrece `TypeOrmAuthenticationStore` con 8 tablas. Para enviar correos hace falta un transporte real (`LogMailTransport` solo sirve en desarrollo).
- **TikTok** (documentación oficial del endpoint de usuario): devuelve `open_id`, `union_id`, nombre y fotos; **no tiene ningún campo de correo ni de teléfono**.
- **Astro no tiene canal LTS** en npm (solo `latest`, `beta`, `rc`, `legacy`). **Prisma**: su tag `latest` es un RC (8.0.0-rc.33), el estable es 7.10.1.
- **Entorno**: Windows 11, Node 26.13.0, pnpm 12.18.0, Docker 29.8.1, sin PostgreSQL local.

## Goals / Non-Goals

**Goals:**
- Tres proyectos que arrancan, compilan, pasan lint y tienen pruebas reales.
- Un contrato mínimo y **agnóstico de herramientas**: el orquestador solo llama a `lint`, `test`, `build`, `format` y al escáner de secretos.
- Acceso del personal funcionando de punta a punta contra Postgres real, **preparado para añadir proveedores de identidad sin rehacer el modelo**.
- Poder recuperar cualquier pantalla del prototipo sin conservarlo en el árbol de trabajo.

**Non-Goals:**
- Login con Google y TikTok y la unificación de cuentas por correo (change `account-identity`, ver D12).
- Funcionalidad de negocio, auth de clientes, despliegue, CI hospedada.
- Portar código del prototipo.

## Decisions

**D1. Orden estricto de la retirada del prototipo.** Tag local `demo-aprobada` → verificar ramas de demo → `git rm` de `apps/shop`. El tag es local hasta que el usuario apruebe el `push`. Se consulta con `git show demo-aprobada:...` o con `git worktree add` fuera del repo. *(Hecho: tareas 1.1 y 1.2.)*

**D2. Chore de Astro con generador y adaptador Node.** `create-astro` con `--template minimal --no-git --no-install --no-ai --yes`, `@astrojs/node` en modo servidor (SSR) y `@tailwindcss/vite`; admin añade `@astrojs/react`. TypeScript 6.0.3 (por el límite `<6.1.0` de `typescript-eslint`). `lint` incluye `prettier --check` y `astro check`, porque el build de Astro no revisa tipos. *(Hecho en shop y admin.)*

**D3. Chore de Nest con generador, respetando sus valores por defecto.** `nest new -p pnpm --skip-git --strict` en un directorio temporal y se trae a `services/api`. Se conservan ESM, **Vitest** (el mismo que Astro, lo que unifica) y **oxlint** type-aware. Validación de entrada con **Zod** mediante `StandardSchemaValidationPipe` (sin decoradores ni `class-validator`). Se conserva el `AGENTS.md` del template. *Alternativas descartadas*: Jest (ya no es el default), ESLint solo para la API (el contrato lo hace innecesario).

**D4. PostgreSQL en Docker, dos bases.** `services/api/docker-compose.yml` con la imagen fijada por versión mayor (se comprueba con `docker pull`) y un script que crea `clic_moda` y `clic_moda_test`. Las e2e usan la segunda, aplican migraciones y limpian tablas entre casos.

**D5. TypeORM con migraciones.** `synchronize: false`, `DataSource` propio para la CLI, entidades en `snake_case`. Las 8 tablas del almacén de autenticación (`sessions`, `refresh_tokens`, `mfa_authenticators`, `mfa_recovery_codes`, `mfa_failures`, `magic_links`, `oidc_logins`, `email_tokens`) se generan con `migration:generate` y se revisan antes de aplicarlas.

**D6. Autenticación con el paquete oficial.** `@nestjs/authentication` (versión **exacta**, es 0.1.x) con inicio de sesión por contraseña, `PasswordHasher` (scrypt) y `TypeOrmAuthenticationStore`. El admin (Astro SSR) usa **tokens de acceso con refresh rotativo** desde su servidor y los guarda en una cookie `httpOnly` propia, sin exponerlos a JavaScript del navegador. El techo de 8 horas del spec se configura en el paquete (`session`/`accessToken`) y, si no hay opción que lo garantice, se hace cumplir con una comprobación propia. Se ejecutan las pruebas de contrato del almacén (`authenticationStoreContract()`) contra Postgres. *Alternativa descartada*: JWT y hash propios (más código que mantener y probar).

**D7. Roles múltiples con guard propio.** El paquete no impone roles. Un usuario puede tener **varios**: tabla `user_roles(user_id, role)` con clave primaria compuesta y `Role` (`GERENTE`, `DESPACHO`, `ATENCION`) como enumeración. `RolesGuard` + `@Roles(...)` aceptan al usuario si **al menos uno** de sus roles está permitido. *Alternativa descartada*: columna de arreglo en `users` (más corta, pero no admite auditoría fina ni roles con alcance más adelante). `@nestjs/authorization` (0.1.3) queda para evaluarse en una rebanada con permisos más finos.

**D8. Límite de intentos con `@nestjs/throttler`.** Receta oficial de límite por cuenta: clave email + IP, 5 intentos por 15 minutos, **sin distinguir el resultado** (así cambió el spec: es más simple y más seguro que contar solo fallos). Almacenamiento en memoria mientras haya una sola instancia; Redis cuando haya varias.

**D9. Usuario inicial por comando idempotente.** `seed:manager` lee `INITIAL_MANAGER_EMAIL` e `INITIAL_MANAGER_PASSWORD`, falla nombrándolas si faltan y no hace nada si ya existe un Gerente. Usa `PasswordHasher`. Los valores viven en `.env` (ignorado por git).

**D10. Contrato agnóstico y puertas de calidad.** Cada proyecto expone los scripts `lint`, `test`, `build` y `format`, y la regla `max-lines-per-function` (25, sin blancos ni comentarios) como `error` en **su** linter (ESLint en Astro, oxlint en la API). `scripts/verify-projects.mjs` lo verifica sin conocer el motor. El hook ejecuta: `verify:projects` → secretlint sobre lo staged → `lint:all` → `test:all` → `build:all`. `lint-staged` solo conoce secretlint. Las e2e (Docker y navegador) quedan en `test:e2e` / `check:full`, fuera del hook. *(Hecho en los commits `56787c9` y `e88a1c0`.)*

**D11. Auditoría del prototipo y `.ux/`.** `docs/prototipo/auditoria.md` (qué hace, decisión, motivo, rebanada destino). `ux-init` en modo sync al terminar; `tokens.json` se conserva como referencia hasta que la rebanada 1 defina el tema real.

**D12. Modelo de usuario listo para múltiples identidades.** La tabla `users` guarda `email` único, `email_verified` y el hash de contraseña (puede ser nulo); los roles viven en `user_roles` (D7). No se crea aún la tabla de identidades externas; se hará en `account-identity`. **Restricción ya conocida**: TikTok no entrega correo, de modo que ese change tendrá que verificar un correo por enlace mágico antes de vincular o crear la cuenta, y solo vincular cuando el correo esté verificado en ambos lados (la política que el propio paquete recomienda).

**D13. Comando para asignar roles en casos extremos.** Archivo `src/cli/assign-roles.ts`, compilado por `nest build` a `dist/cli/assign-roles.js`. Se ejecuta con **`node dist/cli/assign-roles.js`** (no necesita npx, pnpm ni bun en producción; en una imagen Docker: `docker exec -it <contenedor> node dist/cli/assign-roles.js`). Arranca la aplicación Nest como contexto independiente (`createApplicationContext`, sin servidor HTTP) para reutilizar `UsersRepository` y la conexión a la base, de modo que no hay lógica duplicada. Pantalla interactiva con **`@inquirer/prompts` 8.7.5** (verificado: ESM, Node ≥ 23.5, incluye `search` con filtrado en vivo, `confirm` y `checkbox` de selección múltiple). Flujo: buscar → elegir usuario → **confirmar** → marcar roles → resumen y confirmación final → aplicar. Modo no interactivo con opciones (`--email`, `--roles`, `--yes`) para automatizar y para las pruebas; sin terminal y sin opciones falla con un mensaje claro. La lógica (búsqueda, asignación, protección del último Gerente, auditoría) vive en un servicio probado por separado, y el archivo CLI solo contiene la interfaz. Cada cambio se registra en la tabla `user_role_events` (usuario, roles antes y después, instante y usuario del sistema operativo). Se rechaza dejar el sistema sin ningún Gerente. *Alternativas descartadas*: `nest-commander` (otra dependencia para algo que Nest ya permite) y un endpoint HTTP (justo se quiere una vía que no dependa de la API ni de credenciales web).

## Risks / Trade-offs

- **El comando de roles es una vía privilegiada**: quien lo ejecuta ya tiene acceso al servidor y a las credenciales de la base de datos. Por eso exige confirmación explícita, deja registro y protege al último Gerente; no se expone por HTTP.
- **Necesita una terminal interactiva** para la pantalla; sin ella falla de forma clara y ofrece el modo con opciones.
- **Paquetes de autenticación pre-1.0 (0.1.x)** → versión exacta, pruebas de contrato del almacén, revisar el changelog antes de actualizar; si fallan, el plan B es D6 anterior (JWT propio).
- **Versiones mayores muy recientes** (Nest 12, TypeORM 1.x, Astro 7) → verificar que cada generador compila antes de seguir; fijar versiones exactas.
- **Correo saliente**: verificación de correo, recuperación y enlaces mágicos necesitan un proveedor real; en desarrollo se usa el transporte de log → decisión pendiente para producción.
- **Throttler en memoria** → se reinicia con el proceso y no se comparte entre instancias; aceptable con una instancia, Redis después.
- **Sin tienda funcional durante la reconstrucción** → la demo publicada y el tag cubren las presentaciones.
- **Hook más lento** → solo unitarias; si molesta, mover `test:all` a `pre-push`.
- **Docker obligatorio para e2e** → documentado; sin Docker solo se pierden las e2e.

## Migration Plan

1. Retirada y chores de shop y admin *(hecho)* → 2. chore de la API → 3. Postgres y migraciones → 4. autenticación, límite de intentos y roles → 5. puertas de calidad restantes, Dockerfiles y documentación → 6. auditoría del prototipo.
*Rollback*: `git checkout demo-aprobada -- apps/shop` restaura la shop Next.js. No hay datos que migrar.

## Open Questions

- Proveedor de correo para producción (Resend, SMTP, otro) y desde qué dominio.
- Confirmar TypeORM frente a Prisma 7.10.1 fijada.
- Versión mayor de PostgreSQL de la imagen (se fija al implementar, tras `docker pull`).
- ¿Se hace `push` del tag `demo-aprobada` al remoto?
