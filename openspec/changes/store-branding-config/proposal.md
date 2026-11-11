# Proposal

## Why

La tienda está en beta para el MVP y la clienta aún no define el nombre definitivo ("Verashoe" es provisional). Hoy cambiar nombre, logo o colores exige editar código en más de 15 sitios y volver a desplegar, porque la configuración vive en variables `NEXT_PUBLIC_*` fijadas en build y en una paleta repartida entre `tailwind.config.ts` y ~28 hex sueltos. Hace falta que la identidad de la tienda sea un dato editable y servido por la API, no código.

## What Changes

- Un único módulo de configuración de la tienda que reemplaza todos los textos y valores de marca hardcodeados ("Clic Moda SCZ", WhatsApp, datos bancarios, QR) y el uso de `env.config.ts` para esos datos.
- Nombre provisional **Verashoe**, usado como valor por defecto de la configuración.
- Logo configurable (imagen), con la marca de texto como alternativa mientras no exista logo.
- Paleta de marca configurable que se aplica como variables CSS; los hex sueltos de `globals.css`, `login`, `contacto` y `StoreFooter` pasan a usar los tokens.
- Validación de contraste WCAG AA de los colores elegidos antes de guardarlos.
- Entrega de la configuración con caché: lectura pública cacheada e invalidación al guardar.
- Implementación en dos etapas: (1) en la shop, con un adaptador que lee de env/mock; (2) con la API real, `GET` público de la configuración y edición desde `apps/admin`.
- **BREAKING**: las variables `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_BANK_*` y `NEXT_PUBLIC_PAYMENT_QR_URL` dejan de ser la fuente de verdad; quedan solo como valores iniciales (seed) de la etapa 1.

## Capabilities

### New Capabilities
- `store-branding`: identidad visual de la tienda (nombre, logo, paleta) y su aplicación consistente en toda la shop, con validación de contraste AA al editar.
- `store-contact-payment`: datos de contacto y cobro que la tienda muestra al cliente (WhatsApp, dirección, datos bancarios, QR) y su exposición controlada.
- `store-settings-delivery`: entrega de la configuración a los clientes con caché, valores por defecto si la fuente falla e invalidación inmediata al guardar.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío; no hay capacidades existentes que modificar. -->

## Impact

- **Shop (`apps/shop`)**: `src/core/config/env.config.ts`, `src/app/layout.tsx` (metadata), `StoreNavbar`, `StoreFooter`, `AdminSidebar`, páginas `nosotros`, `contacto`, `checkout`, `pedidos/[id]`, `login`, `tailwind.config.ts` y `globals.css`; nuevo contrato `IStoreSettingsService`, servicio en `backend/` y ruta bajo `/api`, siguiendo el patrón actual de contrato → servicio → ruta → fachada.
- **API (`services/api`)**: etapa 2; endpoint público de lectura y endpoint protegido de escritura.
- **Admin (`apps/admin`)**: etapa 2; pantalla de edición con vista previa y chequeo de contraste.
- **Datos**: nueva entidad de configuración de tienda (una sola fila) en `docs/database.dbml`.
- **Seguridad**: los datos bancarios hoy viajan en el bundle público; el diseño debe decidir si se sirven solo a clientes con un pedido pendiente.
- **Rendimiento/UX**: la configuración se lee en cada página; debe cachearse para no añadir latencia ni parpadeo de colores.
- **Fase del roadmap**: F1 (API base) para la configuración y el endpoint, y F4 (Admin) para la pantalla de edición; la etapa 1 en la shop puede adelantarse sin depender de ellas.
- **Fuera de alcance**: multi-tienda o multi-tenant, modo oscuro, pasarela de pago, subida y almacenamiento de imágenes (el logo se referencia por URL en esta iteración), editor visual de layout, internacionalización de textos y la copia comercial completa de las páginas (solo se parametrizan nombre y datos de contacto).

## Assumptions

- Una única tienda por despliegue; la configuración es un registro único.
- El nombre "Verashoe" es un valor por defecto y se reemplaza sin tocar código.
- La paleta editable parte de un color primario de marca y deriva el resto (variantes clara, oscura y sutil); no se editan todos los tokens a mano.
- El rosa actual de la demo (`#e63f6e`) da 3.96:1 con texto blanco y no cumple AA, la regla que este cambio impone. El color por defecto se ajusta a uno cercano que sí cumple (propuesto `#d43a65`, 4.57:1): es un cambio visual mínimo sobre la demo aprobada y debe confirmarse con el cliente.
- Los datos de pago salen del payload público y solo se sirven en checkout y en el detalle del pedido propio. Hoy son públicos porque viajan en el bundle (`NEXT_PUBLIC_*`); cerrarlo es una decisión de seguridad tomada aquí por defecto.
- Las rutas `/api/*` actuales no tienen control de acceso (el proxy solo cubre páginas). Este cambio protege únicamente las rutas nuevas de configuración y de datos de pago; proteger el resto es un cambio aparte.
