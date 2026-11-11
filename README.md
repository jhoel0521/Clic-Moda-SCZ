# 🛍️ Clic Moda SCZ

Plataforma de fast fashion pensada para venta ágil en Santa Cruz: una experiencia visual y rápida para explorar productos, revisar tallas exactas, gestionar el carrito y concretar pedidos por WhatsApp con un ticket claro.

## Estado actual

El prototipo universitario (Next.js con datos simulados) está conservado en el tag `demo-aprobada`. El producto real se **reconstruye desde cero** por rebanadas verticales, con un backend administrable (hoja de ruta: [`openspec/ROADMAP.md`](openspec/ROADMAP.md)). Hoy existe la base de plataforma (API con inicio de sesión del personal —Gerente, Despacho, Atención—, base de datos, orquestador y controles de calidad) y, encima, el **catálogo con inventario**: categorías, modelos con colores y tallas, un solo precio por modelo y stock que entra por una cola de movimientos. El **panel de administración** (móvil primero) tiene una pantalla de Inventario con la matriz color × talla de cada modelo.

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
pnpm docker:up         # levanta la infraestructura (Postgres y SeaweedFS) y espera a que esté sana
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
| `pnpm db:seed:catalog` | Carga la demo de zapatos (categorías, modelos y stock; se puede repetir sin duplicar) |
| `pnpm password:reset --email <correo> --password "<nueva>"` | Cambia la contraseña de una cuenta del personal (mínimo 12 caracteres) |
| `pnpm db:fresh` / `db:fresh:seed` | Borra todo y migra (y siembra). Se niega fuera de desarrollo local |
| `pnpm dev:api` / `dev:admin` / `dev:shop` | Levanta un solo servidor |
| `pnpm ports` / `preflight` | Muestra el mapa de puertos / comprueba que Postgres responde y que los puertos están libres |

**Puertos** (fuente única: [`ports.json`](ports.json), pensados para no chocar con otros proyectos en paralelo):

| Rango | Servicio | Puerto |
|---|---|---|
| Infraestructura `10001–10009` | PostgreSQL | `10001` |
| | SeaweedFS (S3, imágenes; solo `127.0.0.1`) | `10002` |
| Apps y servicios `10010–10020` | API (NestJS) | `10010` |
| | Admin (Astro) | `10011` |
| | Shop (Astro) | `10012` |

Para añadir un servicio, agrégalo a `ports.json` en el rango que le toca: el orquestador valida que ningún puerto salga de su rango ni se repita.

**Imágenes.** Las fotos se suben desde el panel (`/imagenes`, solo el Gerente): una foto genera los formatos para WhatsApp, Facebook, X, historias y la tienda. Se guardan en SeaweedFS, que corre solo dentro de la red de Docker (en desarrollo se publica únicamente en `127.0.0.1:10002`) y al que solo llega la API. El público las ve en `https://<tienda>/m/<id>/<formato>-<revisión>.jpg`: la tienda reenvía a la API y esta lee del almacenamiento (sin CORS). Las claves `S3_ACCESS_KEY` y `S3_SECRET_KEY` van en `services/api/.env` (nunca en git; hay un ejemplo en `.env.example`). En producción define `SITE_URL` en la tienda (origen público, para canonical y `og:image`) y `SHOP_URL` en el panel.

**Roles:** `pnpm --dir services/api roles:assign` abre una pantalla interactiva para asignar roles (también acepta `--email --roles --yes`). Siempre debe quedar al menos un Gerente.

**Configuración de la tienda.** El Gerente cambia nombre, eslogan, color, logo, imagen de compartir, WhatsApp, almacén, horario y redes desde el panel (`/configuracion`). La API la sirve en `GET /store-settings` (público, con `ETag` y caché de 15 s) y la tienda la lee en el servidor con otra caché de 15 s, así que un cambio se ve en 30 s como máximo y sin volver a desplegar. El color se rechaza si el texto blanco encima no llega a 4,5:1 (AA) y se ofrece el color cercano que sí cumple. No se guardan datos de pago. Para dejar los datos de arranque ("Clic Moda SC") en la base: `pnpm --dir services/api seed:catalog`.

**Catálogo en la tienda.** El Gerente elige hasta 8 fotos por modelo en el panel (`/productos/<id>`, sección Fotos; la primera es la principal). La API publica solo lo vendible (producto, categoría y variante activos) en `GET /public/catalog` (listado con filtros, `/products/<slug>`, `/filters`, `/slugs`), sin costos, ubicaciones ni cantidades: la disponibilidad es un estado (`Disponible`, `Últimas unidades`, `Agotada`). La tienda lo muestra en `/catalogo` y `/p/<slug>`; la talla y el color elegidos viajan en la URL (`?talla=38&color=Negro`) y el botón de WhatsApp lleva el producto, la talla, el color y el código. Un enlace con `?ref=live-nov` recuerda el código (cookie de sesión, sin datos personales) y lo agrega al mensaje como «Ref»: así se mide qué enlace del Live vende. `sitemap.xml` y `robots.txt` los genera la tienda con `SITE_URL`. Los cambios de stock o precio se ven en 30 s como máximo (caché de 15 s en la API y de 15 s en la tienda).


| Comando | Qué hace |
|---|---|
| `pnpm test:e2e` | e2e del API contra Postgres real (base `clic_moda_test`) |
| `pnpm test:flows` | Flujos del panel con Playwright (escritorio, iPhone y 360 px) contra la API real, con su propia base `clic_moda_flows`. Necesita `pnpm docker:up` y los navegadores (`pnpm --dir apps/admin exec playwright install chromium webkit`). Usa los puertos privados 10018 y 10019 |
| `pnpm load [read\|write\|all]` | Laboratorio de carga con k6 **dentro de Docker** (base, API y k6, cada uno con 0.5 CPU y 250 MB; cambia `LOAD_CPUS` y `LOAD_MEM` para otros tamaños). Muestra p50, p90, p95 y p99 y el consumo de cada contenedor |
| `pnpm load:down` | Borra los contenedores, la red y el volumen del laboratorio |

Las pruebas que cruzan varias apps viven en [`e2e/`](e2e/) (hoy: `e2e/load`).

## Comprobaciones

* `pnpm check`: contrato de proyectos, secretos, lint, pruebas unitarias y build de todo. Es lo que corre el hook de commit.
* `pnpm check:full`: lo anterior más las pruebas e2e del API y los flujos del panel, que necesitan `pnpm docker:up`. Usan bases aparte (`clic_moda_test` y `clic_moda_flows`) y se niegan a borrar cualquier otra.

## Docker en Windows con la unidad `J:`

Docker Desktop no comparte la unidad `J:`: los montajes de carpetas del repositorio llegan vacíos al contenedor. Por eso `docker-compose.dev.yml` lleva sus configuraciones en línea (no monta archivos del repo) y los datos van en un volumen con nombre (`clic-moda_pgdata`). En otra unidad, o en Linux y macOS, funciona igual.

## Prototipo anterior

Para ver el prototipo: `git worktree add ../clic-moda-demo demo-aprobada`. Su auditoría funcional (qué conservar, mejorar o descartar) irá en `docs/prototipo/auditoria.md`.
