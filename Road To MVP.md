# Roadmap de Desarrollo Frontend: Clic Moda SCZ

## 🎯 Visión del Producto

Nuestro enfoque de negocio es implementar una automatización inteligente adaptada al mercado local de Santa Cruz. El sistema no calculará tarifas de envío automáticas; en su lugar, el flujo de compra generará un ticket claro que conectará directamente al cliente por WhatsApp para coordinar la entrega. Para la administración, entregaremos un panel de control (dashboard) potente para gestionar el catálogo dinámicamente, lanzar ventas flash y controlar el inventario con alertas en tiempo real. Nuestro objetivo final es entregar un producto escalable, moderno y listo para comenzar operaciones de venta inmediatamente.

---

## Sprint 0: Cimientos y Arquitectura Base
**Objetivo:** Configurar el esqueleto del proyecto, el estado global y los modelos de datos tipados basados en el diagrama relacional.

* **Configuración del Entorno:**
    * [cite_start]Inicializar proyecto con React 18, Vite y Tailwind CSS[cite: 741].
    * Configurar el enrutador (React Router) con protección de rutas base.
* **Modelos de Dominio (TypeScript Interfaces):**
    * [cite_start]Crear `IUser` con soporte para roles (Gerente, Despacho, Atención al Cliente, Cliente)[cite: 734].
    * [cite_start]Crear `IProduct` incluyendo el campo `medidas_dinamicas` tipo JSON y un array de `IImage`[cite: 768].
    * Crear `IOrder` y `IOrderItem`.
* **Estado Global (Zustand):**
    * Implementar `useAuthStore` para manejar la sesión del usuario ficticio.
    * [cite_start]Implementar `useCartStore` para manejar el carrito persistente mediante `localStorage` (mínimo 7 días)[cite: 618].
* **Capa de Servicios Falsos (Mock Backend):**
    * Crear `MockDatabase.ts` (almacenamiento en memoria usando arrays).
    * Crear `MockSocket.ts` para simular eventos en tiempo real mediante `setInterval` (ej. alertas de stock).

---

## Sprint 1: Escaparate y Catálogo (Customer Facing)
**Objetivo:** Construir la experiencia de navegación para que el cliente pueda buscar, filtrar y ver detalles de la ropa.

* **Componentes Compartidos (UI):**
    * Construir `Navbar` (logo, buscador, contador del carrito) y `Footer`.
    * Construir `ProductCard` (imagen, nombre, precio).
* **Vista: Página Principal (Home):**
    * Desarrollar el componente `HeroBanner` (carrusel de imágenes).
    * [cite_start]Desarrollar el componente `FlashSaleTimer` con cuenta regresiva dinámica[cite: 637].
    * Mostrar grillas de categorías destacadas.
* **Vista: Listado de Productos (Catálogo):**
    * [cite_start]Implementar `SidebarFilters` (precio, talla, color, estilo, material)[cite: 618].
    * Conectar el catálogo con `MockProductService.getProducts()`.
* **Vista: Detalle del Producto:**
    * Implementar galería de imágenes interactiva.
    * [cite_start]Desarrollar el componente `DynamicMeasurementsTable` que lea el JSON de medidas (mangas, hombros, cintura)[cite: 611].
    * Lógica del botón "Añadir al Carrito" conectada a Zustand.

---

## Sprint 2: Conversión y Checkout
**Objetivo:** Permitir al usuario gestionar su carrito, aplicar cupones y finalizar la compra generando el ticket para WhatsApp.

* **Vista: Carrito de Compras (Drawer/Página):**
    * Lista de ítems con botones para modificar cantidades o eliminar.
    * Desarrollar el componente `CouponInput` conectado a `MockMarketingService.validateCoupon()`.
    * [cite_start]Mostrar resumen financiero con la leyenda obligatoria "Envío: por cobrar"[cite: 623].
* **Vista: Proceso de Pago (Checkout):**
    * Formulario manual de dirección de envío.
    * Selector simulado de método de pago.
* **Vista: Confirmación de Pedido (Success Page):**
    * [cite_start]Lógica para generar el ID del ticket en formato `TICK-XXXXXX`[cite: 625].
    * [cite_start]Desarrollar el generador del enlace de WhatsApp precargado con el ticket[cite: 625].
    * Componente para descargar el ticket en PDF simulado.

---

## Sprint 3: Autenticación y Perfil del Cliente
**Objetivo:** Permitir el registro diferido, el seguimiento de compras y la interacción social (reseñas).

* **Módulo de Autenticación:**
    * Desarrollar `LoginModal` y `RegisterModal`.
    * [cite_start]Simular flujos de OAuth (botones de Google y Facebook) y validación de contraseñas[cite: 620].
    * [cite_start]Lógica para fusionar el carrito de `localStorage` a la cuenta recién creada[cite: 620].
* **Vista: Perfil del Cliente:**
    * Construir tabla de historial de pedidos.
    * [cite_start]Componente `OrderStatusBadge` para mostrar estados: "Procesado", "En preparación", "Listo para recoger / Enviando" y "Entregado"[cite: 627].
* **Módulo de Reseñas (Product Detail - Fase 2):**
    * [cite_start]Desarrollar `ReviewList` priorizando reseñas de compradores verificados[cite: 644].
    * [cite_start]Desarrollar `ReviewForm` (calificación por estrellas y subida de fotos, bloqueado si no hay compra verificada)[cite: 644].

---

## Sprint 4: Panel de Administración (Backoffice)
**Objetivo:** Construir las herramientas de gestión para los roles internos (Gerente, Despacho, Atención al Cliente).

* **Layout Administrativo:**
    * Construir `AdminSidebar` y `AdminHeader` con control de acceso basado en el rol del usuario.
* **Vista: Dashboard (Libro Diario):**
    * Construir tarjetas de estadísticas (ingresos, egresos, ventas).
    * [cite_start]Mostrar ranking de los 10 productos más vendidos[cite: 649].
    * [cite_start]Componente `StockAlertFeed` conectado al `MockSocket` para notificar bajo stock[cite: 615].
* **Vista: Gestión de Productos (CRUD):**
    * [cite_start]Desarrollar formulario complejo `ProductForm` con agregador dinámico de campos de medidas e imágenes múltiples[cite: 611].
* **Vista: Gestión de Pedidos (Despacho):**
    * [cite_start]Tabla Kanban o Lista para cambiar el estado de los pedidos sin opción a retroceder estados[cite: 630].
* **Vista: Moderación y Marketing:**
    * [cite_start]Tabla de moderación de fotos en estado "Pendiente"[cite: 646].
    * [cite_start]Formulario para creación de Cupones y configuración de Ventas Flash[cite: 635, 637].