## Why

La marca, el logo, los textos y las redes de la tienda deben cambiarse desde un modulo de configuracion y no desde el codigo: el cliente aun no define su nombre y el negocio se cierra por WhatsApp, asi que el contacto es lo central. "Un diseno superior vende mas": nombre y logo deben verse bien en 360 px y en escritorio, y el SEO debe salir del servidor.

## What Changes

- Contexto `settings` en `services/api`: `GET /store-settings` (publico, con `ETag` y cache) y `PUT /store-settings` (solo Gerente), con semilla "Clic Moda SC".
- Marca: nombre (2-24), eslogan (<=60), logo subido por el modulo de medios, color primario con validacion de contraste AA.
- SEO: titulo (10-60), descripcion (70-160) e imagen de compartir (formato `link` de `media-share-formats`).
- Contacto: WhatsApp internacional, direccion y horario de recojo, redes opcionales. **No se guardan datos de pago**: el pago se coordina por WhatsApp.
- Admin: pantalla de configuracion con vista previa (360 px y 1280 px) y validacion de contraste.
- Tienda: esqueleto SSR de Astro que lee `GET /store-settings` y muestra nombre, logo, colores, contacto y las etiquetas SEO en el HTML.
- Renombra la capacidad `store-contact-payment` a `store-contact` y retira todo lo de pago, QR, banco y Next.js del plan anterior.

## Capabilities

### New Capabilities
- `store-branding`: nombre, logo, paleta, SEO y vista previa.
- `store-contact`: WhatsApp, almacen, horario y redes.
- `store-settings-delivery`: lectura publica cacheada, escritura del Gerente, render en servidor y valores por defecto.

### Modified Capabilities
<!-- ninguna -->

## Impact

- `services/api`: contexto `settings` (domain/application/infrastructure), migracion `store_settings`, semilla.
- `apps/admin`: pantalla de configuracion.
- `apps/shop`: esqueleto con layout, cabecera, pie y SEO leyendo la API.
- Depende de `media-share-formats` para el logo y la imagen de compartir.

## Fuera de alcance

- Datos de pago, pasarela, NIT y facturacion.
- Catalogo, carrito y pedidos de la tienda (otro change).
- Varias tiendas, modo oscuro, idiomas.
- Cupones por Live y medicion de ventas por enlace.

## Fase del roadmap

Rebanada 1 (marca y configuracion); se implementa despues de `media-share-formats`.
