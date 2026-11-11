## Context

La API (NestJS, hexagonal) y el admin (Astro + React) ya existen con auth por roles; la tienda es un esqueleto Astro. Los textos de marca estaban en el codigo del prototipo y hay que sacarlos a datos. El ancho de la marca en movil es el riesgo de diseno principal.

## Goals / Non-Goals

**Goals:** una sola fuente de verdad para marca y contacto, lectura publica barata, validacion de contraste, render en servidor.
**Non-Goals:** pagos, multi-tienda, modo oscuro, catalogo en la tienda.

## Decisions

**D1. Una fila de configuracion.** Tabla `store_settings` con una unica fila (id fijo), sin historial; `PUT` reemplaza completo y rechaza por campo.

**D2. Limites de texto.** Nombre 2-24, eslogan <=60, titulo SEO 10-60, descripcion 70-160; son valores propuestos y se ajustan en una linea si el cliente pide otros.

**D3. Paleta derivada.** Se guarda solo el color primario; las variantes oscura, clara y suave se derivan con una funcion pura compartida (API valida, admin previsualiza y tienda aplica como variables CSS). Contraste con la utilidad de ux-kit (`contrast.mjs`) portada a modulo puro: texto blanco >=4.5:1 y contra el fondo >=3:1. Valor por omision #c7305a del estandar `.ux` 0.2.0.

**D4. Logo e imagen de compartir por referencia a medios.** La configuracion guarda `logoMediaId` y `shareMediaId`; la URL final se arma con `/m/<id>/<formato>-<rev>`. Un logo en `contain` evita recortes.

**D5. Lectura publica.** `GET /store-settings` con `ETag` fuerte y `Cache-Control: public, max-age=30, stale-while-revalidate=30`; la tienda hace cache en memoria 30 s y usa el ultimo valor valido si la API falla (cumple los 60 s).

**D6. Render en servidor.** El layout de Astro lee la configuracion en cada peticion SSR (con el cache de D5), inyecta variables CSS en `<html style>` y las etiquetas SEO en `<head>`; las de imagen usan `media-share-formats`.

**D7. Permiso.** Guardia de rol existente: `PUT` solo Gerente.

## Ubicacion de piezas (services/api, contexto `settings`)

| Capa | Piezas |
|---|---|
| domain | `StoreSettings`; objetos de valor `BrandName`, `Tagline`, `BrandColor`, `SeoTitle`, `SeoDescription`, `WhatsAppNumber`, `SocialUrl`; funcion `derivePalette`; puerto `StoreSettingsRepository` |
| application | casos de uso `GetPublicSettings`, `UpdateSettings`; DTOs de aplicacion; puerto `ContrastCheckerPort` si se requiere |
| infrastructure | `TypeOrmStoreSettingsRepository`, `StoreSettingsController`, DTOs HTTP con mappers, calculo de `ETag` |

Pruebas de contrato: `StoreSettingsRepository` (fake y Postgres).

## Risks / Trade-offs

- Nombre largo rompe la cabecera -> limite de 24 y prueba visual a 360 px.
- Cache de 30 s retrasa cambios -> dentro del margen de 60 s.
- Depende de `media-share-formats` -> el logo y la imagen de compartir pueden quedar vacios al inicio y la tienda usa texto y la semilla.
