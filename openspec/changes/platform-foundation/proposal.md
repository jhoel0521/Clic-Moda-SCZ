# Proposal

## Why

La shop actual (Next.js) es una mezcla de decisiones del proyecto universitario, sin API real, sin control de acceso en `/api/*` y sin pruebas. Para construir el producto del primer cliente con backend real y administración desde un admin hace falta una base limpia: tres proyectos vivos, con las herramientas de calidad ya exigidas y un mecanismo de acceso para el personal. Todo lo demás (marca, catálogo, pedidos…) se apoya en esto.

## What Changes

- Preservar el prototipo: tag git `demo-aprobada` y comprobación de que las ramas de demo publicadas siguen intactas.
- **BREAKING:** borrar el contenido de `apps/shop` (la app Next.js) y recrearla con un chore inicial de **Astro 7.4.8**.
- Chore inicial de `apps/admin` con Astro 7.4.8 e islas React.
- Chore inicial de `services/api` con **NestJS 12.4.2**, con endpoint de salud y documentación OpenAPI.
- PostgreSQL en `docker compose` para desarrollo y pruebas, con TypeORM 1.1.2 y migraciones (sin sincronización automática).
- Acceso del personal con los **paquetes oficiales de Nest** (`@nestjs/authentication`, `@nestjs/throttler`): inicio de sesión con correo y contraseña, roles (Gerente, Despacho, Atención al Cliente), límite de intentos por correo y un Gerente inicial de semilla. El modelo de usuario queda preparado para sumar proveedores de identidad.
- Herramientas de calidad en los tres proyectos con un **contrato agnóstico del motor de lint**: cada uno expone `lint`, `test`, `build` y `format`, con la regla de 25 líneas por función como error (ESLint en Astro, oxlint en la API); el hook de commit corre secretos, lint, pruebas y build de todo.
- Orquestador y documentación actualizados (`dev:*`, `build:*`, `lint:*`, `test:*`, README, Dockerfiles) y `.ux/` re-sincronizado.
- Auditoría del prototipo como entregable: inventario de lo que hace la demo con decisión conservar / mejorar / descartar, que alimenta los specs de las rebanadas siguientes.

## Capabilities

### New Capabilities
- `staff-auth`: inicio y cierre de sesión del personal, roles y protección de rutas de la API por rol.
- `repo-quality-gates`: puertas de calidad automáticas de cada commit (secretos, formato, lint, pruebas y build) sobre todos los subproyectos y límites de tamaño de función.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío. -->

## Impact

- **`apps/shop`**: se elimina todo el código actual (Next.js, 15 menciones de marca, rutas `/api/*` sin protección) y queda un esqueleto Astro. Hasta que existan las rebanadas de catálogo y checkout, la tienda real es solo el prototipo publicado.
- **`apps/admin` y `services/api`**: pasan de placeholders a proyectos reales.
- **Raíz**: `package.json`, `.lintstagedrc.mjs`, `.husky/pre-commit`, README, `.ux/`, `openspec/config.yaml`.
- **Dependencias nuevas**: NestJS 12.4.2 (+ `@nestjs/typeorm` 12.0.3, `@nestjs/authentication` 0.1.5, `@nestjs/throttler` 6.7.1, `@nestjs/terminus` 12.1.0, `@nestjs/swagger` 12.1.1, `@nestjs/config` 12.1.1), TypeORM 1.1.2, `pg`, Zod, oxlint, Astro 7.4.8 (+ `@astrojs/node` 11.1.11, `@astrojs/react` 7.1.5), Tailwind v4 (`@tailwindcss/vite`), Vitest (Astro y API) y Playwright.
- **Infraestructura local**: Docker (ya disponible, 29.8.1) para PostgreSQL.
- **Fase del roadmap**: Paso 0 (Fundación) de `openspec/ROADMAP.md`.
- **Fuera de alcance**: cualquier funcionalidad de negocio (marca, catálogo, carrito, pedidos…), la autenticación de clientes y el **login con Google y TikTok con unificación de cuentas por correo** (change `account-identity`, rebanada 3), el envío real de correos, el despliegue a producción, y portar código del prototipo.

## Assumptions

- **Astro no publica canal LTS en npm** (solo `latest`, `beta`, `rc` y `legacy`): se fija la última estable, 7.4.8, que exige Node ≥ 22.23.4 y es compatible con Node 26.
- ORM: TypeORM 1.1.2. Prisma queda descartado porque su tag `latest` instala un release candidate (8.0.0-rc.33) en lugar del estable 7.10.1. Pendiente de confirmación del usuario.
- Los paquetes oficiales de autenticación son pre-1.0 (0.1.x): se fijan en versión exacta y, si resultan inestables, el plan B es JWT y hash propios con `crypto.scrypt`.
- TikTok no entrega correo ni teléfono (documentación oficial del endpoint de usuario): la unificación por correo con TikTok exigirá verificar un correo por enlace mágico, y se diseña en `account-identity`.
- Los tres proyectos siguen siendo independientes (cada uno con su `package.json`, lockfile y `node_modules`).
