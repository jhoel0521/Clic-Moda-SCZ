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

## Arquitectura

El proyecto usa App Router y separa responsabilidades entre UI, dominio y servicios:

```text
src/
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

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run pre-commit
```

## Validación

El flujo actual se valida con:

* `npm run lint`
* `npm run build`
* `npm run pre-commit`

## Próximos pasos

* Completar documentación visual de arquitectura y flujo UX.
* Preparar el backend real si el proyecto evoluciona fuera del mock.
* Mejorar analítica y control de inventario avanzado.
 