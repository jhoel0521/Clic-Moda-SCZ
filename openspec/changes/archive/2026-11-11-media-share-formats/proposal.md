## Why

La tienda vende en vivo y cierra por WhatsApp: casi todo el trafico llega por enlaces compartidos (chat, estados, Facebook, Instagram, TikTok). Cada canal pide una imagen distinta y hoy no hay ningun lugar donde guardar imagenes: ni la marca ni los productos tienen foto. "Un diseno superior vende mas": la imagen que sale en la vista previa del enlace es la primera impresion de la tienda.

## What Changes

- Un modulo `media` en la API que recibe una foto una vez y genera, al subirla, las variantes que cada canal necesita: `link` 1200x630 (vista previa de enlaces: WhatsApp chat, Facebook, X, Telegram), `square` 1080x1080, `portrait` 1080x1350 y `story` 1080x1920 (estados de WhatsApp, historias, reels), mas `thumb` y `card` en WebP para la tienda.
- Recorte determinista a partir de un punto de enfoque (focalX/focalY) y modo `contain` para fotos horizontales; el mismo calculo lo usa la API y la vista previa del admin.
- Almacenamiento en **SeaweedFS** (S3), aislado en la red interna de Docker, sin puertos publicos. Solo la API habla con el.
- Entrega publica por el dominio de la tienda: `https://<tienda>/m/<id>/<formato>-<rev>.<ext>`. Astro (SSR) reenvia `/m/*` a la API y la API lee de SeaweedFS; sin CORS y sin exponer el almacenamiento.
- Admin: subir foto, elegir formato, mover el punto de enfoque (con alternativas al arrastre), ver zonas seguras y avisos (resolucion baja, recorte excesivo, peso), y vista previa simulada de la tarjeta de WhatsApp, Facebook y X.
- Kit de compartir: descargar cada formato listo para subir a mano a estados e historias (esos canales no leen etiquetas), con zona segura configurable.
- Etiquetas de HTML que consumen el sistema: `og:image` con ancho, alto, tipo y alt.

## Capabilities

### New Capabilities
- `media-assets`: subida, validacion, normalizacion, enfoque, revisiones y borrado de imagenes.
- `media-share-formats`: formatos por canal, recorte determinista, kit de compartir y metadatos Open Graph.
- `media-storage`: almacenamiento privado en SeaweedFS y entrega publica con cache por la tienda.
- `media-admin-preview`: pantalla del admin para subir, encuadrar y previsualizar.

### Modified Capabilities
<!-- ninguna: no cambia requisitos de specs existentes -->

## Impact

- `services/api`: contexto nuevo `media` (domain/application/infrastructure), puertos `MediaStoragePort`, `ImageProcessorPort`, `MediaAssetRepository`; dependencia `sharp`; cliente S3 (`@aws-sdk/client-s3`); migracion con `media_asset` y `media_variant`.
- `apps/shop`: ruta `/m/[...path]` que reenvia a la API con cache.
- `apps/admin`: pantalla de imagenes con vista previa.
- Infra: servicio `seaweedfs` en `docker-compose.dev.yml` (puerto de dev solo en 127.0.0.1:10002, ninguno en produccion); `ports.json` y `.env.example`.
- Lo consume `store-branding-config` (logo e imagen de compartir) y el futuro catalogo de la tienda (fotos de producto).

## Fuera de alcance

- Fotos en el catalogo de productos y su pantalla (change aparte, usa este modulo).
- Video, GIF, SVG y HEIC; texto o precio dentro de las imagenes.
- Edicion de imagen (filtros, rotacion manual, fondo); CDN propio (se admite Cloudflare delante).
- Publicacion automatica en redes (solo se descarga el kit).
- Cloudflare R2 u otro proveedor: el puerto lo permite, pero no se implementa aqui.

## Fase del roadmap

Transversal a la rebanada 1 (marca y configuracion) y a la futura de catalogo en la tienda; se adelanta a ambas.
