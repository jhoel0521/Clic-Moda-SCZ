# Design

## Context

Ver `proposal.md` (Why) para la motivación y `specs/` para los requisitos. Estado observado en el código:

- **Patrón de servicios**: contrato `core/contracts/I*Service.ts` → servicio `backend/services/*` (sobre `backend/db/db.ts` y `data/db.json`) → ruta `app/api/**/route.ts` → fachada `services/index.ts`. La configuración nueva debe seguirlo.
- **Configuración actual**: `core/config/env.config.ts` con `NEXT_PUBLIC_*` (fijas en build). Los consumidores son `checkout/page.tsx`, `pedidos/[id]/page.tsx`, `OrderHistoryTable.tsx` y `useCartStore.ts`.
- **Marca hardcodeada**: 15 menciones de "Clic Moda SCZ" (layout, páginas, footer, sidebar del admin, constantes) y los hex del tema en `tailwind.config.ts` (cargado con `@config` desde `globals.css`, Tailwind v4) más ~28 hex sueltos en `globals.css`, `login`, `contacto` y `StoreFooter`.
- **Textos técnicos visibles al cliente**: `checkout/page.tsx:378` y `pedidos/[id]/page.tsx:74` muestran "Agregá tu QR en NEXT_PUBLIC_PAYMENT_QR_URL".
- **Sin control de acceso en `/api/*`**: el proxy (`proxy.ts`) solo cubre páginas (`/admin`, `/perfil`, `/pedidos`, `/carrito`, `/checkout`) y solo comprueba la existencia de la cookie `clic-moda-session`. Ninguna ruta `/api/*` valida sesión ni rol (p. ej. `POST /api/coupons`).
- **Caché en este Next (16.2.4, sin `cacheComponents`)**: `fetch` no cachea por defecto; se cachea con `fetch(url, { next: { revalidate, tags } })`. `revalidateTag(tag, 'max')` exige el segundo argumento (la forma de uno está deprecada) y sirve contenido viejo una vez mientras refresca. `updateTag(tag)` expira al instante pero **solo** desde Server Actions. Ninguna de las dos puede llamarse desde Proxy ni desde Client Components.
- **Imágenes**: `next.config.ts` restringe `next/image` a tres hosts, así que un logo con URL arbitraria no puede pasar por `next/image`.
- **Admin**: hoy vive dentro de la shop (`app/(admin)`); `apps/admin` es un placeholder.

## Goals / Non-Goals

**Goals:**
- Una sola fuente de configuración de marca y contacto, consumida por toda la shop.
- Que migrar de la etapa 1 (mock/env en la shop) a la etapa 2 (API real) no cambie los componentes: solo el adaptador de lectura.
- Primer pintado ya con la marca correcta, sin parpadeo.
- Evitar por construcción que vuelvan los literales de marca y de color.

**Non-Goals:**
- Proteger todas las rutas `/api/*` existentes (cambio aparte; ver Riesgos).
- Subida y almacenamiento de imágenes, multi-tienda, modo oscuro, i18n (ver `proposal.md`, Fuera de alcance).
- Usar los scripts de ux-kit en tiempo de ejecución: son herramientas de desarrollo.

## Decisions

**D1. Modelo y servicio con el patrón existente.** `IStoreSettings` (nombre, `logoUrl`, `primaryColor`, contacto) e `IStoreSettingsService` con `getPublic()`, `getPaymentInfo()` y `update()`. Se separan **proyecciones**: la pública (marca + WhatsApp + dirección) y la de pago (banco + QR). *Alternativa descartada*: seguir con `env.config.ts` (obliga a redeploy) o un solo objeto con todo (expone datos bancarios).

**D2. Etapa 1: fuente en `data/db.json`, sembrada desde env.** Una clave `storeSettings` con una sola fila; el seed toma los valores actuales de `NEXT_PUBLIC_*` y, si faltan, los por defecto (`Verashoe`). Rutas: `GET /api/store-settings` (pública) y `PUT /api/store-settings` (gerente). *Por qué*: no depende de una API que aún no existe y ejercita el mismo contrato que tendrá la API real.

**D3. Lectura en servidor, entrega por contexto.** El layout raíz (Server Component) obtiene la configuración con una función cacheada por petición (`React.cache`) y la pasa a un provider de cliente ya poblado; los componentes cliente leen del contexto y no hacen fetch propio. `metadata` pasa a `generateMetadata`, con plantilla `%s | {nombre}`. *Alternativa descartada*: fetch en el cliente (provoca parpadeo del nombre y de los colores).

**D4. Tema por variables CSS inyectadas en el `<head>`.** El layout emite un `<style>` con `:root{--brand, --brand-dark, --brand-light, --brand-subtle}` calculadas en servidor a partir del color primario. En `tailwind.config.ts`, `brand.*` apunta a esas variables (`var(--brand)`, etc.); los hex sueltos de `globals.css`, `login`, `contacto` y `StoreFooter` pasan a usar `brand-*`/tokens. Las variantes se derivan con una función pura (oscura = −8 % de luminosidad; clara = +; sutil = alfa 12 %). Los colores de terceros (Facebook, Google, Instagram) quedan en un único archivo de constantes, excepción documentada. *Alternativa descartada*: guardar las cuatro variantes (más carga para el admin y más combinaciones inválidas).

**D5. Validación de contraste en una función pura compartida.** `checkBrandContrast(primary)` calcula la razón WCAG (misma fórmula que `.ux/scripts/contrast.mjs`) para blanco sobre primario (≥ 4.5) y primario sobre el fondo de página (≥ 3), y devuelve razones y el color más cercano que cumple (oscurecer por pasos). El **servidor es la autoridad** (rechaza en `PUT`) y el admin usa la misma función para la vista previa. El color por defecto debe pasar su propia regla: el actual `#e63f6e` da 3.96:1, se propone `#d43a65` (4.57:1 sobre blanco, 4.40:1 sobre `#fff9fb`) y se confirma con el cliente.

**D6. Caché y frescura (etapa 2).** La shop lee `GET {API}/store-settings` con `fetch(..., { next: { revalidate: 60, tags: ['store-settings'] } })`. La API responde con `Cache-Control: public, max-age=60` y `ETag`, y `304` ante `If-None-Match`. Al guardar, el admin (o la API) llama a un webhook protegido con secreto en la shop (`POST /api/revalidate`) que ejecuta `revalidateTag('store-settings', 'max')`. En la etapa 1, como el admin está en la misma app, se guarda con una **Server Action** que usa `updateTag('store-settings')` (expiración inmediata, lectura de lo propio). *Por qué*: el `revalidate: 60` acota la frescura aunque el webhook falle; el webhook la acelera.

**D7. Valores por defecto y degradación.** Una constante `DEFAULT_STORE_SETTINGS` en el código. Si la lectura falla, se usa la última configuración válida en memoria del proceso y, si no hay, los por defecto. Nunca se propaga el error a la página.

**D8. Datos de pago fuera del payload público.** Proyección propia: `GET /api/store-settings/payment` (solo clientes con sesión) y, en el detalle del pedido, solo para el dueño. Se elimina `NEXT_PUBLIC_BANK_*` y `NEXT_PUBLIC_PAYMENT_QR_URL` del bundle del cliente. Los mensajes técnicos de QR ausente se sustituyen por "coordiná el pago por WhatsApp".

**D9. Autorización mínima en las rutas nuevas.** Un helper de servidor `requireSession(req, { role })` que lee la cookie `clic-moda-session`, resuelve el usuario con `AuthService` y comprueba rol e identidad. Se aplica a `PUT /api/store-settings`, `GET /api/store-settings/payment` y al detalle de pago del pedido. *No* se aplica al resto de `/api/*` en este cambio.

**D10. Logo con `<img>` y alternativa de texto.** Un componente `StoreLogo` con `<img>` (no `next/image`, por la lista de hosts), `alt` con el nombre, tamaño fijo para evitar saltos de layout y `onError` que cae al nombre en texto. *Alternativa descartada*: ampliar `remotePatterns` a cualquier host (inseguro) o hospedar el logo en la propia tienda (necesita almacenamiento; fuera de alcance).

**D11. Evitar regresiones con lint.** Regla ESLint `no-restricted-syntax` que prohíbe en `apps/shop/src` los literales de texto "Clic Moda" y "Verashoe" fuera del módulo de configuración, y los hex de la paleta de marca fuera de los archivos de tema. Encaja con el hook de pre-commit.

**D12. Pantalla de edición.** Etapa 1: `/admin/configuracion` dentro de la sección de admin actual, con vista previa y validación de contraste en vivo. Etapa 2: la misma pantalla en `apps/admin`, con el mismo contrato.

## Risks / Trade-offs

- **Cambia el color de la demo aprobada** (`#e63f6e` → `#d43a65`) → mínimo, pero hay que confirmarlo con el cliente; alternativa: exentar el color por defecto de la regla, a costa de incumplir AA en el botón principal.
- **`revalidateTag(..., 'max')` sirve contenido viejo una vez** → la garantía de 60 s del spec depende del `revalidate: 60` y, mejor, del webhook; hay que comprobar con una prueba que tras el webhook la siguiente visita ya trae lo nuevo, y si no, reducir la ventana.
- **Rutas `/api/*` abiertas** → fuera de alcance, pero deja a cualquiera crear cupones o cambiar pedidos; se recomienda un cambio propio `api-route-authorization` antes de salir a producción (encaja en F1).
- **Datos bancarios expuestos hasta hoy** en el bundle → se corrige aquí; los despliegues ya publicados siguen sirviéndolos hasta redeployar.
- **`<img>` sin optimización** → se compensa con tamaño fijo; migrar a almacenamiento propio y `next/image` cuando exista la API de assets.
- **Estado en memoria para "última configuración válida"** → no se comparte entre instancias ni sobrevive a reinicios; aceptable en beta, ya que el respaldo final son los valores por defecto.
- **Tailwind v4 con colores `var()` y opacidad** (`bg-brand/10`) → debe verificarse en la implementación que el modificador de opacidad siga funcionando con variables.

## Migration Plan

1. Etapa 1 sin romper la demo: introducir el módulo y el seed, migrar consumidores uno a uno manteniendo los valores actuales; confirmar visualmente que la shop queda igual (salvo el rosa por defecto, si se aprueba).
2. Retirar los `NEXT_PUBLIC_*` de marca/pago y actualizar `.env.example`.
3. Activar la regla de lint cuando no queden literales.
4. Etapa 2 (cuando exista `services/api`): cambiar solo el adaptador de lectura a `GET /store-settings` y añadir el webhook.
5. *Rollback*: la etapa 1 conserva los valores por defecto en código; revertir es volver al commit anterior, sin migración de datos.

## Open Questions

- ¿Se aprueba oscurecer ligeramente el rosa por defecto (`#d43a65`) o se prefiere exentarlo? (afecta solo al valor por defecto, no a la estructura)
- Tamaño y formato recomendados del logo, y si hará falta favicon configurable.
- ¿Quién puede editar la configuración además del Gerente (p. ej. Atención al Cliente solo contacto)?
