# Roadmap — Clic Moda SCZ (del prototipo al primer cliente)

> Documento vivo. Cada rebanada se convierte en un **change de OpenSpec** (`/opsx:propose <nombre>`): el roadmap dice *qué y en qué orden*, OpenSpec dice *cómo*. Última revisión: 2026-11-11.

## Visión

Construir **desde cero** el producto real para un posible primer cliente al que le gustó la demo. El proyecto nació como trabajo universitario; su roadmap histórico está en `docs/historico/road-to-mvp-universitario.md` y **ya no rige**.

La demo es el **prototipo: inspiración, no base de código ni especificación**. Muestra qué le gustó al cliente, pero hay comportamiento que nunca se especificó y mucho por validar y mejorar. Nada se porta tal cual: cada funcionalidad se re-especifica, se mejora y se construye con **backend real y administrable desde el admin**.

Tienda de moda cruceña, canal principal TikTok/Instagram, móvil-first. **Restricciones del cliente:** sin pasarela de pago por ahora (aún no factura); presupuesto acotado (~3000 en activos fijos). Nombre, logo y colores sin definir (se configuran desde un módulo; semilla "Clic Moda SC"). Se vende en vivo y todo se cierra por WhatsApp (delivery o recojo en el almacén), con pago manual y 3 personas operando; se empieza solo con zapatos.

## Prototipos (referencia, solo lectura)

| Qué | Dónde | Para qué |
|---|---|---|
| Shop Next.js completa (demo aprobada) | tag git `demo-aprobada` (se crea en el paso 0.1) | Consultar pantallas y flujos; `git show demo-aprobada:apps/shop/...` |
| Demo móvil estática para iPhone con pedidos por WhatsApp | rama `origin/demo/movil-first` | Inspiración móvil-first |
| Demo publicada | rama `origin/gh-pages` | Lo que vio el cliente |

## Cómo se trabaja: rebanadas verticales

Cada funcionalidad se entrega de punta a punta y en este orden, con pruebas en cada paso:

```
0) Auditoría del prototipo  →  qué hace, qué se conserva, qué se mejora, qué se descarta  (/opsx:explore)
1) Change de OpenSpec       →  specs nuevas y validadas con el cliente
2) API (NestJS)             →  rutas + pruebas unitarias y e2e con Postgres real
3) Admin (Astro)            →  cómo se ve, cómo se configura y administra, usando la API + pruebas
4) Shop (Astro)            →  cómo se refleja al cliente final + pruebas
5) Validación con el cliente
```

**Reglas transversales:** **API con arquitectura hexagonal** (`src/<contexto>/{domain,application,infrastructure}`, DTOs por capa, objetos de valor, puertos frente a adaptadores, pruebas de contrato; límites de capa verificados por el linter; ver `services/api/ARCHITECTURE.md`); Node 26 (LTS) y pnpm 12; funciones de máximo 25 líneas (`error` en proyectos nuevos); hook de commit con secretos, lint y build en todos los subproyectos; UI conforme a `.ux/` (`ux-plan-review` antes de aprobar, `ux-check` al terminar); nunca `--no-verify`.

## Arquitectura objetivo

```
services/api   NestJS 12.4.2 + TypeORM 1.1.2 + PostgreSQL (Docker)  ← única fuente de verdad
apps/admin     Astro 7.4.8 (SSR, adaptador Node) + islas React       ← Gerente, Despacho, Atención
apps/shop      Astro 7.4.8 (SSR, adaptador Node), móvil-first         ← clientes y, luego, espectadores del Live
```

- **Puertos de desarrollo** (fuente única: `ports.json`): infra 10001-10009 (Postgres 10001) y apps 10010-10020 (api 10010, admin 10011, shop 10012), para no chocar con otros proyectos en paralelo. Orquestador en la raíz: `pnpm docker:up`, `pnpm db:migrate`, `pnpm dev`.
- Cada proyecto es **independiente** (su `package.json`, lockfile y `node_modules`); la raíz solo orquesta.
- **Astro no publica canal LTS en npm** (solo `latest`, `beta`, `rc` y `legacy`): se fija la última estable (7.4.8, exige Node ≥ 22.23.4) y se actualiza de forma deliberada.
- Contratos: la API publica OpenAPI y es la única implementación de la lógica de negocio; admin y shop no la duplican.
- Tiempo real (Socket.io) solo entra con la rebanada de Live, si el cliente la valida.

---

## Paso 0 — Fundación (`platform-foundation`)

Deja los tres proyectos vivos, con las herramientas ya exigidas. **Hecho y archivado (2026-11-10, `platform-foundation`, 35/35).**

- [x] 0.1 Preservar el prototipo: tag `demo-aprobada` sobre el commit actual y comprobar que `origin/demo/movil-first` y `origin/gh-pages` siguen intactas.
- [x] 0.2 **Borrar el contenido de `apps/shop`** (la app Next.js, `git rm`), conservando solo la carpeta; el prototipo queda consultable por el tag.
- [x] 0.3 **Chore inicial de `apps/shop` con Astro 7.4.8** (`create-astro --no-ai`, adaptador Node, TypeScript estricto, Tailwind v4, pnpm, regla de 25 líneas como `error`).
- [x] 0.4 Chore inicial de `apps/admin` con Astro 7.4.8 (mismas bases + islas React).
- [x] 0.5 Chore inicial de `services/api` con NestJS 12.4.2 (`nest new -p pnpm --skip-git`), endpoint de salud, OpenAPI, regla de 25 líneas como `error`.
- [x] 0.5b **Estándar hexagonal del API**: documento `ARCHITECTURE.md`, reglas de lint por capa, núcleo compartido (`DomainError`, `ValueObject`, `UseCase`, filtro HTTP) y reubicación del código existente.
- [x] 0.6 PostgreSQL en `docker compose` (desarrollo y pruebas), TypeORM con migraciones (sin `synchronize`), variables de entorno documentadas.
- [x] 0.7 Auth de personal con los paquetes oficiales de Nest (`@nestjs/authentication`, `@nestjs/throttler`): correo y contraseña, roles (Gerente, Despacho, Atención), límite de intentos por correo y Gerente de semilla; modelo de usuario preparado para más proveedores.
- [x] 0.8 Orquestador y hooks: scripts `dev:*`, `build:*`, `lint:*`, `test:*` de los 3 proyectos, `lint-staged` extendido, `.ux/` re-sincronizado (`ux-init`), Dockerfiles y README.
- [x] 0.9 Auditoría del prototipo: inventario de lo que hace la demo (con captura de pantallas y flujos) y decisión conservar / mejorar / descartar por funcionalidad; es la base de los specs de las rebanadas siguientes.

**Hecho cuando:** `pnpm dev:api`, `dev:admin` y `dev:shop` levantan; `pnpm build:all`, `lint:all` y `test:all` pasan; un Gerente puede iniciar sesión contra la API.

## Rebanada 1 — Marca y configuración de la tienda (`store-branding-config`)

Nombre, logo, color, contacto y redes de la tienda, editables por el Gerente. **No se guardan datos de pago**: el cobro se coordina por WhatsApp. Specs en `openspec/specs/` cuando se archive (`store-branding-config`).

- **API (`settings`):** `GET /store-settings` público (ETag y caché de 15 s), `PUT` solo Gerente con errores por campo (422) y rechazo por contraste AA con el color cercano que sí cumple; formato `logo` (WebP con transparencia) en el módulo de medios.
- **Admin:** pantalla `/configuracion` con vista previa a 360 y 1280 px, contraste en vivo y selector de logo e imagen de compartir.
- **Shop:** layout SSR con la marca como variables CSS, cabecera y pie, página de contacto, SEO y enlaces de WhatsApp desde la configuración; un cambio se ve en 30 s como máximo (requisito: menos de 60 s).

## Rebanada 2 — Catálogo y almacén (`catalog-warehouse`) — **va antes que la 1**

Se adelantó porque sin productos y stock reales no hay nada que vender ni que configurar. **Alcance real (en curso):**

- **API:** categorías; modelos con variantes de color y talla (SKU generado); **un solo precio por modelo**; búsqueda y filtros; stock por variante que entra por una **cola de comandos** (ingreso, salida y ajuste, con idempotencia y orden por variante); resumen del inventario. Probado con unitarias, contratos, e2e con Postgres real y un laboratorio de carga.
- **Admin (móvil primero):** categorías, formulario de modelo, y una sola pantalla de **Inventario** con la matriz color × talla de cada modelo (movimientos, historial, interruptores de activo, precio y estante por modelo). Flujos con Playwright.
- **Hecho después (change `shop-catalog`):** fotos del producto, lectura pública del catálogo y catálogo y detalle en la **shop** con consulta por WhatsApp y SEO por producto.
- **Diferido:** etiquetas y medidas; reservas de stock para el pago manual (rebanadas 4, 5 y 8); alta de personal desde el panel; modo oscuro; prueba de estrés hasta el punto de quiebre.
- **Verificación al desplegar (viene de `media-share-formats`):** con una URL pública, comprobar una imagen y una página de la tienda con los depuradores de WhatsApp y Facebook; probar «Compartir» (Web Share) en un celular real.

## Decisión de producto (2026-11-12): cuentas, carrito y favoritos

Confirmada por el usuario al planificar `shop-catalog`:

- **Comprar y armar el carrito no necesitan cuenta.** El carrito vive en el navegador y el servidor revalida el stock al crear el mensaje o la reserva; no se guardan datos personales.
- **Favoritos en el teléfono (`localStorage`)** con un aviso claro: «si cambias de teléfono o borras los datos, se pierden: crea una cuenta para conservarlos y recibir avisos de promociones y descuentos». Al crear una cuenta o iniciar sesión, los favoritos locales **se pasan a la cuenta**; iniciar sesión en otro dispositivo trae los de la cuenta.
- **Compartir el carrito por un enlace** (por ejemplo, para que otra persona lo compre): se diseña en `reservations-whatsapp-checkout`, sin datos personales.
- La **cuenta es opcional**: la rebanada 3 (identidad de cuentas) deja de estar en el camino crítico y se planifica después de vender.
- Para reservar sin cuenta (rebanada de reservas) hará falta un código de reserva en el mensaje de WhatsApp, un vencimiento corto, un tope por dispositivo y confirmación del equipo; lo guardado debe ser mínimo y purgarse al vencer.

## Rebanada 3 — Identidad de cuentas (`account-identity`)

Login con **correo, Google y TikTok**, con **una sola cuenta por persona**: si las tres identidades usan el mismo correo, se agrupan en vez de crear tres cuentas. Perfil y favoritos. *Auditar:* si hace falta registro obligatorio o basta nombre + teléfono.

- **Restricción verificada:** TikTok **no entrega correo ni teléfono** (solo `open_id`, `union_id`, nombre y foto). Para unificar, quien entra con TikTok debe verificar un correo por enlace mágico, y solo se vincula a una cuenta existente cuando el correo está verificado en ambos lados; si no, se crea una cuenta nueva.
- **API:** tabla de identidades externas, vinculación por correo verificado, Google por OIDC (preset del paquete oficial), TikTok como proveedor propio (OAuth de TikTok Login Kit; hay que comprobar si es compatible con OIDC), enlaces mágicos y verificación de correo. **Admin:** consulta de clientes. **Shop:** login y perfil.
- **Necesita fuera del código:** proveedor de correo saliente, una app de Google (OAuth) y una app de TikTok for Developers aprobada, con dominio y HTTPS.

## Rebanada 4 — Carrito y checkout

Carrito, cupones aplicados, validación atómica de stock, pago por QR/transferencia con confirmación manual, ticket y mensaje de WhatsApp. Aquí se completa el control de acceso a los datos de pago por dueño del pedido.

## Rebanada 5 — Pedidos

Estados, kanban de despacho, confirmación de pago manual, historial y detalle para el cliente.

## Rebanada 6 — Promociones

Cupones, banners por dispositivo, ventas flash con cuenta regresiva.

## Rebanada 7 — Reseñas

Reseñas con foto y compra verificada, y moderación desde el admin.

## Rebanada 8 — Reservas y Live (solo si el cliente lo valida)

Inventario por unidad con serie, reserva con vencimiento (la misma para tienda y Live), sala en tiempo real, fila de espera, antiabuso (OTP, tope por cliente, no-shows). El servidor es el único árbitro de las reservas; los vencimientos viven en base de datos.

## Continuo — Producción

- Infraestructura: VPS (API + Postgres + Nginx), shop y admin desplegados, dominio y HTTPS.
- Backups de Postgres con prueba de restauración; logs, métricas y alertas.
- **Seguridad:** control de acceso en todas las rutas de la API (el prototipo no lo tenía), validación de entrada, rate limits, secretos, revisión OWASP básica.
- Legal/operativo: términos, política de datos, capacitación del personal.
- Piloto acotado con el cliente y ajustes.

## Más adelante

Pasarela/QR interoperable con conciliación (cuando facture), facturación electrónica, notificaciones push o WhatsApp Business API, métricas por vendedor, e investigación de live-commerce (Douyin/Taobao Live) — *no realizada aún*.

---

## Qué hacía el prototipo (para auditar, no para copiar)

Catálogo con filtros y stock por talla; carrito persistente con cupones; checkout con ticket por WhatsApp; login, perfil e historial; admin con dashboard, productos, pedidos (kanban), cupones, banners, ventas flash y moderación de reseñas. **Sin control de acceso en la API, con datos bancarios en el bundle público y sin pruebas automáticas.**

## Orden y camino crítico

`Paso 0 (hecho) → Rebanadas 2 y 1 (hechas) → catálogo en la tienda (hecho) → reservas y cierre por WhatsApp (4, 5 y 8) → producción → 3 (cuentas, opcional) → 6 → 7`. Las rebanadas 4 y 5 son el mínimo para vender; 6 y 7 pueden ir en paralelo a ellas. Para mostrar valor pronto al cliente: Paso 0 + Rebanada 1 + Rebanada 2 ya dan una tienda configurable con catálogo real.

## Decisiones abiertas

| # | Decisión | Afecta |
|---|---|---|
| 1 | ORM: TypeORM 1.1.2 (propuesto) vs Prisma 7.10.1 fijada (su tag `latest` instala un RC) | Paso 0 |
| 2 | Nombre, logo y paleta definitivos; rosa por defecto `#d43a65` (4.57:1) en lugar de `#e63f6e` (3.96:1) | Rebanada 1 |
| 3 | ¿Quién edita la configuración además del Gerente? | Rebanada 1 |
| 4 | ¿El cliente quiere Live y reservas con serie? Validarlo antes de invertir | Rebanada 8 |
| 5 | Orden de las rebanadas 2–7 según prioridad del cliente | Todas |
| 6 | Hosting concreto (proveedor, región) y presupuesto mensual | Producción |
| 7 | ~~Almacenamiento de imágenes~~ **Decidido:** SeaweedFS aislado (sin puertos públicos), entregado por la tienda en `/m/*` (change `media-share-formats`). Falta elegir el hosting de producción y si se pone Cloudflare delante | Producción |
| 8 | Proveedor de correo saliente (verificación, recuperación, enlaces mágicos) y dominio remitente | Paso 0 (dev) / Rebanada 3 |
| 9 | Registrar las apps de Google (OAuth) y de TikTok for Developers (Login Kit, requiere revisión): ¿a nombre de quién, con qué dominio? | Rebanada 3 |
