# Tasks

> Supuesto: ORM TypeORM 1.1.2 (ver `design.md`, Open Questions). Todas las tareas de código llevan sus pruebas dentro del mismo grupo; el último grupo es solo integración. El orquestador solo conoce `lint`, `test`, `build`, `format` y el escáner de secretos.

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

## 4. Chore inicial de `services/api` (NestJS 12.4.2)

- [x] 4.1 Generar con `nest new -p pnpm --skip-git --strict` en un directorio temporal, traerlo a `services/api` conservando ESM, Vitest, oxlint y el `AGENTS.md` del template, fijar `@nestjs/*` en 12.4.2, `packageManager` pnpm 12.18.0 y `engines` Node ≥ 26, y añadir el script `format` y `prettier --check` dentro de `lint`; verificar `pnpm --dir services/api build`, `test` y una petición al servidor de desarrollo.
- [x] 4.2 Configurar `max-lines-per-function` (25, `skipBlankLines` y `skipComments`) como `error` en `.oxlintrc.json`; verificar que una función de 26 líneas de prueba falla `lint`, que pasa sin ella y que `pnpm verify:projects` marca `services/api` como ✔.
- [x] 4.3 Añadir `@nestjs/config` con validación de variables con Zod, `GET /health` con `@nestjs/terminus` 12.1.0 y la documentación OpenAPI en `/docs` (`@nestjs/swagger` 12.1.1); verificar con una prueba unitaria y una e2e del endpoint de salud, y que `/docs` responde 200.

## 5. Base de datos y pruebas e2e

- [ ] 5.1 Crear `docker-compose.yml` con PostgreSQL (versión mayor fijada tras `docker pull`) y un script que crea `clic_moda` y `clic_moda_test`, más `.env.example`; verificar con `docker compose up -d` y `pg_isready` que ambas bases existen.
- [ ] 5.2 Configurar TypeORM 1.1.2 + `@nestjs/typeorm` 12.0.3 con `DataSource` para la CLI, `synchronize: false` y scripts de migración; verificar que `migration:run` y `migration:revert` funcionan sobre ambas bases.
- [ ] 5.3 Crear el soporte de pruebas e2e (arranque de la base de prueba, migraciones y limpieza de tablas entre casos); verificar que `pnpm --dir services/api test:e2e` ejecuta la prueba de salud contra Postgres real.

## 6. Acceso del personal (paquetes oficiales de Nest)

- [ ] 6.1 Crear la entidad `users` (email único, `email_verified`, hash de contraseña nulo permitido), la tabla `user_roles` (un usuario con varios roles) y su `UsersRepository`, con la migración correspondiente; verificar con pruebas de creación, de email duplicado, de usuario con dos roles y de lectura de roles.
- [ ] 6.2 Configurar `@nestjs/authentication` 0.1.5 (versión exacta) con inicio de sesión por contraseña, tokens de acceso con refresh rotativo, techo de sesión de 8 horas y `TypeOrmAuthenticationStore`, generando y revisando la migración de sus 8 tablas; verificar que pasan las pruebas de contrato del almacén (`authenticationStoreContract()`) contra Postgres y con una e2e de inicio de sesión válido (credenciales con el rol, vigencia ≤ 8 h) y de fallo con la misma respuesta para email desconocido y contraseña errónea.
- [ ] 6.3 Implementar el comando idempotente `seed:manager` con `PasswordHasher` (falla nombrando `INITIAL_MANAGER_EMAIL` o `INITIAL_MANAGER_PASSWORD` si faltan y no crea nada); verificar con pruebas de primer arranque, de ejecución repetida y de configuración ausente.
- [ ] 6.4 Aplicar `@nestjs/throttler` 6.7.1 al inicio de sesión (clave email + IP, 5 intentos por 15 minutos, sin distinguir el resultado); verificar con una e2e que el sexto intento recibe "demasiadas peticiones" incluso con la contraseña correcta y que otro email no se ve afectado.
- [ ] 6.5 Implementar el `RolesGuard` y el decorador `@Roles()` (acepta al usuario si **alguno** de sus roles está permitido) con los roles Gerente, Despacho y Atención, y una ruta protegida de ejemplo; verificar con pruebas e2e de sin credenciales, credenciales vencidas, ningún rol permitido (403), un rol permitido y un usuario con varios roles.
- [ ] 6.6 Comprobar que ninguna respuesta ni línea de log contiene contraseñas o hashes; verificar con una prueba que inspecciona las respuestas de inicio de sesión y los logs capturados.
- [ ] 6.7 Implementar el servicio de asignación de roles (búsqueda de usuarios por parte del nombre o del correo, asignación que reemplaza el conjunto de roles, registro en `user_role_events` con el usuario del sistema operativo y rechazo de dejar el sistema sin Gerente), con su migración; verificar con pruebas unitarias y e2e de asignación de varios roles, del registro y de la negativa a quitar el último Gerente.
- [ ] 6.8 Crear el comando `src/cli/assign-roles.ts` con la pantalla interactiva (`@inquirer/prompts` 8.7.5: búsqueda, confirmación y selección múltiple de roles) y el modo con opciones `--email`, `--roles` y `--yes`; verificar que tras `nest build` funciona con `node dist/cli/assign-roles.js` sin pnpm ni npx, que sin terminal y sin opciones falla con un mensaje claro, que declinar la confirmación no cambia nada y probando a mano el flujo interactivo completo.

## 7. Puertas de calidad y documentación

- [ ] 7.1 Completar los scripts de la raíz (`test:e2e` y `check:full`; ya existen `dev:*`, `test:all`, `verify:projects` y `check`) y confirmar el hook; verificar que con un test roto a propósito `sh .husky/pre-commit` falla nombrando el subproyecto y el paso.
- [ ] 7.2 Actualizar `.secretlintignore` para `dist`, `.astro` y artefactos nuevos y comprobar que el escáner sigue detectando un token falso en los tres proyectos; verificar con `pnpm secrets:scan` y un archivo de prueba temporal.
- [ ] 7.3 Crear un Dockerfile por proyecto (`node:26-alpine`, pnpm) sin dependencias de desarrollo en la imagen final; verificar con `docker build` del de `services/api` y de uno de los Astro.
- [ ] 7.4 Actualizar README (estructura, comandos, requisitos, Docker, contrato de proyectos), los `.env.example` y `docs/database.dbml` (usuarios y tablas de autenticación), y volver a ejecutar `ux-init` en modo sync; verificar ejecutando los comandos del README tal cual y que `detect.mjs` lista shop y admin.

## 8. Auditoría del prototipo

- [ ] 8.1 Levantar el prototipo desde el tag con `git worktree add` fuera del repo y crear `docs/prototipo/auditoria.md` con el inventario de rutas, pantallas y flujos; verificar que cada ruta bajo `src/app` del tag aparece en la tabla.
- [ ] 8.2 Completar para cada funcionalidad la decisión (conservar, mejorar, descartar), el motivo, la rebanada destino y las preguntas para el cliente; verificar que el usuario la revisa y la aprueba o corrige.

## 9. Integración

- [ ] 9.1 Ejecutar `pnpm check:full` con Docker levantado y comprobar que lint, pruebas unitarias, e2e y build pasan en los tres proyectos.
- [ ] 9.2 Verificar el criterio de la hoja de ruta: `dev:api`, `dev:admin` y `dev:shop` levantan, y un Gerente inicia sesión contra la API y accede a una ruta restringida mientras otro rol recibe 403.

## Workflow follow-up

- Hacer `push` del tag `demo-aprobada` solo si el usuario lo aprueba.
- Crear el change `account-identity` (login con correo, Google y TikTok y unificación de cuentas por correo verificado; TikTok no entrega correo, hay que verificarlo por enlace mágico). Requiere decidir el proveedor de correo y registrar las apps de Google y de TikTok.
- Reescribir `store-branding-config` sobre esta base (Astro + NestJS) como rebanada 1.
- Marcar el Paso 0 en `openspec/ROADMAP.md` y archivar el change tras la revisión.
