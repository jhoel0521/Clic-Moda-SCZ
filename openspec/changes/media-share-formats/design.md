## Context

Las ventas nacen en enlaces compartidos (chat de WhatsApp, Facebook, X) y en piezas subidas a mano (estados, historias, reels). Las primeras leen etiquetas Open Graph del HTML del servidor; las segundas no leen nada, por eso hace falta un kit descargable. No hay almacenamiento de archivos en el sistema. Las fuentes consultadas sobre limites de cada canal son de 2026-11-11 y algunas de terceros; las medidas elegidas (1200x630 y 300 KB) quedan por debajo de los limites conocidos.

## Goals / Non-Goals

**Goals:** una foto, todos los formatos; recorte predecible y previsualizable; almacenamiento aislado; sin CORS; URLs estables y cacheables.
**Non-Goals:** edicion de imagen, video, CDN propio, fotos de catalogo, otros proveedores de almacenamiento.

## Decisions

**D1. Variantes al subir, no bajo demanda.** Evita un servicio de redimensionado expuesto, abusos por parametros y latencia en el primer visitante. Son pocas imagenes (decenas) y 6 variantes.

**D2. Formatos.** `link` 1200x630 JPEG <=300 KB; `square` 1080x1080; `portrait` 1080x1350 (4:5); `story` 1080x1920 (9:16; estado de WhatsApp, historias y reels usan el mismo archivo); `thumb` 320 px y `card` 800 px en WebP. JPEG para todo lo que sale de la tienda porque WebP no esta garantizado en los rastreadores.

**D3. Recorte puro compartido.** `computeCrop(src, format, focal, mode)` devuelve `{x, y, w, h}` o `{fit, background}`; vive en `shared/` del API y se copia como modulo puro con pruebas identicas en el admin (misma geometria, no mismos bytes). Modo `contain` para logos y fotos horizontales en `story`.

**D4. Entrega por la tienda.** `GET /m/:id/:formato-:rev.:ext` en Astro reenvia por red interna a `GET /media/:id/:formato-:rev.:ext` de la API, que lee de SeaweedFS. La tienda agrega nada: pasa cabeceras de cache. Es algo mas lento que servir directo, se compensa con `immutable` y `ETag`, y con Cloudflare gratuito delante si hace falta; a cambio no hay CORS, ni dominio extra, ni almacenamiento expuesto. Un proxy delante (Caddy/Nginx) que reenvie `/m/*` directo a la API es una variante futura sin cambiar ninguna URL.

**D5. SeaweedFS aislado.** Servicio en la red interna de Docker con bucket privado; en desarrollo publica `127.0.0.1:10002` (rango de infra de `ports.json`); en produccion no publica puertos. Credenciales en `.env` (nunca commiteadas). Cliente `@aws-sdk/client-s3`.

**D6. Procesamiento.** `sharp` con `limitInputPixels` ~50 MP, autoorient, sin EXIF, maestra <=3000 px, original descartado. Validacion por bytes (magic bytes). Subida `multipart` con limite de 12 MB.

**D7. Revisiones inmutables.** Clave de objeto `m/<id>/<formato>-<rev>.<ext>`. Cambiar el enfoque crea una revision nueva; se limpian las revisiones con mas de 30 dias y que no sean la vigente.

**D8. Zona segura.** Solo se dibuja en la vista previa; el archivo descargado va limpio.

## Ubicacion de piezas (services/api, contexto `media`)

| Capa | Piezas |
|---|---|
| domain | `MediaAsset`, `MediaVariant`; objetos de valor `MediaFormat`, `FocalPoint`, `AltText`, `ImageDimensions`, `Revision`; `computeCrop`; puerto `MediaAssetRepository` (+ token) |
| application | casos de uso `UploadMedia`, `ChangeFocalPoint`, `DeleteMedia`, `GetPublicVariant`, `ListMedia`; puertos `MediaStoragePort` e `ImageProcessorPort` (+ tokens); DTOs de aplicacion |
| infrastructure | `S3MediaStorage`, `DiskMediaStorage`, `SharpImageProcessor`, `TypeOrmMediaAssetRepository`, controladores `MediaAdminController` y `MediaPublicController`, DTOs HTTP y mappers |

Pruebas de contrato: `MediaStoragePort` (S3 contra SeaweedFS real en compose, disco, fake), `ImageProcessorPort` (sharp y fake), `MediaAssetRepository` (Postgres y fake).

## Risks / Trade-offs

- Pasar los bytes por Astro y la API gasta CPU -> cache inmutable, imagenes de <=300 KB, Cloudflare opcional.
- Limites de WhatsApp/Facebook pueden cambiar -> medidas con margen; se verifica con el depurador de cada canal antes de publicar.
- SeaweedFS es una pieza mas que operar -> adaptador de disco como respaldo.
- Recorte distinto entre API y admin -> pruebas con casos fijos compartidos.
