# 🛍️ Clic Moda SCZ

Plataforma de fast fashion pensada para venta ágil en Santa Cruz: una experiencia visual y rápida para explorar productos, revisar tallas exactas, gestionar el carrito y concretar pedidos por WhatsApp con un ticket claro.

## Estado actual

El prototipo universitario (Next.js con datos simulados) está conservado en el tag `demo-aprobada`. El producto real se **reconstruye desde cero** por rebanadas verticales, con un backend administrable (hoja de ruta: [`openspec/ROADMAP.md`](openspec/ROADMAP.md)). Hoy existe la base de plataforma: API con inicio de sesión del personal (Gerente, Despacho, Atención), base de datos, orquestador de desarrollo y controles de calidad.

## Stack

* **API:** NestJS 12 + TypeORM + PostgreSQL 18 (Docker), arquitectura hexagonal (ver [`services/api/ARCHITECTURE.md`](services/api/ARCHITECTURE.md)).
* **Admin y tienda:** Astro 7 (SSR con adaptador Node); islas React donde hay formularios.
* **Calidad:** lint + Prettier, Vitest, secretlint y Husky; funciones de 25 líneas como máximo.
* **Runtime:** Node 26 y pnpm 12 (fijados en `.nvmrc` y `packageManager`).

## Estructura del repositorio (monorepo)

Cada proyecto es **independiente** (su propio `package.json`, `pnpm-lock.yaml` y `node_modules`). La raíz solo los orquesta.

```text
apps/shop       # Tienda (Astro)
apps/admin      # Panel de administración (Astro + React)
services/api    # API (NestJS, hexagonal)
agent/skills/   # Skills de los agentes (fuente única; pnpm skills:link)
openspec/       # Specs y changes (OpenSpec) + ROADMAP.md
docs/           # Esquema de datos (database.dbml) e histórico
scripts/        # Orquestador, mapa de puertos y contrato de proyectos
.ux/            # Estándar de UX/UI (ux-kit)
```

**Contrato de proyectos:** cada subproyecto expone los scripts `lint`, `test`, `build` y `format` y aplica la regla de funciones de 25 líneas como error. `pnpm verify:projects` lo comprueba sin importar el framework.

## Primeros pasos

Requiere Node 26, pnpm 12 y Docker para la base de datos. Copia `services/api/.env.example` a `services/api/.env` y completa `DB_PASSWORD` y `AUTH_JWT_KEY` (el archivo explica cómo generarla).

```bash
pnpm install:all       # instala cada proyecto por separado
pnpm docker:up         # levanta la infraestructura (Postgres) y espera a que esté sana
pnpm db:migrate        # aplica las migraciones
pnpm db:seed           # crea el primer Gerente (si no hay contraseña configurada, genera una y la muestra una vez)
pnpm dev               # levanta api, admin y shop en paralelo
```

**Infraestructura y base de datos**

| Comando | Qué hace |
|---|---|
| `pnpm docker:up` / `docker:down` | Levanta / detiene la infraestructura (conserva los datos) |
| `pnpm docker:logs` / `docker:status` | Sigue los registros / muestra el estado |
| `pnpm docker:reset --yes` | Detiene y **borra los datos** de desarrollo (exige `--yes`) |
| `pnpm db:migrate` / `db:revert` / `db:status` | Aplica / revierte la última / lista las migraciones |
| `pnpm db:seed` | Crea el primer Gerente |
| `pnpm db:fresh` / `db:fresh:seed` | Borra todo y migra (y siembra). Se niega fuera de desarrollo local |
| `pnpm dev:api` / `dev:admin` / `dev:shop` | Levanta un solo servidor |
| `pnpm ports` / `preflight` | Muestra el mapa de puertos / comprueba que Postgres responde y que los puertos están libres |

**Puertos** (fuente única: [`ports.json`](ports.json), pensados para no chocar con otros proyectos en paralelo):

| Rango | Servicio | Puerto |
|---|---|---|
| Infraestructura `10001–10009` | PostgreSQL | `10001` |
| Apps y servicios `10010–10020` | API (NestJS) | `10010` |
| | Admin (Astro) | `10011` |
| | Shop (Astro) | `10012` |

Para añadir un servicio, agrégalo a `ports.json` en el rango que le toca: el orquestador valida que ningún puerto salga de su rango ni se repita.

**Roles:** `pnpm --dir services/api roles:assign` abre una pantalla interactiva para asignar roles (también acepta `--email --roles --yes`). Siempre debe quedar al menos un Gerente.

## Comprobaciones

* `pnpm check`: contrato de proyectos, secretos, lint, pruebas unitarias y build de todo. Es lo que corre el hook de commit.
* `pnpm check:full`: lo anterior más las pruebas e2e, que necesitan `pnpm docker:up`. Usan una base aparte (`clic_moda_test`) y se niegan a borrar cualquier otra.

## Docker en Windows con la unidad `J:`

Docker Desktop no comparte la unidad `J:`: los montajes de carpetas del repositorio llegan vacíos al contenedor. Por eso `docker-compose.dev.yml` lleva sus configuraciones en línea (no monta archivos del repo) y los datos van en un volumen con nombre (`clic-moda_pgdata`). En otra unidad, o en Linux y macOS, funciona igual.

## Prototipo anterior

Para ver el prototipo: `git worktree add ../clic-moda-demo demo-aprobada`. Su auditoría funcional (qué conservar, mejorar o descartar) irá en `docs/prototipo/auditoria.md`.
