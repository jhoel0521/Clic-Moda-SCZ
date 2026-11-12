## ADDED Requirements

### Requirement: The shop lists products with filters
La tienda SHALL mostrar en `/catalogo` los productos publicados en tarjetas con foto principal, nombre, precio (con "Desde" si las tallas o colores cuestan distinto) y aviso de disponibilidad, con filtros por categoria, talla, solo disponibles y orden, y paginacion. MUST funcionar sin JavaScript (los filtros son enlaces y un formulario GET) y conservar los filtros en la URL.

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
La tienda SHALL mostrar en `/p/<slug>` la galeria de fotos (la principal primero), el nombre, la descripcion, el precio en bolivianos de la variante elegida, el selector de talla y color con su disponibilidad y las tallas agotadas deshabilitadas. MUST responder 404 si el producto no esta publicado.

#### Scenario: Sold out size
- **WHEN** una talla esta agotada y el producto tiene otras tallas disponibles
- **THEN** esa talla no se muestra (la consulta de reposicion se hace por WhatsApp)

#### Scenario: Product without photos
- **WHEN** el producto no tiene fotos
- **THEN** la pagina muestra un recuadro de reemplazo con el nombre y no una imagen rota

#### Scenario: Selection in the URL
- **WHEN** el visitante elige talla 38 y color Negro
- **THEN** la eleccion queda en la URL (`?talla=38&color=Negro`) y funciona sin JavaScript

#### Scenario: Gallery without JavaScript
- **WHEN** el visitante no tiene JavaScript
- **THEN** ve todas las fotos en columna y puede elegir talla con el formulario

### Requirement: The size and color selector is accessible
La tienda SHALL presentar la talla y el color como grupos con titulo ("Talla", "Color"), con opciones de al menos 44 px, nombrando cada color con texto, marcando la opcion elegida con borde y marca (no solo color) y mostrando "Agotada" con texto en las opciones sin stock. MUST mantener un foco visible y poder usarse solo con teclado.

#### Scenario: Sold out option
- **WHEN** todas las tallas del producto estan agotadas
- **THEN** se muestran desactivadas con el texto "Agotada" (no dependen solo del color ni del tachado) y el boton pregunta cuando vuelve

#### Scenario: Keyboard
- **WHEN** el visitante usa solo el teclado
- **THEN** puede recorrer las opciones, elegir una y ver el foco en todo momento

### Requirement: Filters stay out of the way on a phone
La tienda SHALL mostrar en un telefono los filtros dentro de un panel plegable con el resumen "Filtrar (N)", los filtros activos como chips que se quitan con un toque, la cantidad de productos y el orden, y MUST conservar los filtros en los enlaces de paginacion (`rel="prev"` y `rel="next"`).

#### Scenario: Active filters
- **WHEN** hay dos filtros activos
- **THEN** el panel dice "Filtrar (2)" y cada filtro se ve como un chip que se quita con un toque

### Requirement: The gallery has controls and text alternatives
La tienda SHALL ofrecer en la galeria botones "Foto anterior" y "Foto siguiente" ademas de deslizar, miniaturas tocables, el texto alternativo de cada imagen (o "<producto>, foto N de M" si falta) y el anuncio de la posicion de la foto activa.

#### Scenario: Without swiping
- **WHEN** el visitante no puede deslizar
- **THEN** cambia de foto con los botones o las miniaturas

### Requirement: Availability and prices use clear words
La tienda SHALL mostrar "Ultimas unidades" para `low` y "Agotada" para `out`, siempre con texto o icono ademas del color, y los precios como "Bs 349,90" con formato de Bolivia. MUST incluir en el pie una linea que diga que no se guardan datos personales.

#### Scenario: Low stock wording
- **WHEN** una talla tiene `low`
- **THEN** se lee "Ultimas unidades" y no se muestra ninguna cantidad

### Requirement: The fixed bar never hides focus
La tienda SHALL dejar en el detalle un margen inferior igual a la altura de la barra fija y un `scroll-padding-bottom` equivalente para que el elemento enfocado nunca quede detras de ella, y el ancla "Elige tu talla" MUST llevar el foco al selector.

#### Scenario: Tabbing to the end
- **WHEN** el visitante tabula hasta el ultimo elemento del detalle
- **THEN** el elemento enfocado queda visible por encima de la barra

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

### Requirement: The price always says what it applies to
La tienda SHALL mostrar el precio junto a una nota que diga a que aplica, aunque todas las variantes cuesten lo mismo. MUST mostrar el precio de cada opcion cuando los precios difieren, repetirlo en la barra fija del telefono e incluir en el mensaje de WhatsApp el de la variante elegida; los datos estructurados SHALL llevar el de cada variante.

#### Scenario: Chosen variant
- **WHEN** el visitante elige la talla 37 en rojo y esa variante cuesta 350
- **THEN** ve "Bs 350,00" con la nota "Talla 37 · Rojo" y el mensaje de WhatsApp incluye "Precio: Bs 350,00"

#### Scenario: Not chosen yet, prices differ
- **WHEN** el visitante abre un producto cuyas tallas cuestan distinto y aun no elige
- **THEN** ve "Desde Bs 305,00" y la invitacion a elegir talla y color

#### Scenario: Same price everywhere
- **WHEN** todas las variantes cuestan lo mismo
- **THEN** ve el precio con la nota "El mismo precio en todas las tallas y colores"

### Requirement: Each card shows a concrete variant
La tienda SHALL mostrar en cada tarjeta una variante concreta: su precio, su talla, su color y las tallas de ese color como enlaces al detalle con la talla y el color elegidos. MUST elegir la variante mas barata que se pueda comprar y MUST NOT mostrar tallas ni colores agotados mientras haya otros disponibles.

#### Scenario: Card content
- **WHEN** un modelo tiene la sandalia roja talla 36 a 305 y la talla 37 a 350
- **THEN** la tarjeta muestra "Bs 305,00 · Talla 36", "Color: Rojo" y las tallas 36 y 37, cada una con su enlace

#### Scenario: Sold out size
- **WHEN** una talla o un color esta agotado y quedan otros disponibles
- **THEN** la tarjeta no los muestra; si todo el modelo esta agotado, no ofrece tallas ni colores y lleva al detalle sin elegir

