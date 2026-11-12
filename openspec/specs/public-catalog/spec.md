# public-catalog Specification

## Purpose
TBD - created by archiving change shop-catalog. Update Purpose after archive.

## Requirements

### Requirement: Only sellable products are public
El sistema SHALL publicar sin sesion unicamente los productos activos que tengan al menos una variante activa, y dentro de cada producto solo las variantes activas. MUST NOT publicar productos inactivos ni sus variantes inactivas.

#### Scenario: Inactive product
- **WHEN** un visitante pide el catalogo y un producto esta inactivo
- **THEN** ese producto no aparece ni en el listado ni por su slug (404)

#### Scenario: Inactive category
- **WHEN** la categoria de un producto esta inactiva
- **THEN** sus productos no se publican (ni en el listado ni por slug) y la categoria no aparece entre los filtros

#### Scenario: Inactive variant
- **WHEN** una variante de un producto activo esta inactiva
- **THEN** la talla y el color de esa variante no se muestran

### Requirement: The public catalog never exposes internal data
El sistema SHALL devolver al visitante solo nombre, slug, descripcion, categoria, fotos, el precio de cada variante, el menor precio del modelo con un indicador de que varia, variantes (talla, color, SKU, precio y disponibilidad) y fechas de actualizacion. MUST NOT devolver costos, ubicaciones del almacen, niveles de reposicion, cantidades exactas de stock, movimientos ni identificadores internos de stock.

#### Scenario: No internal fields
- **WHEN** un visitante consulta el listado o el detalle
- **THEN** la respuesta no contiene ubicacion, nivel de reposicion, cantidad en mano ni reservada

### Requirement: Availability is a status, not a count
El sistema SHALL informar la disponibilidad de cada variante como `in_stock`, `low` (de 1 a 3 unidades) o `out`, calculada con el disponible (en mano menos reservado), y MUST informar el mismo estado agregado por producto (`out` solo si todas sus variantes estan agotadas).

#### Scenario: Low stock
- **WHEN** una variante tiene 2 unidades disponibles
- **THEN** su disponibilidad es `low` y no se informa el numero 2

#### Scenario: Sold out product
- **WHEN** todas las variantes activas de un producto tienen 0 disponibles
- **THEN** el producto sigue publicado con disponibilidad `out`

### Requirement: The catalog can be filtered, searched and sorted
El sistema SHALL listar con paginacion (por omision 12, maximo 48) y permitir filtrar por categoria (slug), talla y texto en el nombre, y ordenar por novedad, precio ascendente o precio descendente (por el menor precio del modelo). MUST permitir pedir solo lo disponible.

#### Scenario: Filter by size
- **WHEN** el visitante filtra por la talla 38
- **THEN** recibe solo productos con una variante activa de esa talla

#### Scenario: Only available
- **WHEN** el visitante pide solo lo disponible
- **THEN** no recibe productos con disponibilidad `out`

#### Scenario: Page size limit
- **WHEN** el visitante pide 500 productos por pagina
- **THEN** el sistema devuelve como maximo 48 e indica el total

### Requirement: The filters can be discovered
El sistema SHALL devolver las categorias con productos publicados (con su conteo) y las tallas existentes entre las variantes publicadas, ordenadas, para armar los filtros de la tienda.

#### Scenario: Empty category
- **WHEN** una categoria no tiene productos publicados
- **THEN** no aparece entre los filtros

### Requirement: All published slugs can be listed cheaply
El sistema SHALL ofrecer una lectura liviana con todos los slugs publicados y su fecha de actualizacion (para el sitemap), sin paginar por el limite de 48 del listado.

#### Scenario: Large catalog
- **WHEN** hay mas de 48 productos publicados
- **THEN** la lectura liviana devuelve el slug y la fecha de todos

### Requirement: A product is found by its slug
El sistema SHALL devolver el detalle de un producto publicado por su slug, con todas sus fotos y variantes, y responder 404 si el slug no existe o el producto no esta publicado.

#### Scenario: Unknown slug
- **WHEN** el visitante pide un slug que no existe
- **THEN** el sistema responde 404

### Requirement: Public reads are cached briefly
El sistema SHALL responder las lecturas publicas con `ETag` y una cache de 15 segundos como maximo, de modo que un cambio de stock o de precio sea visible en menos de 60 segundos, y responder 304 sin cuerpo cuando el `ETag` coincide.

#### Scenario: Unchanged
- **WHEN** el visitante repite la peticion con el `ETag` recibido y nada cambio
- **THEN** el sistema responde 304

#### Scenario: Stock changes
- **WHEN** el personal registra una salida y la cola de stock la procesa
- **THEN** la tienda muestra esa talla como `out` a mas tardar 30 segundos despues de procesada (cache de la API 15 s mas cache de la tienda 15 s)

### Requirement: Every variant carries its own price
El sistema SHALL devolver el precio propio de cada variante (talla y color) y, en cada producto, su menor precio y un indicador `priceVaries` que es verdadero cuando las variantes activas no cuestan lo mismo. MUST NOT dar por hecho un precio unico por modelo.

#### Scenario: Different prices
- **WHEN** la sandalia roja talla 36 cuesta 305 y la talla 37 cuesta 350
- **THEN** cada variante informa su precio y el producto informa 305 con `priceVaries` verdadero

#### Scenario: Same price
- **WHEN** todas las variantes cuestan lo mismo
- **THEN** `priceVaries` es falso
