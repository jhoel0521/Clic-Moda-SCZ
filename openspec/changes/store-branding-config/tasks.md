## 1. Dominio (services/api, contexto settings)

- [ ] 1.1 (domain) Objetos de valor `BrandName`, `Tagline`, `SeoTitle`, `SeoDescription`, `WhatsAppNumber`, `SocialUrl` con pruebas de limites
- [ ] 1.2 (domain) `BrandColor`, `derivePalette` y comprobacion de contraste AA con color cercano sugerido
- [ ] 1.3 (domain) Entidad `StoreSettings` con semilla "Clic Moda SC" y puerto `StoreSettingsRepository`

## 2. Aplicacion

- [ ] 2.1 (application) Caso de uso `GetPublicSettings` y su DTO publico (sin campos de pago)
- [ ] 2.2 (application) Caso de uso `UpdateSettings` con validacion completa y errores por campo

## 3. Infraestructura (API)

- [ ] 3.1 (infrastructure) Migracion `store_settings` (una fila) y `TypeOrmStoreSettingsRepository`
- [ ] 3.2 (infrastructure) `StoreSettingsController`: `GET` publico con `ETag` y `Cache-Control`, `PUT` solo Gerente
- [ ] 3.3 (infrastructure) Semilla de configuracion en `db:seed` y modulo registrado

## 4. Pruebas del API

- [ ] 4.1 Contrato del repositorio (fake y Postgres)
- [ ] 4.2 e2e: lectura anonima, 304, `PUT` permitido solo al Gerente, rechazos por campo y contraste

## 5. Admin

- [ ] 5.1 (apps/admin) Pantalla de configuracion: marca, SEO, contacto y redes
- [ ] 5.2 (apps/admin) Selector de logo e imagen de compartir con el modulo de medios
- [ ] 5.3 (apps/admin) Vista previa a 360 px y 1280 px y aviso de contraste
- [ ] 5.4 (apps/admin) Pruebas de componentes, flujo Playwright y ux-check

## 6. Tienda

- [ ] 6.1 (apps/shop) Cliente de `GET /store-settings` con cache de 30 s y respaldo al ultimo valor valido
- [ ] 6.2 (apps/shop) Layout SSR con variables CSS, cabecera (logo o texto), pie con contacto y redes
- [ ] 6.3 (apps/shop) Etiquetas SEO y Open Graph en el HTML; prueba de nombre de 24 caracteres a 360 px

## 7. Cierre

- [ ] 7.1 Actualizar README, ROADMAP y `.ux` si cambia algun token
