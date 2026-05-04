# Roadmap de Desarrollo Frontend: Clic Moda SCZ

## 🎯 Visión del Producto

Nuestro enfoque de negocio sigue siendo la automatización inteligente adaptada al mercado local de Santa Cruz. El sistema no calcula tarifas de envío automáticas; en su lugar, el flujo de compra genera un ticket claro que conecta directamente al cliente por WhatsApp para coordinar la entrega. Para administración, el panel permite gestionar catálogo, ventas flash, inventario por talla y pedidos. Hoy el proyecto ya alcanza un estado de **MVP viable**.

---

## 📋 Requisitos del Proyecto Académico

Funcionalidades mínimas requeridas por el rubric:

- [x] **Landing Page (Inicio)** — Presentación de propuesta de valor y navegación principal
- [x] **Sección Nosotros** — Historia, misión y valores del negocio
- [x] **Catálogo / Galería de Productos** — Visualización dinámica con stock, tallas y filtros
- [x] **Carrito de Compras** — Gestión de ítems, cantidades y cupones
- [x] **Pasarela de Pago (Checkout)** — Simulación con ticket WhatsApp
- [x] **Canales de Comunicación** — Formulario validado + redes sociales

### Metodología SDLC documentada
- [x] Levantamiento de Requisitos: `README.md` + `Road To MVP.md`
- [x] Análisis: `docs/database.dbml` (modelo de datos), roles y casos de uso en `src/core/`
- [ ] Diseño: Diagramas de arquitectura y prototipos UI/UX *(pendiente de formalizar)*
- [x] Implementación: MVP funcional sobre Next.js 16 + React 19 + Tailwind CSS v4

### Contexto del Negocio
- **Perfil:** Tienda de fast fashion digital, mercado cruceño, canal principal TikTok/Instagram
- **Diagnóstico inicial:** Sin plataforma propia — ventas solo por redes, sin control de inventario ni tallas estandarizadas
- **Estado actual:** Plataforma web propia con catálogo digitalizado, tallas exactas, carrito persistente y coordinación de entrega por WhatsApp

---

## Sprint 0: Cimientos y Arquitectura Base ✅ COMPLETADO
**Objetivo:** Configurar el esqueleto del proyecto, el estado global y los modelos de datos tipados basados en el diagrama relacional.

* **Configuración del Entorno:**
    * Inicializar proyecto con Next.js 16 + React 19 + Tailwind CSS v4
    * Configurar rutas con App Router + `proxy.ts` para protección de rutas `/admin/*`, `/perfil/*`, `/pedidos/*`, `/carrito/*` y `/checkout/*`
    * Centralizar constantes de rutas en `src/routes/index.ts`
* **Modelos de Dominio (TypeScript Interfaces):**
    * Crear `IUser` con soporte para roles (Gerente, Despacho, Atención al Cliente, Cliente)
    * Crear `IProduct` con `medidas_dinamicas`, `estado`, `tipo_tela`, y array de `IImage`
    * Crear `IOrder`, `IOrderItem`, `ICartItem`
    * Crear `ICuponDescuento`, `IBannerPromocional` — modelos de marketing
    * Crear `IResena`, `IImagenResena` — reseñas con moderación
    * Crear `IFavorito`
    * Esquema de base de datos: `docs/database.dbml`
* **Estado Global (Zustand):**
    * Implementar `useAuthStore` para manejar la sesión del usuario ficticio
    * Implementar `useCartStore` con persistencia en `localStorage` (7 días)
* **Guards de Rutas:**
    * `src/core/guards/RequireAuth.tsx` — verificación de sesión client-side
    * `src/core/guards/RequireRole.tsx` — verificación de rol
* **Capa de Servicios Falsos (Mock Backend):**
    * `MockAuthService` — login/register desde `users.json`
    * `MockProductService` — CRUD de productos con filtros
    * `MockOrderService` — creación y gestión de pedidos
    * `MockCouponService` — validación y aplicación de cupones
    * `MockBannerService` — banners promocionales activos
    * `MockReviewService` — reseñas con flujo de moderación
    * `MockSocket` — eventos en tiempo real con `setInterval`
* **Componentes UI Base (shared/ui):**
    * `Button`, `Input`, `Badge`, `Spinner`, `Modal`
* **App Router — Estructura de Rutas:**
    * `/` Landing Page (propuesta de valor, NO el catálogo)
    * `/catalogo` Catálogo funcional
    * `/nosotros` Historia, misión y valores
    * `/contacto` Formulario + WhatsApp + redes sociales
    * `/login` Formulario de acceso
    * `/admin` Dashboard admin (protegido)

---

## Estado Actual del MVP

### Ya implementado

* Catálogo con filtros y tarjetas de producto.
* Detalle con stock por talla, cantidades limitadas y medidas dinámicas.
* Carrito persistente y cupón de descuento.
* Checkout con creación de orden y validación atómica de stock.
* Confirmación con ticket de pedido.
* Login con validación de sesión para evitar falsos redirects al recargar.
* Dashboard admin con inventario, pedidos y productos.
* Moderación de reseñas, banners, cupones y ventas flash.

### Pendiente de formalización documental

* Diagramas de arquitectura.
* Prototipos UI/UX.
* Documento de despliegue y operación si el proyecto se extiende fuera del mock actual.

---

## Sprint 1: Escaparate y Catálogo (Customer Facing) ✅ COMPLETADO
**Objetivo:** Construir la experiencia de navegación para que el cliente pueda buscar, filtrar y ver detalles de la ropa.

* **Componentes Compartidos (UI):**
    * Implementar `Navbar` real (logo, buscador, contador del carrito, links a Nosotros/Contacto) y `Footer`
    * Construir `ProductCard` (imagen, nombre, precio, badge de oferta)
* **Vista: Página Principal (Home) — completar landing:**
    * Desarrollar `HeroBanner` con carrusel conectado a `MockBannerService.getActiveBanners()`
    * Desarrollar `FlashSaleTimer` con cuenta regresiva dinámica
    * Grid de categorías con productos destacados reales
* **Vista: Catálogo (`/catalogo`):**
    * Filtros por precio, talla, etiqueta y categoría
    * Conectar con `ProductService.getProducts()` — solo productos `estado: 'activo'`
    * Contador de resultados y estado visual de agotado
* **Vista: Detalle del Producto (`/producto/[slug]`):**
    * Galería de imágenes interactiva (carousel)
    * `DynamicMeasurementsTable` que renderiza `medidas_dinamicas` JSON
    * Selector de talla y color
    * Botón "Añadir al Carrito" conectado a `useCartStore`
    * `ReviewList` con reseñas aprobadas

---

## Sprint 2: Conversión y Checkout ✅ COMPLETADO
**Objetivo:** Permitir al usuario gestionar su carrito, aplicar cupones y finalizar la compra generando el ticket para WhatsApp.

* **Vista: Carrito de Compras (Drawer/Página `/carrito`):**
    * Lista de ítems con botones para modificar cantidades o eliminar
    * `CouponInput` conectado a `CouponService.applyCoupon()`
    * Resumen financiero con leyenda obligatoria **"Envío: por cobrar"**
* **Vista: Proceso de Pago (`/checkout`):**
    * Formulario de dirección de envío (React Hook Form + Zod)
    * Selector de método de pago (transferencia, QR, efectivo)
    * Conectar con `OrderService.createOrder()`
* **Vista: Confirmación de Pedido (`/checkout/confirmacion`):**
    * Mostrar ticket `TICK-XXXXXX`
    * Botón WhatsApp con mensaje precargado (número + ticket + resumen)
    * Descarga de ticket (simulada)

---

## Sprint 3: Autenticación y Perfil del Cliente ✅ COMPLETADO
**Objetivo:** Permitir el registro diferido, el seguimiento de compras y la interacción social (reseñas).

* **Módulo de Autenticación (`/login`):**
    * Formulario completo con React Hook Form + Zod
    * Simular flujos de OAuth (botones de Google y Facebook)
    * Lógica para fusionar el carrito de `localStorage` al hacer login (`mergeGuestCart`)
    * `RegisterModal` con creación de cuenta
* **Vista: Perfil del Cliente (`/perfil`):**
    * Tabla de historial de pedidos con `OrderStatusBadge`
    * Datos personales editables
* **Módulo de Reseñas:**
    * `ReviewForm` (calificación por estrellas, bloqueado sin compra verificada)
    * Conectar con `ReviewService.createReview()`
    * `ReviewList` en detalle de producto (solo `APROBADA`)

---

## Sprint 4: Panel de Administración (Backoffice) ✅ COMPLETADO
**Objetivo:** Construir las herramientas de gestión para los roles internos (Gerente, Despacho, Atención al Cliente).

* **Layout Administrativo:**
    * `AdminSidebar` y `AdminHeader` reales con control de acceso por rol (`RequireRole`)
* **Vista: Dashboard (`/admin`):**
    * Tarjetas de estadísticas (ventas del día, pedidos pendientes, stock bajo)
    * Ranking de los 10 productos más vendidos
    * `StockAlertFeed` conectado al `MockSocket`
* **Vista: Gestión de Productos (`/admin/productos`):**
    * `ProductForm` con agregador dinámico de medidas e imágenes múltiples
    * CRUD completo — crear, editar, cambiar `estado` (activo/inactivo)
* **Vista: Gestión de Pedidos (`/admin/pedidos`):**
    * Lista/Kanban de pedidos con avance de estado (sin retroceso)
    * Conectar con `OrderService.updateOrderStatus()`
* **Vista: Moderación y Marketing (`/admin/marketing`):**
    * Tabla de moderación de reseñas (`ReviewService.moderateReview()`)
    * CRUD de cupones (`CouponService`)
    * Gestión de banners (`BannerService.toggleBanner()`)
    * Formulario de configuración de Ventas Flash

---

## Cierre

El proyecto ya no está en fase de prototipo: tiene el flujo principal de compra, control de stock por talla y administración operativa suficiente para funcionar como MVP del negocio.
