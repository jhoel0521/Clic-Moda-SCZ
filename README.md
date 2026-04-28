# 🛍️ Clic Moda SCZ - Frontend (SPA)

**Nuestra misión es construir "Clic Moda SCZ"**, una plataforma de fast fashion 100% digital diseñada para ventas ágiles, principalmente impulsadas desde redes sociales como TikTok. No estamos construyendo un e-commerce tradicional y pesado; el objetivo es ofrecer una experiencia de usuario sin fricciones, donde los clientes puedan navegar, visualizar medidas precisas de tallas para evitar dudas de compra, y llenar su carrito como invitados sin obligaciones de registro anticipado. Queremos que la tienda se sienta rápida, confiable y altamente visual.

**Estrategia Técnica:** El desarrollo de la interfaz completa (React + Vite) operará sobre una arquitectura de **Mock Backend**, permitiendo que el equipo programe toda la lógica de negocio, vistas, gestión de roles y notificaciones en tiempo real utilizando servicios simulados en memoria y localStorage sin depender de una API real. Al respetar nuestra arquitectura limpia y modular, conectar el backend real en el futuro será tan sencillo como cambiar un interruptor.

## 🛠️ Stack Tecnológico

* **Core:** React 18 + TypeScript
* **Build Tool:** Vite (compilación ultra rápida y HMR)
* **Estilos:** Tailwind CSS v3 (Utility-first) + Lucide React (Iconografía)
* **Enrutamiento:** React Router DOM v6
* **Estado Global:** Zustand (ligero, sin boilerplate)
* **Formularios:** React Hook Form + Zod (validación de esquemas)
* **Mocking:** Servicios simulados basados en Promesas con latencia artificial.

---

## 📂 Estructura de Carpetas (Arquitectura Modular por Dominios)

El proyecto sigue una adaptación estricta de *Feature-Sliced Design* (Diseño segmentado por características). **Regla de oro:** Un módulo no puede importar componentes internos de otro módulo directamente. Todo lo transversal vive en `shared/` o `core/`.

```text
📦 src
 ┣ 📂 assets               # Recursos estáticos (imágenes genéricas, fuentes, favicon)
 ┣ 📂 core                 # Reglas de negocio y configuraciones globales puras
 ┃ ┣ 📂 config             # Variables de entorno e inicializadores (ej: env.config.ts)
 ┃ ┣ 📂 constants          # Constantes globales (ej: ROLES.ts, ORDER_STATUS.ts)
 ┃ ┣ 📂 guards             # Protectores de rutas (RequireAuth.tsx, RequireRole.tsx)
 ┃ ┣ 📂 models             # Interfaces TypeScript de la BD (IProduct, IUser, IOrder)
 ┃ ┗ 📂 store              # Estado global que cruza múltiples módulos (useAuthStore.ts)
 ┃
 ┣ 📂 features             # Módulos principales del negocio (Aislados)
 ┃ ┣ 📂 admin              # -> Dominio: Panel de Gerente y Despacho
 ┃ ┃ ┣ 📂 components       # Componentes exclusivos del admin (ProductForm, DailyLedger)
 ┃ ┃ ┣ 📂 pages            # Vistas enrutables (DashboardPage, InventoryPage)
 ┃ ┃ ┗ 📂 store            # Estado local del admin (useAdminUIStore.ts)
 ┃ ┃
 ┃ ┣ 📂 catalog            # -> Dominio: Catálogo y Productos
 ┃ ┃ ┣ 📂 components       # ProductCard, DynamicMeasurementsTable, FiltersSidebar
 ┃ ┃ ┣ 📂 pages            # HomePage, ProductListPage, ProductDetailPage
 ┃ ┃ ┗ 📂 hooks            # Lógica encapsulada (useFlashSaleTimer.ts)
 ┃ ┃
 ┃ ┣ 📂 checkout           # -> Dominio: Compras y Pagos
 ┃ ┃ ┣ 📂 components       # CartDrawer, CouponInput, CheckoutSummary
 ┃ ┃ ┣ 📂 pages            # CheckoutPage, SuccessTicketPage
 ┃ ┃ ┗ 📂 store            # useCartStore.ts (Persistido en LocalStorage)
 ┃ ┃
 ┃ ┗ 📂 customer           # -> Dominio: Experiencia del Cliente logueado
 ┃   ┣ 📂 components       # OrderHistoryTable, ReviewForm
 ┃   ┗ 📂 pages            # ProfilePage, OrderTrackingPage
 ┃
 ┣ 📂 mocks                # EL BACKEND FALSO (Simulación de la API y DB)
 ┃ ┣ 📂 data               # Bases de datos en memoria (products.json, users.json)
 ┃ ┣ 📂 services           # Servicios falsos (MockAuthService.ts, MockOrderService.ts)
 ┃ ┣ 📂 utils              # Simuladores de latencia (delay.ts)
 ┃ ┗ 📜 MockSocket.ts      # Emulador de WebSockets (setInterval para eventos push)
 ┃
 ┣ 📂 routes               # Definición de rutas de la aplicación
 ┃ ┗ 📜 AppRouter.tsx      # Mapeo de URLs a las "Pages" de los features
 ┃
 ┣ 📂 shared               # Código transversal utilizado por cualquier feature
 ┃ ┣ 📂 hooks              # Custom hooks genéricos (useDebounce, useMediaQuery)
 ┃ ┣ 📂 ui                 # Componentes "tontos" (Button.tsx, Input.tsx, Modal.tsx, Badge.tsx)
 ┃ ┗ 📂 utils              # Funciones puras de ayuda (formatCurrency.ts, formatDate.ts)
 ┃
 ┣ 📜 App.tsx              # Raíz de Providers (Toasters, RouterProvider)
 ┗ 📜 main.tsx             # Punto de entrada de React (createRoot)
 ```
 