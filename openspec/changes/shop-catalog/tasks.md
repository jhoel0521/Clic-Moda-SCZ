## 1. Slug de producto (services/api, contexto catalog)

- [ ] 1.1 (domain) `Product` con `slug` (usa `Slug`): se calcula al registrar, no cambia al renombrar; pruebas de dominio (acentos, repetido, nombre largo recortado antes del sufijo)
- [ ] 1.2 (application) Unicidad: `RegisterProduct` pide el siguiente slug libre (`-2`, `-3`) mediante el puerto de repositorio; pruebas de caso de uso
- [ ] 1.3 (infrastructure) Migracion: columna `slug` con indice unico y relleno en TypeScript (`Slug.fromText`, orden `created_at`); prueba con nombres repetidos y con acentos
- [ ] 1.4 Contrato del repositorio: `findBySlug` y `slugExists` (fake y Postgres)

## 2. Fotos del producto (services/api)

- [ ] 2.1 (domain) `ProductPhotos` (0 a 8, sin repetidos, la primera es la principal) dentro de `Product`; pruebas de limites
- [ ] 2.2 (application) Puerto `MediaReferencesPort` del contexto catalog con `findByIds` (un solo viaje) y caso de uso `SetProductPhotos` (Gerente); errores por imagen
- [ ] 2.3 (media) `findByIds` en `MediaAssetsRepository` (fake y Postgres) con prueba de contrato
- [ ] 2.4 (infrastructure) Migracion `product_photos (product_id, position, media_id)`, repositorio y adaptador hacia `media` (sin clave foranea; se omiten las imagenes borradas)
- [ ] 2.5 (infrastructure) `PUT /catalog/products/:id/photos` solo Gerente; el detalle administrativo incluye las fotos; e2e de permisos, orden, duplicados, maximo y borrado de la imagen principal

## 3. Lectura publica (services/api)

- [ ] 3.1 (application) Casos de uso `ListPublicCatalog` (filtros, orden, paginacion, solo disponible), `GetPublicProduct`, `ListPublicFilters` y `ListPublishedSlugs`; DTO publico por lista blanca
- [ ] 3.2 (domain) Disponibilidad `in_stock` / `low` / `out` (umbral 3) y publicacion (producto, categoria y variante activos); pruebas
- [ ] 3.3 (infrastructure) Consultas en SQL con fotos en lote (sin N+1), precio del modelo y orden por precio
- [ ] 3.4 (infrastructure) `PublicCatalogController` en `/public/catalog` con `@Public()`, `ETag` fuerte, `Cache-Control: public, max-age=15` y 304
- [ ] 3.5 e2e con Postgres real: inactivos (producto, categoria, variante), sin campos internos (comparacion de claves), estados de disponibilidad, filtros, tope de 48, 404, 304 y conteo de consultas del listado de 48 productos
- [ ] 3.6 e2e del plazo: un movimiento procesado por la cola se ve como `out` en la lectura publica sin cache (la API no suma mas demora que su `max-age`)

## 4. Admin

- [ ] 4.1 (apps/admin) Componente nuevo `ProductPhotos`: seleccion multiple desde el modulo de imagenes, orden con botones de 48 px, quitar y marcar principal (la primera); fuera del `<form>` del producto y con su propio guardado `PUT`
- [ ] 4.2 (apps/admin) Subida de una imagen nueva desde la seccion reutilizando `UploadForm`
- [ ] 4.3 (apps/admin) Pruebas: sin `form form`, orden, maximo de 8, error de la API; flujo Playwright (escritorio y iPhone) con comprobacion de consola limpia
- [ ] 4.4 (apps/admin) ux-check de la seccion de fotos

## 5. Tienda: datos y utilidades (apps/shop)

- [ ] 5.1 (apps/shop) Cliente del catalogo con cache en memoria de 15 s por URL y respaldo al ultimo valor valido; pruebas con reloj falso
- [ ] 5.2 (apps/shop) Middleware de `ref` (minusculas, validacion, cookie de sesion) y su lectura; pruebas de formato, mayusculas y valores invalidos
- [ ] 5.3 (apps/shop) Armado del mensaje de WhatsApp (producto, talla, color, SKU, URL canonica y "Ref") y de la URL canonica sin `talla`, `color` ni `ref`; pruebas
- [ ] 5.4 (apps/shop) Serializador seguro de JSON-LD (`<` como `<`); prueba con un nombre `</script>` hostil

## 6. Tienda: paginas (apps/shop)

- [ ] 6.1 (apps/shop) Componentes: tarjeta de producto (foto 4:5 reservada, precio, aviso de disponibilidad), selector de talla y color como formulario GET, galeria con miniaturas y recuadro sin foto
- [ ] 6.2 (apps/shop) `/catalogo` con filtros por URL (categoria, talla, solo disponibles, orden), paginacion, estado vacio y mensaje de reintento si la API falla
- [ ] 6.3 (apps/shop) `/p/[slug]`: galeria, descripcion, precio en Bs, seleccion en la URL, boton de WhatsApp y barra inferior fija en telefono; 404 con enlace al catalogo
- [ ] 6.4 (apps/shop) SEO por producto: titulo, descripcion de respaldo, canonical sin parametros, `og:image` `link`, JSON-LD `Product`
- [ ] 6.5 (apps/shop) `/sitemap.xml` (con `ListPublishedSlugs`) y `/robots.txt`; portada con los productos mas nuevos y enlaces al catalogo en cabecera y pie
- [ ] 6.6 (apps/shop) Pruebas de paginas con el contenedor de Astro (HTML del servidor, escape, canonical, JSON-LD) y revision en navegador real a 360 px con un nombre de 60 caracteres (sin desborde, objetivos de 44 px)

## 7. Cierre

- [ ] 7.1 ux-check de la tienda (catalogo y detalle) y ux-plan-review del change antes de aplicar
- [ ] 7.2 README, `ARCHITECTURE.md` de la API (patron de lectura publica y fotos), ROADMAP (carrito, favoritos y cuentas como decision registrada) y `.ux` si cambia algun token
