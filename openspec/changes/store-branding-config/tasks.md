# Tasks

> Alcance de estas tareas: **etapa 1** (en `apps/shop`, con `data/db.json` como fuente). La etapa 2 (API real y `apps/admin`) está en "Workflow follow-up". Color por defecto asumido: `#d43a65` (ver design.md, Open Questions); si no se aprueba, solo cambia la constante de la tarea 2.1.

## 1. Herramientas de prueba

- [ ] 1.1 Añadir Vitest a `apps/shop` (`pnpm --dir apps/shop add -D vitest`), con script `test` y un test de humo; verificar que `pnpm --dir apps/shop test` pasa y que `pnpm build:shop` no se rompe.

## 2. Dominio y colores (funciones puras)

- [ ] 2.1 Crear `IStoreSettings` y `DEFAULT_STORE_SETTINGS` (nombre `Verashoe`, color `#d43a65`, sin logo) y el esquema Zod de validación (nombre 1–60 caracteres; WhatsApp solo dígitos, 8–15; logo URL https opcional; color hex); verificar con tests de valores válidos e inválidos.
- [ ] 2.2 Implementar `deriveBrandPalette(primary)` (oscura, clara y sutil con alfa 12 %); verificar con tests de que es determinista y de que la variante oscura es más oscura que el primario.
- [ ] 2.3 Implementar `checkBrandContrast(primary)` (blanco/primario ≥ 4.5 y primario/fondo `#fff9fb` ≥ 3, con razón obtenida y color sugerido más cercano que cumple); verificar con tests que `#e63f6e` da 3.96:1 y falla, que `#d43a65` pasa (4.57:1) y que la sugerencia para el primero también pasa.

## 3. Servicio, autorización y rutas

- [ ] 3.1 Añadir la clave `storeSettings` a `data/db.json` sembrada desde los `NEXT_PUBLIC_*` actuales (con respaldo a los valores por defecto) y los helpers necesarios en `backend/db/db.ts`; documentar la tabla `STORE_SETTINGS` en `docs/database.dbml`; verificar leyendo el registro desde un test.
- [ ] 3.2 Crear `IStoreSettingsService` y `StoreSettingsService` con `getPublic()` (sin datos de pago), `getPaymentInfo()` y `update()` (valida el esquema y rechaza colores que fallan `checkBrandContrast`, sin guardar nada parcial); verificar con tests de cada escenario del spec `store-branding` y `store-contact-payment`.
- [ ] 3.3 Crear el helper de servidor `requireSession(req, { role })` sobre la cookie `clic-moda-session` y `AuthService`; verificar con tests de usuario anónimo, cliente, gerente y dueño/no dueño de un pedido.
- [ ] 3.4 Crear las rutas `GET /api/store-settings` (pública), `PUT /api/store-settings` (solo gerente; 401/403 y 400 con error por campo) y `GET /api/store-settings/payment` (cliente con sesión); verificar con tests de los handlers que la respuesta pública no contiene banco ni QR y que un cliente no puede escribir.
- [ ] 3.5 Exportar el servicio en la fachada `services/index.ts` y actualizar `.env.example` (los datos de marca y pago pasan a ser solo semilla); verificar que `pnpm build:shop` compila.

## 4. Tema y primer pintado

- [ ] 4.1 Leer la configuración en el layout raíz con una función cacheada por petición, exponerla con un provider de cliente y pasar `metadata` a `generateMetadata` con plantilla `%s | {nombre}`; verificar con `pnpm build:shop` y comprobando que el HTML servido contiene el nombre configurado en `<title>`.
- [ ] 4.2 Inyectar en el `<head>` el `<style>` con `:root{--brand, --brand-dark, --brand-light, --brand-subtle}` y apuntar `brand.*` de `tailwind.config.ts` a esas variables; verificar que el HTML inicial ya trae las variables y que `bg-brand/10` genera un color con transparencia en el CSS compilado.
- [ ] 4.3 Sustituir los hex de marca sueltos en `globals.css`, `login/page.tsx`, `contacto/page.tsx` y `StoreFooter.tsx` por los tokens/variables, y mover los colores de terceros (Facebook, Google, Instagram) a un único archivo de constantes; verificar con `grep` que no quedan hex de la paleta de marca fuera de los archivos de tema y revisando visualmente la home, el login y el footer con la paleta por defecto.

## 5. Marca en la interfaz

- [ ] 5.1 Crear el componente `StoreLogo` (`<img>` con `alt`, tamaño fijo y caída al nombre en texto si falta o falla la imagen) y usarlo en el navbar y el footer; verificar con un test de render que muestra el texto cuando no hay logo o falla la carga.
- [ ] 5.2 Reemplazar las 15 menciones de "Clic Moda SCZ" por la configuración (navbar, footer, títulos de `nosotros`, `contacto`, producto y home, sidebar del admin, ticket y mensajes de WhatsApp); verificar con `grep` que el literal ya no aparece en `apps/shop/src` fuera de la configuración por defecto.
- [ ] 5.3 Añadir la regla ESLint `no-restricted-syntax` contra literales "Clic Moda"/"Verashoe" y hex de marca fuera de los módulos de configuración y tema; verificar que un archivo de prueba con el literal falla el lint y que `pnpm lint:all` queda sin errores.

## 6. Contacto y pagos

- [ ] 6.1 Usar el WhatsApp y la dirección de la configuración en checkout, confirmación, pedido, resumen del carrito, `nosotros`, `contacto` y footer, omitiendo el bloque de dirección cuando no exista; verificar con tests de los enlaces generados y revisando que no aparece texto de relleno.
- [ ] 6.2 Servir banco y QR solo desde el endpoint autenticado en el checkout y en `pedidos/[id]`, mostrar el mensaje neutro "coordiná el pago por WhatsApp" cuando no haya QR y retirar `bank` y `paymentQrUrl` de `env.config.ts`; verificar con `grep` que el bundle (`.next/static`) no contiene los datos bancarios por defecto y que el texto "NEXT_PUBLIC_PAYMENT_QR_URL" ya no aparece en la interfaz.

## 7. Pantalla de administración

- [ ] 7.1 Crear `/admin/configuracion` con formulario (React Hook Form + Zod) y una Server Action que guarda y llama a `updateTag('store-settings')`; verificar que, tras guardar, un recorrido por la tienda en la misma sesión muestra el nombre y el color nuevos.
- [ ] 7.2 Añadir la vista previa en vivo y el mensaje de contraste (razón obtenida y color sugerido) usando `checkBrandContrast`; verificar que un color inválido no se guarda y muestra los datos, y ejecutar `ux-check` sobre los archivos nuevos sin hallazgos bloqueantes.
- [ ] 7.3 Añadir el enlace "Configuración" en `AdminSidebar` mostrando el nombre configurado; verificar navegando desde el panel.

## 8. Integración

- [ ] 8.1 Recorrer los escenarios de los tres specs contra la aplicación en marcha (nombre por defecto y cambiado, logo roto, color rechazado y aceptado, respuesta pública sin pago, pedido ajeno denegado, fuente caída con valores por defecto) y registrar el resultado de cada uno.
- [ ] 8.2 Ejecutar `pnpm lint:all`, `pnpm build:all` y `pnpm --dir apps/shop test`, y comprobar a mano que el flujo de la demo (catálogo → carrito → checkout → ticket por WhatsApp) sigue funcionando igual que antes del cambio.

## Workflow follow-up

- Etapa 2 (depende de `services/api`, F1, y de `apps/admin`, F4): cambiar el adaptador de lectura a `GET /store-settings` con `fetch(..., { next: { revalidate: 60, tags: ['store-settings'] } })`, `Cache-Control` + `ETag` en la API, webhook protegido que ejecuta `revalidateTag('store-settings', 'max')`, y mover la pantalla de edición a `apps/admin`; comprobar con una prueba que tras el webhook la siguiente visita ya trae el valor nuevo.
- Abrir un cambio aparte `api-route-authorization` para proteger el resto de rutas `/api/*` (hoy sin control de acceso) antes de salir a producción.
- Confirmar con el cliente el nombre, el logo, el color por defecto y si el Gerente es el único editor.
- Archivar el change tras la revisión y verificar el resultado archivado.
