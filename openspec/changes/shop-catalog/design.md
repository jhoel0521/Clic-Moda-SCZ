# Design

## Context

Estado actual verificado en el codigo:

- `catalog` (API) tiene `Product` (nombre, descripcion, activo, variantes) y `Category` (con `slug` y `active`). **El producto no tiene slug ni fotos.** Hay un solo precio por modelo (`set-product-price` lo fija en todas las variantes).
- El disponible se calcula como `on_hand - reserved` en `stock_levels`; el stock cambia por una cola de comandos que la API procesa en segundo plano (`STOCK_QUEUE_POLL_MS`, 200 ms por omision).
- `media` ya genera `card` (800x1000 WebP), `thumb` (320x320 WebP) y `link` (1200x630 JPEG) y expone `MediaAssetsRepository`; `settings` ya resolvio la misma necesidad con `MediaReferencesPort`.
- La tienda (Astro SSR) ya tiene layout con la marca como variables CSS, `SeoHead`, `seo.ts`, proxy `/m/*`, `getSettings()` con cache en memoria y enlaces de WhatsApp.
- `ProductForm.tsx` del admin envuelve todo en un `<form>`. El selector de imagenes actual (`ImagePicker`) es de una sola eleccion (radio) y trae un `UploadForm` (otro `<form>`).
- `.ux/standard/users.md` aun tiene marcadores sin completar: no hay glosario ni perfiles que aplicar; se usan los valores por omision de `.ux/knowledge`.

## Goals / Non-Goals

**Goals:** publicar el catalogo con fotos y stock real, con SEO por producto y enlaces que venden (WhatsApp con la eleccion hecha), sin guardar datos personales.

**Non-Goals:** carrito, lista de deseos, cuentas, reservas, cupones y pagos. Se decidio (ver abajo) que la compra no pide cuenta; todo eso va en `reservations-whatsapp-checkout` y en una cuenta opcional posterior. Este change no agrega ningun boton de favoritos ni de carrito.

## Decisions

**D1. Slug de producto: estable y unico.** Se agrega `slug` al agregado `Product` (objeto de valor `Slug` que ya existe) calculado al registrar y **nunca cambia al renombrar** (a diferencia del slug de categoria, que sigue al nombre: es un filtro, no un enlace que se comparta; es una diferencia deliberada). Unicidad: si existe, sufijo `-2`, `-3`; se recorta al maximo permitido **antes** de agregar el sufijo. La migracion rellena los slugs de los productos existentes **en TypeScript** con el mismo `Slug.fromText` (Postgres no tiene `unaccent`), en orden de `created_at` para que el resultado sea determinista, con indice unico.

**D2. Fotos en el agregado.** `Product` guarda `photos: MediaRef[]` (0 a 8, sin repetidos, la primera es la principal) y una tabla `product_photos (product_id, position, media_id)` con clave `(product_id, position)`. `PUT /catalog/products/:id/photos` reemplaza la lista completa (solo Gerente). La existencia y publicacion de cada imagen se valida con un puerto propio `MediaReferencesPort` del contexto `catalog` (mismo patron que `settings`, adaptador unico hacia `media`). No hay clave foranea hacia `media_assets`: borrar una imagen no debe fallar ni borrar fotos; el lector simplemente omite las que ya no existen y la siguiente pasa a ser la principal.

**D3. Sin N+1 al armar fotos.** Se agrega `findByIds(ids)` al puerto `MediaAssetsRepository` (una sola consulta) y al `MediaReferencesPort`; el listado resuelve **todas** las fotos de la pagina con una consulta. Tiene su prueba de contrato (fake y Postgres) y una e2e que cuenta consultas del listado de 48 productos.

**D4. Lectura publica separada de la administrativa.** Casos de uso nuevos `ListPublicCatalog`, `GetPublicProduct`, `ListPublicFilters` y `ListPublishedSlugs` en `catalog`, con sus propios DTO y un controlador `PublicCatalogController` en `/public/catalog` (`@Public()`). No se reutiliza el DTO del admin: el DTO publico se construye por lista blanca, de modo que un campo interno nuevo nunca se filtra por accidente (hay una prueba que compara las claves permitidas). La publicacion exige producto activo, categoria activa y al menos una variante activa.

**D5. Disponibilidad como estado.** `in_stock` (4 o mas), `low` (1 a 3), `out` (0). El umbral 3 es una constante del dominio. El filtro "solo disponible" y el orden por precio usan el precio del modelo (el minimo de sus variantes activas, que en la practica es unico). La consulta calcula todo en SQL con indices existentes y se cubre con un e2e con Postgres real.

**D6. Cache y plazo de 60 s.** La API responde con `ETag` fuerte (huella del cuerpo) y `Cache-Control: public, max-age=15`. La tienda agrega una cache en memoria de **15 s** por URL de API (mismo patron que `getSettings`) para no cargar la API cuando varios visitantes piden lo mismo, con respaldo al ultimo valor valido si la API falla. Peor caso entre "el stock cambia" y "el visitante lo ve" = demora de la cola (200 ms de sondeo mas el procesamiento) + 15 s + 15 s, es decir unos 30 s, dentro de los 60 s.

**D7. La eleccion de talla vive en la URL.** El detalle es `/p/<slug>?talla=38&color=Negro`: un formulario GET con radios y el boton "Elegir", mas mejora progresiva con un script pequeno que actualiza sin recargar. El boton de WhatsApp lo arma el servidor a partir de esos parametros, asi funciona sin JavaScript y el enlace se puede compartir. `canonical` y `og:url` son siempre `/p/<slug>` (sin `talla`, `color` ni `ref`) para que no haya paginas duplicadas.

**D8. Referencia de venta (`ref`).** Un middleware de la tienda lee `?ref=`, lo pasa a minusculas, lo valida (`^[a-z0-9_-]{1,32}$`) y lo guarda en una cookie de **sesion** propia (`ref`, `SameSite=Lax`, sin datos personales, sin enviarla a terceros). El mensaje de WhatsApp agrega "Ref: <codigo>". La medicion consiste en contar los chats por codigo. Funciona con y sin JavaScript.

**D9. JSON-LD seguro.** El bloque `application/ld+json` se serializa con `JSON.stringify` y se reemplaza `<` por `<` (y ` `/` `), porque `set:html` no escapa; hay una prueba con un nombre `</script>` hostil, igual que se hizo con `brandName`.

**D10. Formularios sin anidar (el error de hidratacion que ya tuvimos).** La seccion de fotos del admin es un componente **nuevo** (`ProductPhotos`, seleccion multiple con orden y botones de 48 px; el selector actual es de una sola eleccion y no sirve tal cual) y se renderiza **fuera** del `<form>` del producto: se guarda con su propio boton (`type="button"`) y su propia llamada `PUT`. La subida de una imagen nueva reutiliza `UploadForm`, que por esto tampoco queda dentro de ningun `<form>`. Se agregan desde el inicio una prueba unitaria "sin `form form`" y un flujo Playwright que falla si la consola muestra errores.

**D11. Imagenes sin saltos.** Tarjeta: `card` 800x1000 con `width`/`height` (relacion 4:5 reservada con `aspect-ratio`), `loading="lazy"` salvo las primeras dos. Detalle: la principal con `fetchpriority="high"` y sin lazy; miniaturas `thumb`. `og:image` es `link` de la foto principal; sin fotos, la imagen de compartir de la tienda. Sin foto: recuadro de reemplazo con el nombre.

**D12. Detalle en telefono: barra inferior fija.** En un telefono la foto 4:5 mas el nombre ocupan casi toda la pantalla de 740 px, asi que el boton no se promete "sin hacer scroll"; una barra inferior fija (con `padding-bottom: env(safe-area-inset-bottom)`) muestra "Consultar por WhatsApp" o "Elige tu talla" (que lleva al selector con un ancla). En escritorio el boton va junto al selector.

**D13. Sitemap.** `/sitemap.xml` y `/robots.txt` son rutas SSR de la tienda. El sitemap usa la lectura liviana `ListPublishedSlugs` (todos los slugs y `updatedAt`, sin el tope de 48 del listado) y la URL absoluta de `SITE_URL`.

**D14. Cuentas, carrito y favoritos (decision de producto, sin implementar aqui).** La compra y el carrito no necesitan cuenta: el carrito vivira en el navegador y el servidor revalidara el stock al crear el mensaje o la reserva; no se guarda ningun dato personal. Los favoritos pueden empezar en el navegador (sin cuenta) y, mas adelante, una cuenta **opcional** podria unirlos entre dispositivos. Se deja registrado y se confirma con el cliente antes de planificar `reservations-whatsapp-checkout` y la rebanada de cuentas.

**D15. Supuesto: donde se suben las fotos.** El Gerente las elige dentro del formulario del producto desde el modulo de imagenes (y puede subir una nueva ahi mismo, con el mismo `UploadForm`); no hay una segunda pantalla. Si prefiere subirlas solo desde `/imagenes`, la seccion funciona igual sin el bloque de subida.

## Risks / Trade-offs

- Listar 48 productos con fotos y stock es la consulta mas cara de la API publica -> consultas en lote (D3), cache de 15 s en dos capas y un e2e que cuenta consultas.
- El slug estable puede quedar desfasado del nombre -> es lo que evita romper enlaces ya compartidos en el Live; se puede reasignar a mano mas adelante si hace falta.
- Un rastreador que no ejecuta JavaScript solo ve la talla de la URL -> es suficiente: el contenido y el JSON-LD estan completos en el HTML del servidor.
- La cookie `ref` dura la sesion: quien vuelve otro dia sin el enlace pierde el codigo -> aceptable; el objetivo es medir los enlaces del Live, no seguir personas.
- La migracion de slugs corre una sola vez y es la unica parte que toca datos existentes -> se prueba contra una base con productos de nombres repetidos y con acentos.
