## ADDED Requirements

### Requirement: The shop lists products with filters
La tienda SHALL mostrar en `/catalogo` los productos publicados en tarjetas con foto principal, nombre, precio y aviso de disponibilidad, con filtros por categoria, talla, solo disponibles y orden, y paginacion. MUST funcionar sin JavaScript (los filtros son enlaces y un formulario GET) y conservar los filtros en la URL.

#### Scenario: Shareable filters
- **WHEN** el visitante filtra por categoria y talla
- **THEN** la URL contiene esos filtros y al abrirla otra persona ve el mismo resultado

#### Scenario: No results
- **WHEN** ningun producto cumple los filtros
- **THEN** la tienda lo dice con un mensaje claro y ofrece quitar los filtros

#### Scenario: API unavailable
- **WHEN** la API no responde
- **THEN** la tienda muestra un mensaje de reintento y no una pagina rota

### Requirement: A product page shows photos, sizes and price
La tienda SHALL mostrar en `/p/<slug>` la galeria de fotos (la principal primero), el nombre, la descripcion, el precio en bolivianos, el selector de talla y color con su disponibilidad y las tallas agotadas deshabilitadas. MUST responder 404 si el producto no esta publicado.

#### Scenario: Sold out size
- **WHEN** una talla esta agotada
- **THEN** se muestra marcada como agotada y no se puede elegir

#### Scenario: Product without photos
- **WHEN** el producto no tiene fotos
- **THEN** la pagina muestra un recuadro de reemplazo con el nombre y no una imagen rota

#### Scenario: Selection in the URL
- **WHEN** el visitante elige talla 38 y color Negro
- **THEN** la eleccion queda en la URL (`?talla=38&color=Negro`) y funciona sin JavaScript

#### Scenario: Gallery without JavaScript
- **WHEN** el visitante no tiene JavaScript
- **THEN** ve todas las fotos en columna y puede elegir talla con el formulario

### Requirement: Images are sized to avoid layout shifts
La tienda SHALL declarar ancho y alto en cada imagen, cargar con carga diferida las que estan fuera de la primera pantalla y priorizar la foto principal del detalle, de modo que la pagina no se desplace al cargar.

#### Scenario: Card images
- **WHEN** se carga el catalogo
- **THEN** cada tarjeta reserva el espacio de su foto antes de que cargue

### Requirement: Each product has its own search and share tags
La tienda SHALL emitir para cada producto, en el HTML del servidor, titulo, descripcion, URL canonica (siempre `/p/<slug>`, sin `talla`, `color` ni `ref`), `og:image` con el formato `link` de su foto principal (o la imagen de compartir de la tienda si no tiene fotos) y datos estructurados `Product` con nombre, imagenes, descripcion, SKU, precio en BOB y disponibilidad. MUST NOT emitir `noindex` en paginas publicadas.

#### Scenario: Structured data
- **WHEN** un rastreador pide la pagina de un producto
- **THEN** el HTML trae un bloque JSON-LD `Product` con la oferta y la disponibilidad

#### Scenario: Hostile name in structured data
- **WHEN** el nombre del producto contiene `</script>` u otro HTML
- **THEN** el bloque JSON-LD sigue siendo valido y no se sale de su etiqueta

#### Scenario: Description fallback
- **WHEN** el producto no tiene descripcion
- **THEN** la descripcion de busqueda se arma con su nombre, categoria y precio

### Requirement: The shop publishes a sitemap and robots file
La tienda SHALL publicar `/sitemap.xml` con la portada, el catalogo, contacto y cada producto publicado (con su fecha de actualizacion) y `/robots.txt` que lo referencia con la URL absoluta del sitio.

#### Scenario: Sitemap content
- **WHEN** un rastreador pide `/sitemap.xml`
- **THEN** recibe una entrada por cada producto publicado y ninguna de uno inactivo

### Requirement: Browsing is fast and comfortable on a phone
La tienda SHALL poder usarse con una mano en 360 px sin desplazamiento horizontal, con objetivos tactiles de al menos 44 px, texto de al menos 16 px en campos y contraste AA, usando los colores de la marca configurada.

#### Scenario: 360 px
- **WHEN** el visitante abre el catalogo y un producto con nombre de 60 caracteres a 360 px
- **THEN** no hay desplazamiento horizontal

#### Scenario: Call to action always reachable on a phone
- **WHEN** el visitante esta en el detalle en un telefono
- **THEN** una barra inferior fija muestra el boton de consulta (o "Elige tu talla", que lleva al selector) sin tapar el contenido

### Requirement: Navigation reaches the catalog
La tienda SHALL enlazar el catalogo desde la cabecera, el pie y la portada, y la portada MUST mostrar los productos mas nuevos.

#### Scenario: Home
- **WHEN** el visitante abre la portada
- **THEN** ve los productos mas nuevos y un enlace a todo el catalogo
