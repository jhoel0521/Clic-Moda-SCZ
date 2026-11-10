# Auditoría del prototipo universitario

> Fuente: tag `demo-aprobada` (commit `bff10c1`), leído desde un `git worktree` fuera del repositorio. Es una lectura del **código**: no se levantó la demo ni se tomaron capturas de pantalla (la hoja de ruta las menciona; quedan pendientes si el cliente las pide).
>
> Las columnas **Decisión**, **Rebanada** y **Pregunta al cliente** son una **propuesta** pendiente de revisión y aprobación (tarea 8.2 de `platform-foundation`).

**Leyenda de decisión:** **Conservar** (misma idea y comportamiento), **Mejorar** (la idea sirve, la implementación no), **Descartar** (no se lleva al producto).

## 1. Hallazgos que condicionan todo lo demás

| # | Hallazgo | Evidencia en el prototipo | Consecuencia |
|---|---|---|---|
| H1 | **No hay control de acceso real.** Ningún endpoint de `src/app/api` verifica sesión ni rol: cualquiera puede crear, editar o borrar productos, cupones, banners y cambiar el estado de pedidos. | `api/products`, `api/orders`, `api/coupons`... no leen identidad | La API nueva aplica roles por ruta desde el primer endpoint (ya hecho en `platform-foundation`) |
| H2 | **La sesión es una cookie con el valor `'1'`, legible por JavaScript** (`httpOnly: false`). `proxy.ts` solo comprueba que exista. | `api/auth/login/route.ts`, `src/proxy.ts` | Cualquiera entra a `/admin` creando la cookie. Descartar este mecanismo por completo |
| H3 | **Base de datos en un archivo JSON** (`data/db.json`: 5 usuarios, 8 productos, 4 pedidos, 4 cupones, 5 reseñas, 3 banners, 29 etiquetas) con escritura directa desde las rutas. | `src/backend/db` | No sirve para concurrencia ni producción; se reemplaza por PostgreSQL |
| H4 | **Descuento de stock no atómico**: lee el stock de la talla, resta y guarda, sin transacción. Dos compras simultáneas pueden vender la misma última unidad. | `ProductService` (descuento por talla) | La validación atómica es requisito de la rebanada 4 |
| H5 | **El cupón consume un uso al *validarse*, no al confirmar el pedido.** Aplicar y abandonar gasta usos. | `CouponService` (incrementa `veces_usado` al aplicar) | Consumir el uso dentro de la transacción del pedido |
| H6 | **Datos bancarios y número de WhatsApp en el bundle público** (`NEXT_PUBLIC_*`). | `core/config/env.config.ts` | Servirlos desde la API (la rebanada 1 ya lo cubre) y exigir sesión para los de pago |
| H7 | **Login social falso**: el botón de Google/TikTok abre un modal de demostración. El formulario de **contacto simula el envío** con un `setTimeout`. | `login/page.tsx` (`OAuthModal`), `contacto/page.tsx` | No hay nada que conservar de ambos; hay que construirlos de verdad |
| H8 | **Sin pruebas automáticas.** | — | Cada rebanada trae sus pruebas |
| H9 | Marca "Clic Moda SCZ" **repetida en el código** y paleta dispersa. | ~15 menciones, ~28 colores sueltos | La rebanada 1 lo centraliza |

Lo que **sí** estaba bien: la contraseña se guardaba con hash (`hashPassword`/`verifyPassword`), las reglas de negocio estaban separadas de la UI en servicios con contratos, y el flujo de compra (catálogo → carrito → checkout → ticket por WhatsApp) valida con el cliente real.

## 2. Pantallas

Rutas de `apps/shop/src/app` en el tag. Grupo `(store)` = tienda pública; `(admin)` = panel.

| Ruta | Qué hace | Estado de implementación | Decisión | Rebanada | Pregunta al cliente |
|---|---|---|---|---|---|
| `/` (`(store)/page.tsx`) | Portada: banners activos, ventas flash, categorías, etiquetas, "colecciones" y pasos de compra | Funciona con datos de `db.json` | **Mejorar** | 1 y 6 | ¿Qué debe ver primero quien llega desde TikTok/Instagram? |
| `/catalogo` | Catálogo con búsqueda, filtros (talla, etiqueta, precio, categoría) y cajón de filtros en móvil | Completo (405 líneas); búsqueda con debounce | **Mejorar** | 2 | ¿Qué filtros usan de verdad sus clientas en el celular? |
| `/producto/[slug]` | Detalle: tallas, colores, medidas, stock por talla, reseñas | Funciona | **Mejorar** | 2 y 7 | ¿Cuántas fotos por producto y cómo las suben hoy? |
| `/carrito` | Carrito, cupón, resumen y "envío por cobrar" | Funciona; persiste en el navegador | **Mejorar** | 4 | ¿El envío se cobra siempre aparte? ¿Hay zonas o tarifas? |
| `/checkout` | Datos de entrega, validación, creación de pedido y error de stock | Funciona; pide haber iniciado sesión | **Mejorar** | 4 | ¿Se exige cuenta para comprar o basta nombre y teléfono? |
| `/checkout/confirmacion` | Ticket del pedido y enlace a WhatsApp con el mensaje armado | Funciona; depende de un estado en memoria (si se recarga se pierde) | **Mejorar** | 4 | ¿Cómo confirman hoy el pago: captura por WhatsApp o transferencia verificada? |
| `/pedidos/[id]` | Detalle y seguimiento del pedido del cliente | Funciona | **Mejorar** | 5 | ¿Qué estados reales manejan (pagado, armado, enviado, entregado)? |
| `/perfil` | Datos del usuario e historial de pedidos | Básico (72 líneas) | **Mejorar** | 3 | ¿Qué datos del cliente les sirven (dirección frecuente, talla)? |
| `/login` | Ingreso con correo y contraseña; botones sociales de mentira | Correo funciona; social es un modal falso | **Mejorar** | 3 | ¿Registro obligatorio o basta nombre y teléfono? Cuentas de Google y TikTok a nombre de quién |
| `/contacto` | Formulario "envíanos un mensaje" (simulado), WhatsApp, Instagram, Facebook | El formulario no envía nada | **Mejorar** | 1 | ¿Quieren formulario o solo WhatsApp? ¿Qué redes y enlaces reales? |
| `/nosotros` | Historia de la marca, valores y equipo | Contenido de ejemplo | **Mejorar** | 1 | Texto, fotos y equipo reales (hoy es de relleno) |
| `/admin` | Dashboard con métricas básicas de pedidos y productos | Funciona | **Mejorar** | 5 | ¿Qué números mira el dueño cada día? |
| `/admin/productos` | Tabla de productos, activar/desactivar, stock | Lista y activa/desactiva; la edición completa está dispersa | **Mejorar** | 2 | ¿Quién carga el catálogo y con qué frecuencia? |
| `/admin/pedidos` | Tabla de pedidos y avance de estado | Funciona sin control de acceso (H1) | **Mejorar** | 5 | ¿Cuántas personas despachan y cómo se reparten? |
| `/admin/marketing` | Pestañas de cupones, banners, etiquetas, ventas flash y moderación de reseñas | Funciona | **Mejorar** | 6 y 7 | ¿Qué promociones usan realmente? |

## 3. API interna (`src/app/api`)

Cada endpoint del prototipo se reemplaza por uno de `services/api` con roles. Ninguno se conserva tal cual (H1, H3).

| Endpoint | Función | Decisión | Rebanada | Nota |
|---|---|---|---|---|
| `POST /api/auth/login` | Inicia sesión y pone la cookie `'1'` | **Descartar** | 3 | Ya existe `POST /auth/login` con JWT para el personal |
| `POST /api/auth/logout` | Borra la cookie | **Descartar** | 3 | Se reemplaza por revocación de refresh token |
| `GET /api/auth/me` | Devuelve el usuario | **Descartar** | 3 | Ya existe `GET /auth/me` |
| `POST /api/auth/register` | Registro de clientes | **Mejorar** | 3 | Pasa a `account-identity` (correo, Google, TikTok) |
| `GET/POST /api/products` | Lista con filtros y crea producto | **Mejorar** | 2 | Crear exige rol |
| `GET/PUT/PATCH /api/products/[id]` | Lee y edita producto (el prototipo no lo borra) | **Mejorar** | 2 | Idem |
| `PATCH /api/products/[id]/stock` | Ajusta el stock por talla | **Mejorar** | 2 | Debe ser atómico (H4) |
| `PATCH /api/products/[id]/toggle-estado` | Activa o desactiva | **Conservar** | 2 | |
| `PUT /api/products/[id]/flash-sale` | Configura la venta flash | **Mejorar** | 6 | |
| `GET/POST /api/etiquetas` | Lista y crea etiquetas | **Conservar** | 2 | |
| `GET/PUT/DELETE /api/etiquetas/[id]` | Lee, edita y borra etiquetas | **Conservar** | 2 | |
| `GET/POST /api/orders` | Lista y crea pedidos | **Mejorar** | 4 y 5 | Creación atómica con stock y cupón (H4, H5) |
| `GET /api/orders/[id]` | Detalle de pedido | **Mejorar** | 5 | Solo el dueño o el personal |
| `PATCH /api/orders/[id]/status` | Cambia el estado | **Mejorar** | 5 | Solo Despacho/Gerente, con auditoría |
| `GET/POST /api/coupons` | Lista y crea cupones | **Mejorar** | 6 | |
| `DELETE /api/coupons/[id]` | Borra cupones (no hay edición) | **Mejorar** | 6 | |
| `POST /api/coupons/apply` | Valida y aplica un cupón | **Mejorar** | 4 y 6 | No consumir el uso aquí (H5) |
| `GET/POST /api/banners` | Lista y crea banners | **Mejorar** | 6 | |
| `PATCH /api/banners/[id]` | Edita banners (no hay borrado) | **Mejorar** | 6 | |
| `PATCH /api/banners/[id]/toggle` | Activa o desactiva | **Conservar** | 6 | |
| `GET/POST /api/reviews` | Lista y crea reseñas | **Mejorar** | 7 | Compra verificada y foto |
| `PATCH /api/reviews/[id]/moderate` | Modera una reseña | **Mejorar** | 7 | Rol Atención o Gerente |

## 4. Flujos

| Flujo | Cómo era | Decisión | Rebanada |
|---|---|---|---|
| Explorar y filtrar catálogo | Filtros en el cliente sobre datos del servidor; cajón en móvil | **Mejorar** (búsqueda y filtros en la API) | 2 |
| Elegir talla con stock por talla | Stock como objeto `{S, M, L, XL}` | **Mejorar** (tabla de stock por variante) | 2 |
| Carrito invitado que se fusiona al iniciar sesión | `mergeGuestCart` | **Conservar** la idea | 4 |
| Cupón en el carrito | Valida expiración y límite; descuento porcentual | **Mejorar** (H5) | 4 y 6 |
| Compra y ticket por WhatsApp | Crea pedido, muestra ticket y abre `wa.me` con el resumen | **Conservar** (es el flujo que el cliente valida) | 4 |
| Pago | Datos bancarios y QR visibles en el bundle | **Mejorar** (H6): la API los entrega solo con sesión; confirmación manual | 4 |
| Seguimiento de pedido | Estados avanzados desde el admin | **Mejorar** (kanban de despacho, auditoría) | 5 |
| Venta flash con cuenta regresiva | `isFlashSale` y `flashSaleEndsAt` | **Conservar** la idea | 6 |
| Reseñas con moderación | Texto, aprobación desde el admin | **Mejorar** (foto y compra verificada) | 7 |
| Inicio de sesión | Correo/contraseña; social falso | **Mejorar** (H2, H7) | 3 |
| Roles | Un campo `role` con Gerente, Despacho, AtencionCliente y Cliente (`core/constants/ROLES.ts`), sin aplicarse en la API (H1) | **Mejorar**: la API nueva ya tiene Gerente, Despacho y Atención con control real; Cliente llega en la rebanada 3 | Hecho / 3 |

## 5. Preguntas abiertas para el cliente (resumen)

1. Nombre, logo, paleta y textos definitivos; redes y números reales.
2. ¿Compra con cuenta obligatoria o con nombre y teléfono? ¿Qué proveedores sociales (Google, TikTok) y a nombre de quién se registran las apps?
3. Cómo confirman hoy el pago y cómo se calcula el envío (por cobrar, zonas, tarifas).
4. Estados reales de un pedido y cuántas personas despachan.
5. Filtros que realmente usan sus clientas y cómo cargan las fotos desde el celular.
6. Qué promociones usan (cupones, banners, ventas flash) y con qué frecuencia.
7. Si quieren Live y reservas con serie (rebanada 8) antes de invertir en ello.
