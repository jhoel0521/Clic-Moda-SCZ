## 0. Medios: formato de logo

- [x] 0.1 (media, domain+infra) Formato `logo` (WebP con transparencia, 640x320 `contain` sin fondo), servido por la ruta publica existente; pruebas de dominio, de contrato y e2e con un PNG transparente

## 1. Dominio (services/api, contexto settings)

- [x] 1.1 (domain) Objetos de valor `BrandName`, `Tagline`, `SeoTitle`, `SeoDescription`, `WhatsAppNumber` (solo digitos, 10-15), `SocialUrl`, `MapUrl` (https, 300), `Address` (160) y `PickupHours` (120) con pruebas de limites
- [x] 1.2 (domain) `BrandColor`, `derivePalette` y comprobacion de contraste AA con color cercano sugerido (mismo matiz, luminosidad decreciente)
- [x] 1.3 (domain) Entidad `StoreSettings` con semilla "Clic Moda SC" y puerto `StoreSettingsRepository`

## 2. Aplicacion

- [x] 2.1 (application) Caso de uso `GetPublicSettings` y su DTO publico (sin campos de pago)
- [x] 2.2 (application) Caso de uso `UpdateSettings` con validacion completa, errores por campo y comprobacion de que `logoMediaId` y `shareMediaId` existen y estan listos

## 3. Infraestructura (API)

- [x] 3.1 (infrastructure) Migracion `store_settings` (una fila) y `TypeOrmStoreSettingsRepository`
- [x] 3.2 (infrastructure) `StoreSettingsController`: `GET` con `@Public()`, `ETag` fuerte (hash del cuerpo) y `Cache-Control: public, max-age=15`; `PUT` con `@Roles('GERENTE')`, 401/403/422 y tope de tamano por campo en el esquema HTTP
- [x] 3.3 (infrastructure) Semilla de configuracion en `db:seed` y modulo registrado

## 4. Pruebas del API

- [x] 4.1 Contrato del repositorio (fake y Postgres)
- [x] 4.2 e2e: lectura anonima, 304 con `If-None-Match`, `PUT` permitido solo al Gerente, rechazos por campo y por contraste, asset inexistente y cambio visible en la siguiente lectura

## 5. Admin

- [ ] 5.1 (apps/admin) Ruta `configuracion.astro` con entrada de navegacion solo para Gerente y pantalla: marca, SEO, contacto y redes
- [ ] 5.2 (apps/admin) Selector de logo e imagen de compartir reutilizando la lista y la subida de `MediaBoard`/`media.ts`
- [ ] 5.3 (apps/admin) Vista previa a 360 px y 1280 px y aviso de contraste (usa la misma funcion pura de la API)
- [ ] 5.4 (apps/admin) Pruebas de componentes y de la funcion de paleta con casos fijos iguales a los de la API
- [ ] 5.5 (apps/admin) Flujo Playwright (guardar, rechazo por contraste, permisos de Despacho y Atencion) y ux-check

## 6. Tienda

- [ ] 6.1 (apps/shop) Cliente de `GET /store-settings` con cache de 15 s, respaldo al ultimo valor valido y a la semilla si nunca hubo uno
- [ ] 6.2 (apps/shop) Layout SSR con variables CSS, `lang="es-BO"`, `theme-color`, cabecera (logo o texto) y pie con contacto y redes
- [ ] 6.3 (apps/shop) Pagina de contacto (WhatsApp, direccion, horario, mapa) y enlaces `wa.me` con mensaje, todos desde la configuracion
- [ ] 6.4 (apps/shop) Reutilizar `SeoHead`/`seo.ts` con la imagen de compartir de la configuracion; prueba de nombre de 24 caracteres a 360 px y de la ventana de 60 s

## 7. Cierre

- [ ] 7.1 Actualizar README, ROADMAP (quitar "datos de cobro" y el endpoint de validacion de la Rebanada 1) y `.ux` si cambia algun token
