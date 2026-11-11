## Context

La API (NestJS, hexagonal) y el admin (Astro + React) ya existen con auth por roles; la tienda es un esqueleto Astro. Los textos de marca estaban en el codigo del prototipo y hay que sacarlos a datos. El ancho de la marca en movil es el riesgo de diseno principal.

## Goals / Non-Goals

**Goals:** una sola fuente de verdad para marca y contacto, lectura publica barata, validacion de contraste, render en servidor.
**Non-Goals:** pagos, multi-tienda, modo oscuro, catalogo en la tienda.

## Decisions

**D1. Una fila de configuracion.** Tabla `store_settings` con una unica fila (id fijo), sin historial; `PUT` reemplaza completo y rechaza por campo.

**D2. Limites de texto.** Nombre 2-24, eslogan <=60, titulo SEO 10-60, descripcion 70-160; son valores propuestos y se ajustan en una linea si el cliente pide otros.

**D3. Paleta derivada.** Se guarda solo el color primario; las variantes oscura, clara y suave se derivan con una funcion pura compartida (API valida, admin previsualiza y tienda aplica como variables CSS). Contraste con la utilidad de ux-kit (`contrast.mjs`) portada a modulo puro: texto blanco >=4.5:1 y contra el fondo (`bg` de `.ux/standard/tokens.json`, #ffffff en 0.2.0) >=3:1. Valor por omision #c7305a del estandar `.ux` 0.2.0. Color cercano sugerido: se conserva el matiz y se baja la luminosidad en pasos de 1 % hasta cumplir ambos umbrales; si no existe, se informa sin sugerencia. La variante "suave" (fondo claro) se valida con texto oscuro `text` a >=4.5:1.

**D4. Logo e imagen de compartir por referencia a medios.** La configuracion guarda `logoMediaId` y `shareMediaId`. La tienda arma la URL publica `/m/<id>/<formato>-<rev>.<ext>` (proxy de la tienda hacia `public/media/...` de la API). El logo usa un formato nuevo `logo` (WebP con transparencia, 640x320 `contain`), que se agrega al modulo de medios en este change (delta de `media-share-formats`); la imagen de compartir usa `link`. Si el asset no existe o no esta listo, el `PUT` responde 422 y la tienda cae al nombre en texto. Sin imagen de compartir se usa `link` del logo sobre el fondo; si tampoco hay logo, no se emite `og:image` y `twitter:card` queda en `summary`.

**D5. Lectura publica.** `GET /store-settings` (ruta abierta con el decorador `@Public()` del proyecto) con `ETag` fuerte (hash del cuerpo) y `Cache-Control: public, max-age=15`, sin `stale-while-revalidate`; la tienda hace cache en memoria 15 s y usa el ultimo valor valido si la API falla. Peor caso 15 + 15 = 30 s, dentro de los 60 s. Si nunca hubo un valor valido, usa la semilla.

**D5b. Errores y concurrencia.** `PUT` responde 401 sin sesion, 403 sin rol Gerente y 422 con errores por campo (`{ field, message }[]`); cada campo tiene un tope de tamano en el esquema HTTP (el cuerpo no pasa de unos KB); los textos se guardan sin etiquetas HTML y la tienda los escapa al pintar. Last write wins: es una sola fila editada por una persona (Gerente), y se documenta como riesgo aceptado.

**D6. Render en servidor.** El layout de Astro lee la configuracion en cada peticion SSR (con el cache de D5), inyecta variables CSS en `<html style>` y las etiquetas SEO en `<head>`; las de imagen usan `media-share-formats`.

**D7. Permiso.** Guardia de rol existente: `@Roles('GERENTE')` en el `PUT`, igual que `MediaAdminController`.

## Ubicacion de piezas (services/api, contexto `settings`)

| Capa | Piezas |
|---|---|
| domain | `StoreSettings`; objetos de valor `BrandName`, `Tagline`, `BrandColor`, `SeoTitle`, `SeoDescription`, `WhatsAppNumber`, `SocialUrl`; funcion `derivePalette`; puerto `StoreSettingsRepository` |
| application | casos de uso `GetPublicSettings`, `UpdateSettings`; DTOs de aplicacion; puerto `ContrastCheckerPort` si se requiere |
| infrastructure | `TypeOrmStoreSettingsRepository`, `StoreSettingsController`, DTOs HTTP con mappers, calculo de `ETag` |

Pruebas de contrato: `StoreSettingsRepository` (fake y Postgres).

## Risks / Trade-offs

- Nombre largo rompe la cabecera -> limite de 24 y prueba visual a 360 px.
- Las caches de 15 s (HTTP y tienda) retrasan cambios hasta 30 s -> dentro del margen de 60 s, con prueba.
- Depende de `media-share-formats` -> el logo y la imagen de compartir pueden quedar vacios al inicio y la tienda usa texto y la semilla.
