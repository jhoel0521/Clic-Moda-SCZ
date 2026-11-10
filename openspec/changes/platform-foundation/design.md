# Design

## Context

Ver `proposal.md` (Why) y `specs/` (requisitos). Estado y datos verificados el 2026-11-10:

- **Repo**: monorepo pnpm sin workspace compartido; `apps/shop` contiene la app Next.js; `apps/admin` y `services/api` solo tienen un `package.json` placeholder. El orquestador raíz ya tiene `husky` + `lint-staged` + `secretlint`; el hook corre lint-staged, `lint:all` y `build:all`.
- **Versiones** (npm, vigentes): NestJS `12.4.2` (CLI `12.0.12`, Node ≥ 20), `@nestjs/typeorm 12.0.3` (acepta `typeorm ^1.0.0-dev`, por tanto 1.1.2), `@nestjs/jwt 12.0.4`, `@nestjs/swagger 12.1.1`, `@nestjs/config 12.1.1`, TypeORM `1.1.2`, `pg 8.23.1`, Astro `7.4.8` (Node ≥ 22.23.4), `@astrojs/node 11.1.11` (pide Astro ^7.2.1), `@astrojs/react 7.1.5`, `@tailwindcss/vite 4.3.5`, Vitest `5.1.0`, Jest `30.5.2`, Playwright `1.65.0`.
- **Astro no tiene canal LTS** en npm: solo `latest`, `beta`, `rc` y `legacy` (4.16.19).
- **Prisma**: su tag `latest` apunta a `8.0.0-rc.33` (release candidate) mientras el cliente estable es `7.10.1`; un `pnpm add prisma` sin versión instalaría el RC.
- **Generadores**: `nest new` admite `-p pnpm`, `--skip-git`, `--skip-install`, `--strict`; `create-astro` (5.3.1) admite `--template`, `--add`, `--no-git`, `--no-install`, `--no-ai`, `--yes`.
- **Entorno**: Windows 11, Node 26.13.0, pnpm 12.18.0, Docker 29.8.1, sin PostgreSQL local.
- **Prototipo**: sin control de acceso en `/api/*`, sin pruebas, ~75 funciones sobre 25 líneas.

## Goals / Non-Goals

**Goals:**
- Tres proyectos que arrancan, compilan, pasan lint y tienen al menos una prueba real cada uno.
- Un único comando raíz que ejecuta todas las puertas de calidad, reutilizable por CI.
- Acceso del personal funcionando de punta a punta contra Postgres real.
- Poder recuperar cualquier pantalla o flujo del prototipo sin conservarlo en el árbol de trabajo.

**Non-Goals:**
- Funcionalidad de negocio, auth de clientes, despliegue, CI hospedada (solo se deja el comando listo).
- Portar código del prototipo.

## Decisions

**D1. Orden estricto de la retirada del prototipo.** (1) crear el tag local `demo-aprobada` sobre el commit actual y verificar que `git show demo-aprobada:apps/shop/package.json` funciona; (2) comprobar `origin/demo/movil-first` y `origin/gh-pages`; (3) recién entonces `git rm -r apps/shop`. El tag es solo local hasta que el usuario apruebe hacer `push` (acción hacia afuera). *Alternativa descartada*: mover la app a `apps/shop-legacy` (deja la mezcla dentro del árbol, se cuela en lint y build). Para consultar el prototipo en marcha: `git worktree add ../clic-moda-prototipo demo-aprobada`, fuera del repo.

**D2. Chore de Astro con generador y adaptador Node.** `create-astro` con `--template minimal --no-git --no-install --no-ai --yes`, luego `@astrojs/node` en modo servidor (SSR; la configuración de marca debe estar en el primer pintado) y `@tailwindcss/vite`. En `apps/admin` se añade `@astrojs/react`. TypeScript en `strict`. *Alternativa descartada*: salida estática (obligaría a reconstruir cada vez que cambie la configuración).

**D3. Chore de Nest con generador.** `nest new -p pnpm --skip-git --strict` dentro de `services/api`. Se conserva el ejecutor de pruebas por defecto de Nest (Jest + `supertest` + `@nestjs/testing`) por ser el idiomático del framework; Astro usa Vitest. *Alternativa descartada*: unificar en Vitest (más fricción con los decoradores y `@nestjs/testing`).

**D4. PostgreSQL en Docker, dos bases.** `services/api/docker-compose.yml` con la imagen de PostgreSQL fijada por versión mayor (se comprueba con `docker pull` al implementar) y un script de inicialización que crea `clic_moda` y `clic_moda_test`. Las pruebas e2e usan la segunda, aplican las migraciones y limpian tablas entre casos.

**D5. TypeORM con migraciones.** `synchronize: false`, `DataSource` propio para la CLI, migraciones versionadas en el repo, entidades con nombres de tabla en `snake_case`. *Por qué no Prisma*: el RC en `latest` (ver Context); queda anotado como reversible si el usuario lo prefiere.

**D6. Auth propia y mínima.** `@nestjs/jwt` (sin Passport) con un `AuthGuard` y un `RolesGuard` + decorador `@Roles()`. Token de acceso de 8 h con `sub` y `role`. Contraseñas con `crypto.scrypt` (sal por usuario, comparación con `timingSafeEqual`), sin dependencias nativas. Roles como enumeración: `GERENTE`, `DESPACHO`, `ATENCION`. Respuesta genérica idéntica para email desconocido o contraseña errónea.

**D7. Límite de intentos en base de datos.** Tabla `login_attempts(email, failed_count, window_started_at)`: cubre también emails inexistentes (no revela cuáles existen) y sobrevive a reinicios. 5 fallos en 15 min bloquean; un acceso correcto reinicia el contador. *Alternativa descartada*: memoria del proceso (se pierde al reiniciar y no escala a varias instancias).

**D8. Usuario inicial por comando idempotente.** `pnpm --dir services/api seed:manager` lee `INITIAL_MANAGER_EMAIL` e `INITIAL_MANAGER_PASSWORD`; si falta alguna, falla nombrándolas y no crea nada; si ya existe un Gerente, no hace nada. Los valores viven en `.env` (ignorado por git) y `.env.example` solo documenta los nombres. Nunca hay contraseña por defecto en el repo.

**D9. Puertas de calidad.** Scripts raíz: `test:all` (pruebas **unitarias y de componente, sin servicios externos**) y `check` = `secrets:scan` + `lint:all` + `test:all` + `build:all`. El hook de commit ejecuta lint-staged + `lint:all` + `test:all` + `build:all`. Las pruebas **e2e** (necesitan Docker/Postgres y navegador) quedan en `test:e2e`, que no corre en el hook para no hacerlo frágil ni lento; se ejecutan con `pnpm check:full` y en CI. Regla `max-lines-per-function` (`max: 25`, sin blancos ni comentarios) como `error` en los tres proyectos; `lint-staged` ya activa Prettier + ESLint por proyecto al existir su `eslint.config.*`, por lo que cada proyecto instala su propio Prettier (Astro con `prettier-plugin-astro`).

**D10. Auditoría del prototipo como documento.** `docs/prototipo/auditoria.md`: una fila por funcionalidad con *qué hace hoy*, *decisión* (conservar, mejorar, descartar), *motivo* y *rebanada destino*. Se elabora leyendo el tag y ejecutando el prototipo en el worktree de D1, y es la entrada de los specs de cada rebanada.

**D11. `.ux/` tras el cambio.** Se vuelve a ejecutar `ux-init` en modo sync para que detecte shop y admin nuevos. `tokens.json` se conserva como referencia del prototipo hasta que la rebanada 1 defina el tema real de la nueva shop; `config.yaml` queda con `theme: null` para las apps nuevas.

## Risks / Trade-offs

- **Versiones mayores muy recientes** (Nest 12, TypeORM 1.x, Astro 7) → verificar que cada generador arranca y compila antes de seguir; fijar versiones exactas; si algo falla, anotarlo y abrir issue o buscar la versión estable previa.
- **Sin tienda funcional durante la reconstrucción** → la demo publicada y el tag cubren las presentaciones; el cliente no debe usar la nueva shop hasta la rebanada 4.
- **Hook más lento** (tests en cada commit) → solo unitarias; si molesta, mover `test:all` a `pre-push` sin perder la puerta.
- **Docker obligatorio para e2e** → documentado en README; sin Docker solo se pierden las pruebas e2e.
- **Borrado irreversible por descuido** → el orden de D1 (tag y verificación antes de `git rm`) es parte de las tareas, y `git checkout demo-aprobada -- apps/shop` lo revierte.
- **Contador de intentos en BD** → añade una escritura por intento fallido; irrelevante a esta escala.

## Migration Plan

1. Tag y verificación del prototipo (D1) → 2. retirada de `apps/shop` → 3. chores de los tres proyectos → 4. Postgres y migraciones → 5. auth y seed → 6. puertas de calidad y documentación → 7. auditoría del prototipo.
*Rollback*: antes del paso 2, nada cambia; después, `git checkout demo-aprobada -- apps/shop` restaura la shop Next.js completa. No hay datos que migrar.

## Open Questions

- Confirmar TypeORM frente a Prisma 7.10.1 fijada.
- Versión mayor de PostgreSQL de la imagen (se fija al implementar, tras `docker pull`).
- ¿Se hace `push` del tag `demo-aprobada` al remoto? (acción hacia afuera; decide el usuario)
