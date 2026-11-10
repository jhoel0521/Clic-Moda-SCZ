# 🛍️ Clic Moda SCZ

Plataforma de fast fashion pensada para venta ágil en Santa Cruz. El objetivo no es montar un e-commerce pesado, sino una experiencia visual y rápida que permita explorar productos, revisar tallas exactas, gestionar carrito y concretar pedidos por WhatsApp con un ticket claro.

## Estado Actual

El proyecto ya es un **MVP viable**.

Ya están resueltos y funcionando:

* Catálogo dinámico con filtros y tarjetas de producto.
* Detalle de producto con tallas, colores, medidas y stock por talla.
* Carrito persistente con cupones.
* Checkout con validación y creación de orden.
* Confirmación de pedido con ticket.
* Autenticación con validación de sesión en hidración.
* Panel de administración con productos, pedidos, cupones, banners y reseñas.
* Inventario por talla con validación atómica al comprar.

## Stack Tecnológico

* **Framework:** Next.js 16.2.4
* **UI:** React 19.2.4 + TypeScript
* **Estilos:** Tailwind CSS v4 + Lucide React
* **Estado global:** Zustand
* **Formularios:** React Hook Form + Zod
* **Persistencia local:** localStorage + cookie de sesión
* **Validación:** ESLint + Prettier

## Estructura del repositorio (monorepo)

Cada proyecto es **independiente** (su propio `package.json`, `pnpm-lock.yaml` y `node_modules`). La raíz solo los orquesta.

```text
apps/shop       # Tienda (Next.js) — el MVP actual
apps/admin      # Panel de administración — pendiente de scaffolding
services/api    # API compartida + tiempo real (NestJS) — pendiente de scaffolding
openspec/       # Specs y changes (OpenSpec) + ROADMAP.md
docs/           # Documentación (esquema de datos)
```

Hoja de ruta hacia producción: [`openspec/ROADMAP.md`](openspec/ROADMAP.md).

### Primeros pasos

Requiere Node 26 (LTS) y pnpm 12 (versiones fijadas en `.nvmrc` y `packageManager`).

Necesita Docker para la base de datos. Copia `services/api/.env.example` a `services/api/.env` y completa
`DB_PASSWORD` y `AUTH_JWT_KEY` (el archivo explica cómo generarla).

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

Para añadir un servicio, agrégalo a `ports.json` en el rango que le toca: el orquestador valida que ningún
puerto salga de su rango ni se repita.

**Comprobaciones:** `pnpm check` (contrato, secretos, lint, pruebas unitarias y build de todo) y
`pnpm check:full` (además las pruebas e2e, que necesitan `pnpm docker:up`). El hook de commit corre `check`
sin las e2e. Comando de servidor para casos extremos: `pnpm --dir services/api roles:assign`.

## Arquitectura de la tienda (`apps/shop`)

La tienda usa App Router y separa responsabilidades entre UI, dominio y servicios:

```text
apps/shop/src/
	app/            # Rutas, layouts y páginas
	backend/        # Servicios de negocio y acceso a datos simulados
	core/           # Modelos, contratos, stores, guards y constantes
	infrastructure/ # Fábricas y adaptadores
	shared/         # Componentes y hooks reutilizables
	services/       # Facade de servicios consumidos por la UI
	routes/         # Centralización de rutas
data/db.json      # Base de datos simulada
docs/database.dbml# Documentación de esquema
```

## Funcionalidades Principales

### Cliente

* Landing page con propuesta de valor.
* Catálogo con filtros por talla, categoría, etiqueta y precio.
* Tarjetas que muestran stock total y estado agotado.
* Detalle de producto con stock por talla y selector de cantidad limitado.
* Carrito con persistencia.
* Checkout con validación de stock y generación de orden.
* Confirmación de pedido con ticket y enlace a WhatsApp.

### Autenticación

* Login y registro.
* Validación de sesión al cargar la app para evitar redirecciones erróneas.
* Protección de rutas en cliente y en proxy.

### Administración

* Dashboard con métricas básicas.
* CRUD de productos.
* Gestión de pedidos.
* Moderación de reseñas.
* Cupones, banners y ventas flash.

## Inventario por Talla

El stock de productos ya no es un número único. Ahora se maneja como un objeto por talla, por ejemplo:

```json
{
	"S": 3,
	"M": 4,
	"L": 3,
	"XL": 3
}
```

Esto permite:

* Mostrar stock real por talla seleccionada.
* Evitar compras de tallas sin existencia.
* Descontar inventario de forma atómica al crear la orden.

## Scripts

Desde la raíz (`pnpm dev:shop`, `pnpm build:shop`, `pnpm lint:all`, …) o dentro de `apps/shop`:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
pnpm pre-commit
```

## Validación

El flujo actual se valida con:

* `pnpm lint`
* `pnpm build`
* `pnpm pre-commit`

## Próximos pasos

* Completar documentación visual de arquitectura y flujo UX.
* Preparar el backend real si el proyecto evoluciona fuera del mock.
* Mejorar analítica y control de inventario avanzado.
 