# Tasks

> Supuesto: ORM TypeORM 1.1.2 (ver `design.md`, Open Questions). Todas las tareas de código llevan sus pruebas dentro del mismo grupo; el último grupo es solo integración. El orquestador solo conoce `lint`, `test`, `build`, `format` y el escáner de secretos. **Las tareas de `services/api` indican su capa** (domain, application, infrastructure o shared) y siguen `services/api/ARCHITECTURE.md` (D14).

## 1. Retirada del prototipo

- [x] 1.1 Crear el tag local `demo-aprobada` sobre el commit actual; verificar que `git show demo-aprobada:apps/shop/package.json` imprime el archivo y que `git ls-remote --heads origin` lista `demo/movil-first` y `gh-pages`. No hacer `push` del tag sin aprobación del usuario.
- [x] 1.2 Eliminar el contenido de `apps/shop` con `git rm -r` (conservando la carpeta para el chore siguiente); verificar que `git status` solo muestra borrados bajo `apps/shop` y que `git show demo-aprobada:apps/shop/src/app/layout.tsx` sigue funcionando.

## 2. Chore inicial de `apps/shop` (Astro 7.4.8)

- [x] 2.1 Generar el proyecto con `create-astro` (`--template minimal --no-git --no-install --no-ai --yes`), fijar `astro@7.4.8`, `packageManager` pnpm 12.18.0 y `engines` Node ≥ 26; verificar con `pnpm --dir apps/shop dev` y una petición a `/` que responde 200.
- [x] 2.2 Añadir `@astrojs/node` 11.1.11 en modo servidor, `@tailwindcss/vite` 4.3.5 y TypeScript estricto; verificar que `pnpm --dir apps/shop build` genera la entrada de servidor y que una página con una clase de Tailwind aparece estilada en el CSS compilado.
- [x] 2.3 Configurar ESLint (`eslint-plugin-astro`), Prettier (`prettier-plugin-astro`) y Vitest con una prueba real, con `max-lines-per-function` (25, sin blancos ni comentarios) como `error`; verificar que `lint` falla con una función de 26 líneas de prueba, que pasa tras quitarla y que `pnpm --dir apps/shop test` pasa.

## 3. Chore inicial de `apps/admin` (Astro 7.4.8)

- [x] 3.1 Generar el proyecto igual que la shop, con `@astrojs/node`, `@tailwindcss/vite` y `@astrojs/react` 7.1.5 (React 19), y una isla de ejemplo; verificar con `build` y una prueba de componente de Vitest que la isla se renderiza.
- [x] 3.2 Configurar ESLint, Prettier, Vitest y la regla de 25 líneas como `error`; verificar `lint` y `test` en verde y que una función de 26 líneas de prueba falla el lint.

## 4. Chore inicial de `services/api` (NestJS 12.4.2) y estándar hexagonal

- [x] 4.1 Generar con `nest new -p pnpm --skip-git --strict` en un directorio temporal, traerlo a `services/api` conservando ESM, Vitest, oxlint y el `AGENTS.md` del template, fijar `@nestjs/*` en 12.4.2, `packageManager` pnpm 12.18.0 y `engines` Node ≥ 26, y añadir el script `format` y `prettier --check` dentro de `lint`; verificar `pnpm --dir services/api build`, `test` y una petición al servidor de desarrollo.
- [x] 4.2 Configurar `max-lines-per-function` (25, `skipBlankLines` y `skipComments`) como `error` en `.oxlintrc.json`; verificar que una función de 26 líneas de prueba falla `lint`, que pasa sin ella y que `pnpm verify:projects` marca `services/api` como ✔.
- [x] 4.3 Añadir `@nestjs/config` con validación de variables con Zod, `GET /health` con `@nestjs/terminus` 12.1.0 y la documentación OpenAPI en `/docs` (`@nestjs/swagger` 12.1.1); verificar con una prueba unitaria y una e2e del endpoint de salud, y que `/docs` responde 200.
- [x] 4.4 *(documentación)* Escribir `services/api/ARCHITECTURE.md` con el estándar hexagonal de D14 (estructura por contexto, regla de dependencia, pureza por capa, puertos como interfaz más token, objetos de valor, DTOs por capa, mappers, casos de uso, errores de dominio, pruebas por capa y de contrato, nombres de archivo y excepción de módulos técnicos) con un ejemplo mínimo completo, y enlazarlo desde el `AGENTS.md` del API; verificar que cada ruta de carpeta citada coincide con lo implementado o está marcada como ejemplo.
- [x] 4.5 *(lint)* Hacer cumplir los límites de capa en `.oxlintrc.json` con `overrides` por carpeta y `no-restricted-imports`: `domain` sin frameworks, Zod, ORMs ni otras capas; `application` solo con `@nestjs/common` y sin infraestructura, TypeORM ni Express; verificar con archivos de muestra temporales que cada violación falla `lint` nombrando archivo e import, que las dependencias permitidas pasan y que `pnpm verify:projects` sigue en ✔.
- [x] 4.6 *(shared/infrastructure)* Reubicar lo existente según el estándar: `config`, `database` y `docs` a `src/shared/infrastructure/`, y `health` a `src/health/infrastructure/http/` (módulo técnico), ajustando imports, el `DataSource`, los scripts de migración, los globs de entidades y migraciones, y las pruebas; verificar que lint, pruebas unitarias, e2e y `migration:run` sobre ambas bases siguen pasando sin cambio de comportamiento.
- [ ] 4.7 *(shared/domain, shared/application, shared/infrastructure)* Crear el núcleo compartido: `DomainError` con sus subtipos (`ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`) y la base `ValueObject` con igualdad por valor en `shared/domain`, la interfaz `UseCase<Input, Output>` en `shared/application`, y un único filtro HTTP en `shared/infrastructure/http` que traduce los errores de dominio a 400, 404, 409 y 403; verificar con pruebas unitarias puras del dominio y de la aplicación del filtro, sin base de datos.

## 5. Base de datos y pruebas e2e

- [x] 5.1 Crear `docker-compose.yml` con PostgreSQL (versión mayor fijada tras `docker pull`) y un script que crea `clic_moda` y `clic_moda_test`, más `.env.example`; verificar con `docker compose up -d` y `pg_isready` que ambas bases existen.
- [x] 5.2 Configurar TypeORM 1.1.2 + `@nestjs/typeorm` 12.0.3 con `DataSource` para la CLI, `synchronize: false` y scripts de migración; verificar que `migration:run` y `migration:revert` funcionan sobre ambas bases.
- [x] 5.3 Crear el soporte de pruebas e2e (arranque de la base de prueba, migraciones y limpieza de tablas entre casos); verificar que `pnpm --dir services/api test:e2e` ejecuta la prueba de salud contra Postgres real.

## 6. Acceso del personal (contexto `identity`, por capas)

- [ ] 6.1 *(domain)* Crear en `identity/domain` los objetos de valor `UserId`, `Email` (normalizado y validado), `Role` y `PasswordHash`, la entidad `User` con varios roles y el puerto `UsersRepository` (interfaz más token); verificar con pruebas unitarias puras de email inválido, igualdad por valor, usuario con dos roles y duplicados de rol.
- [ ] 6.2 *(infrastructure/persistence)* Crear las entidades TypeORM `users` (email `citext` único, `email_verified`, hash nulo permitido) y `user_roles`, su *mapper* hacia el dominio, `TypeOrmUsersRepository` y la migración; verificar con una **prueba de contrato** `usersRepositoryContract` ejecutada contra un *fake* en memoria y contra la implementación con Postgres real (creación, email duplicado, usuario con dos roles).
- [ ] 6.3 *(application)* Definir los puertos `PasswordHasherPort` y `AccessTokenIssuerPort` y el caso de uso `AuthenticateStaffUseCase` con sus DTOs `AuthenticateStaffCommand` y `AuthenticateStaffResult` (mismo error para email desconocido o contraseña errónea; credenciales con los roles y vigencia ≤ 8 h); verificar con pruebas unitarias con *fakes* de los puertos.
- [ ] 6.4 *(infrastructure/external)* Implementar los puertos con `@nestjs/authentication` 0.1.5 (versión exacta: `PasswordHasher`, tokens de acceso con refresh rotativo, techo de 8 horas y `TypeOrmAuthenticationStore`) y su migración de 8 tablas revisada; verificar que pasan las pruebas de contrato del almacén (`authenticationStoreContract()`) contra Postgres y que sustituir el adaptador no toca `application` ni `domain`.
- [ ] 6.5 *(application + infrastructure/cli)* Crear `SeedManagerUseCase` y el comando `seed:manager` (idempotente; falla nombrando `INITIAL_MANAGER_EMAIL` o `INITIAL_MANAGER_PASSWORD` si faltan y no crea nada); verificar con pruebas unitarias del caso de uso y e2e de primer arranque, ejecución repetida y configuración ausente.
- [ ] 6.6 *(infrastructure/http)* Crear `POST /auth/login` con su DTO de petición (Zod) y de respuesta, y el límite de intentos con `@nestjs/throttler` 6.7.1 (clave email + IP, 5 por 15 minutos, sin distinguir el resultado); verificar con e2e de inicio válido, de fallo con la misma respuesta para email desconocido y contraseña errónea, y de que el sexto intento recibe "demasiadas peticiones" incluso con la contraseña correcta sin afectar a otro email.
- [ ] 6.7 *(infrastructure/http)* Crear `AuthGuard`, `RolesGuard` y `@Roles()` (acepta al usuario si **alguno** de sus roles está permitido) y una ruta protegida de ejemplo; verificar con e2e de sin credenciales, credenciales vencidas, ningún rol permitido (403), un rol permitido y un usuario con varios roles.
- [ ] 6.8 *(infrastructure)* Comprobar que ninguna respuesta ni línea de log contiene contraseñas o hashes; verificar con una prueba que inspecciona las respuestas de inicio de sesión y los logs capturados.
- [ ] 6.9 *(domain + application + infrastructure/persistence)* Implementar `AssignRolesUseCase` con la invariante de dominio "siempre queda un Gerente", la búsqueda de usuarios por parte del nombre o del correo, el puerto `RoleEventsRepository` y su implementación TypeORM sobre `user_role_events` (usuario, roles antes y después, instante y usuario del sistema operativo) con su migración; verificar con pruebas unitarias del dominio y del caso de uso con *fakes*, la prueba de contrato del repositorio y una e2e de asignación de varios roles, del registro y de la negativa a quitar el último Gerente.
- [ ] 6.10 *(infrastructure/cli)* Crear el comando `identity/infrastructure/cli/assign-roles.ts` como adaptador de entrada de `AssignRolesUseCase`, con la pantalla interactiva (`@inquirer/prompts` 8.7.5: búsqueda, confirmación y selección múltiple) y el modo `--email`, `--roles` y `--yes`; verificar que tras `nest build` funciona con `node dist/identity/infrastructure/cli/assign-roles.js` sin pnpm ni npx, que sin terminal y sin opciones falla con un mensaje claro, que declinar la confirmación no cambia nada y probando a mano el flujo interactivo completo.

## 7. Puertas de calidad y documentación

- [ ] 7.1 Completar los scripts de la raíz (`test:e2e` y `check:full`; ya existen `dev:*`, `test:all`, `verify:projects` y `check`) y confirmar el hook; verificar que con un test roto a propósito `sh .husky/pre-commit` falla nombrando el subproyecto y el paso.
- [ ] 7.2 Actualizar `.secretlintignore` para `dist`, `.astro` y artefactos nuevos y comprobar que el escáner sigue detectando un token falso en los tres proyectos; verificar con `pnpm secrets:scan` y un archivo de prueba temporal.
- [ ] 7.3 Crear un Dockerfile por proyecto (`node:26-alpine`, pnpm) sin dependencias de desarrollo en la imagen final; verificar con `docker build` del de `services/api` y de uno de los Astro.
- [ ] 7.4 Actualizar README (estructura, comandos, requisitos, Docker y su limitación con la unidad `J:`, contrato de proyectos y enlace a `ARCHITECTURE.md`), los `.env.example` y `docs/database.dbml` (usuarios, roles, eventos y tablas de autenticación), y volver a ejecutar `ux-init` en modo sync; verificar ejecutando los comandos del README tal cual y que `detect.mjs` lista shop y admin.

## 8. Auditoría del prototipo

- [ ] 8.1 Levantar el prototipo desde el tag con `git worktree add` fuera del repo y crear `docs/prototipo/auditoria.md` con el inventario de rutas, pantallas y flujos; verificar que cada ruta bajo `src/app` del tag aparece en la tabla.
- [ ] 8.2 Completar para cada funcionalidad la decisión (conservar, mejorar, descartar), el motivo, la rebanada destino y las preguntas para el cliente; verificar que el usuario la revisa y la aprueba o corrige.

## 9. Integración

- [ ] 9.1 Ejecutar `pnpm check:full` con Docker levantado y comprobar que lint (incluidos los límites de capa), pruebas unitarias, e2e y build pasan en los tres proyectos.
- [ ] 9.2 Verificar el criterio de la hoja de ruta: `dev:api`, `dev:admin` y `dev:shop` levantan, y un Gerente inicia sesión contra la API y accede a una ruta restringida mientras otro rol recibe 403.

## Workflow follow-up

- Hacer `push` del tag `demo-aprobada` solo si el usuario lo aprueba.
- Crear el change `account-identity` (login con correo, Google y TikTok y unificación de cuentas por correo verificado; TikTok no entrega correo, hay que verificarlo por enlace mágico). Requiere decidir el proveedor de correo y registrar las apps de Google y de TikTok. Se construye ya sobre el estándar hexagonal.
- Reescribir `store-branding-config` sobre esta base (Astro + NestJS, API por capas) como rebanada 1.
- Marcar el Paso 0 en `openspec/ROADMAP.md` y archivar el change tras la revisión.
