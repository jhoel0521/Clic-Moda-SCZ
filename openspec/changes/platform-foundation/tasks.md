# Tasks

> Supuesto: ORM TypeORM 1.1.2 (ver `design.md`, Open Questions). Todas las tareas de código llevan sus pruebas dentro del mismo grupo; el último grupo es solo integración.

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

- [ ] 4.1 Generar con `nest new -p pnpm --skip-git --strict` en `services/api`, fijar `@nestjs/*` en 12.4.2, `packageManager` pnpm 12.18.0 y `engines` Node ≥ 26, y definir los scripts `dev`, `build`, `lint`, `test`, `test:e2e`; verificar `pnpm --dir services/api build`, `test` y una petición al servidor de desarrollo.
- [ ] 4.2 Configurar la regla `max-lines-per-function` (25) como `error` y Prettier; verificar que una función de 26 líneas de prueba falla el lint y que `lint` queda en verde sin ella.
- [ ] 4.3 Añadir `@nestjs/config` con validación de variables, el endpoint `GET /health` y la documentación OpenAPI en `/docs` (`@nestjs/swagger` 12.1.1); verificar con una prueba unitaria y una e2e del endpoint de salud, y que `/docs` responde 200.

## 5. Base de datos y pruebas e2e

- [ ] 5.1 Crear `docker-compose.yml` con PostgreSQL (versión mayor fijada tras `docker pull`) y un script que crea `clic_moda` y `clic_moda_test`, más `.env.example`; verificar con `docker compose up -d` y `pg_isready` que ambas bases existen.
- [ ] 5.2 Configurar TypeORM 1.1.2 + `@nestjs/typeorm` 12.0.3 con `DataSource` para la CLI, `synchronize: false` y scripts de migración; crear la migración inicial de `staff_users` y `login_attempts`; verificar que `migration:run` y `migration:revert` funcionan sobre ambas bases.
- [ ] 5.3 Crear el soporte de pruebas e2e (arranque de la base de prueba, migraciones y limpieza de tablas entre casos); verificar que `pnpm --dir services/api test:e2e` ejecuta la prueba de salud contra Postgres real.

## 6. Acceso del personal

- [ ] 6.1 Implementar el hash de contraseñas con `crypto.scrypt` (sal por usuario, `timingSafeEqual`); verificar con pruebas unitarias que dos cuentas con la misma contraseña tienen hashes distintos y que la verificación acepta la correcta y rechaza la errónea.
- [ ] 6.2 Crear la entidad de personal y el comando idempotente `seed:manager` (falla nombrando `INITIAL_MANAGER_EMAIL` o `INITIAL_MANAGER_PASSWORD` si faltan y no crea nada); verificar con pruebas de primer arranque, de ejecución repetida y de configuración ausente.
- [ ] 6.3 Implementar `POST /auth/login` con token de 8 h que lleva `sub` y `role`, y respuesta genérica idéntica para email desconocido o contraseña errónea; verificar con pruebas e2e de credenciales válidas y de ambos fallos comparando las respuestas.
- [ ] 6.4 Implementar el límite de intentos (5 fallos en 15 min bloquean incluso con la contraseña correcta; un acceso correcto reinicia el contador, y los emails inexistentes también cuentan); verificar con pruebas unitarias con reloj simulado y una e2e.
- [ ] 6.5 Implementar `AuthGuard`, `RolesGuard` y el decorador `@Roles()` con los roles Gerente, Despacho y Atención, y una ruta protegida de ejemplo; verificar con pruebas e2e de sin token, token vencido, rol insuficiente (403) y rol permitido.
- [ ] 6.6 Comprobar que ninguna respuesta ni línea de log contiene contraseñas o hashes; verificar con una prueba que inspecciona las respuestas de login y los logs capturados.

## 7. Puertas de calidad y documentación

- [ ] 7.1 Añadir en la raíz los scripts `dev:*`, `test:all`, `test:e2e`, `check` y `check:full`, y extender `.husky/pre-commit` para correr lint-staged, `lint:all`, `test:all` y `build:all` en los tres proyectos; verificar que `pnpm check` pasa y que, con un test roto a propósito, `sh .husky/pre-commit` falla nombrando el subproyecto y el paso.
- [ ] 7.2 Actualizar `.secretlintignore` para `dist`, `.astro` y artefactos nuevos y comprobar que el escáner sigue detectando un token falso en los tres proyectos; verificar con `pnpm secrets:scan` y un archivo de prueba temporal.
- [ ] 7.3 Crear un Dockerfile por proyecto (`node:26-alpine`, pnpm) sin dependencias de desarrollo en la imagen final; verificar con `docker build` del de `services/api` y de uno de los Astro.
- [ ] 7.4 Actualizar README (estructura, comandos, requisitos, Docker), los `.env.example` y `docs/database.dbml` (tablas de personal y de intentos), y volver a ejecutar `ux-init` en modo sync; verificar ejecutando los comandos del README tal cual y que `detect.mjs` lista shop y admin.

## 8. Auditoría del prototipo

- [ ] 8.1 Levantar el prototipo desde el tag con `git worktree add` fuera del repo y crear `docs/prototipo/auditoria.md` con el inventario de rutas, pantallas y flujos; verificar que cada ruta bajo `src/app` del tag aparece en la tabla.
- [ ] 8.2 Completar para cada funcionalidad la decisión (conservar, mejorar, descartar), el motivo, la rebanada destino y las preguntas para el cliente; verificar que el usuario la revisa y la aprueba o corrige.

## 9. Integración

- [ ] 9.1 Ejecutar `pnpm check:full` con Docker levantado y comprobar que lint, pruebas unitarias, e2e y build pasan en los tres proyectos.
- [ ] 9.2 Verificar el criterio de la hoja de ruta: `dev:api`, `dev:admin` y `dev:shop` levantan, y un Gerente inicia sesión contra la API y accede a una ruta restringida mientras otro rol recibe 403.

## Workflow follow-up

- Hacer `push` del tag `demo-aprobada` solo si el usuario lo aprueba.
- Reescribir `store-branding-config` sobre esta base (Astro + NestJS) como rebanada 1.
- Marcar el Paso 0 en `openspec/ROADMAP.md` y archivar el change tras la revisión.
