# Proposal

## Why

La tienda ya tiene marca y contacto, pero no muestra ningun producto: el cliente todavia no puede ensenar su catalogo ni recibir consultas. Los productos, el stock y las fotos ya existen en la API y en el admin; falta publicarlos. Es lo primero que vera el cliente y lo que hace que un enlace compartido en el Live venda, por eso el diseno y el SEO son parte del alcance y no un extra.

## What Changes

- API: las fotos de un producto (varias, la primera es la principal) elegidas del modulo de imagenes; slug estable por producto; lectura publica del catalogo (`GET /public/catalog`, detalle por slug y filtros) que solo publica lo vendible y nunca expone costos, ubicaciones ni niveles de reposicion; cache corta con `ETag`.
- Admin: en el formulario del producto, una seccion de fotos para elegir, ordenar y quitar (reusa el selector de imagenes).
- Tienda: pagina de catalogo con filtros (categoria, talla, busqueda, orden) y paginacion; detalle de producto con galeria, tallas y colores con disponibilidad y precio en Bs; boton de WhatsApp con el producto, la talla y el color elegidos; SEO por producto (titulo, descripcion, `og:image`, JSON-LD `Product`), `sitemap.xml` y `robots.txt`; diseno cuidado y movil primero.
- Medicion de ventas por enlace: un parametro `ref` en cualquier enlace de la tienda (p. ej. `?ref=live-nov`) se recuerda en la visita y viaja en el mensaje de WhatsApp. No se guarda ningun dato personal.
- **No incluye**: carrito, reservas de stock, cupones ni cuentas (change `reservations-whatsapp-checkout`). La compra se cierra por WhatsApp con pago manual.

## Capabilities

### New Capabilities
- `product-photos`: fotos de un producto (varias, ordenadas, una principal) elegidas del modulo de imagenes y editadas por el Gerente.
- `public-catalog`: lectura publica del catalogo y del detalle por slug, con filtros, disponibilidad sin cifras internas y cache corta.
- `shop-catalog-pages`: paginas de catalogo y detalle de la tienda, galeria, SEO por producto, sitemap y diseno.
- `shop-product-inquiry`: enlace de WhatsApp con el producto elegido y medicion por `ref` sin datos personales.

### Modified Capabilities
- `product-catalog`: cada producto tiene un slug estable y unico (requisito agregado).

## Impact

- `services/api`: contexto `catalog` (slug y fotos en el agregado `Product`, casos de uso de lectura publica, controlador `/public/catalog`, migracion con relleno de slugs, tabla `product_photos`) y puerto hacia `media` (mismo patron que `settings`).
- `apps/admin`: formulario de producto (`ProductForm`) y un componente de fotos.
- `apps/shop`: paginas `/catalogo`, `/p/[slug]`, `/sitemap.xml`, `/robots.txt`, cliente del catalogo, componentes de tarjeta, galeria y selector de talla.
- Depende de `media-share-formats` (formatos `card`, `thumb`, `link`) y `store-branding-config` (marca, WhatsApp, SEO); ambos ya estan en `main`.
- Sin dependencias nuevas de paquetes.
