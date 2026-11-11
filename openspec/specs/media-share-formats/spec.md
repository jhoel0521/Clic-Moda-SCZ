# media-share-formats Specification

## Purpose
TBD - created by archiving change media-share-formats. Update Purpose after archive.

## Requirements

### Requirement: One image yields the formats each channel needs
El sistema SHALL generar al subir: `link` 1200x630 (JPEG, hasta 300 KB), `square` 1080x1080 (JPEG), `portrait` 1080x1350 (JPEG) y `story` 1080x1920 (JPEG), mas `thumb` y `card` en WebP para la tienda. MUST NOT generar variantes bajo demanda por parametros de la URL.

#### Scenario: Variants on upload
- **WHEN** se sube una foto valida
- **THEN** existen las seis variantes con sus medidas exactas antes de responder que quedo lista

#### Scenario: Link preview weight
- **WHEN** se genera `link`
- **THEN** pesa 300 KB o menos y su proporcion es 1.91:1

### Requirement: The crop is deterministic and shared
El sistema SHALL calcular el recorte con una unica funcion pura (x, y, ancho, alto) a partir de medidas de origen, formato y punto de enfoque, y MUST usar la misma geometria en la API y en la vista previa del admin.

#### Scenario: Same geometry
- **WHEN** la API y el admin calculan el recorte de la misma foto, formato y enfoque
- **THEN** obtienen las mismas coordenadas

### Requirement: Landscape shoes and logos can be fitted instead of cropped
El sistema SHALL ofrecer el modo `contain` (imagen completa sobre fondo de color) para `story` y para logos, y MUST usarlo por omision en el logo.

#### Scenario: Wide shoe in a story
- **WHEN** se genera `story` de una foto horizontal con modo `contain`
- **THEN** el zapato aparece completo y el fondo ocupa el resto, sin recortarlo

### Requirement: The share kit is downloadable
El sistema SHALL ofrecer, por imagen, la descarga de cada formato listo para subir a mano a estados, historias, reels o publicaciones, y SHALL permitir un solo archivo `story` con zonas seguras superpuestas solo en la vista previa, nunca en el archivo descargado.

#### Scenario: Download for a status
- **WHEN** el Gerente descarga el formato `story`
- **THEN** recibe un JPEG de 1080x1920 sin marcas ni guias dibujadas

### Requirement: Safe zones are configurable
El sistema SHALL mostrar en la vista previa del formato `story` una zona segura por omision de 14 % arriba, 35 % abajo y 6 % a los lados, configurable, para que nada importante quede bajo la interfaz de cada app.

#### Scenario: Default overlay
- **WHEN** el Gerente abre la vista previa de `story`
- **THEN** ve marcadas las zonas superior, inferior y laterales con su porcentaje

### Requirement: Pages expose complete Open Graph tags
El sistema SHALL emitir en el HTML del servidor, sin JavaScript, `og:title`, `og:description`, `og:url`, `og:image` (URL absoluta https), `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt` y `twitter:card=summary_large_image`, con la imagen `link` de la pagina o la de la marca como respaldo.

#### Scenario: Product page
- **WHEN** un rastreador pide una pagina con imagen propia
- **THEN** el HTML trae las etiquetas dentro de los primeros 300 KB y `og:image` apunta a su variante `link`

#### Scenario: No page image
- **WHEN** la pagina no tiene imagen
- **THEN** `og:image` usa la imagen de compartir de la marca

### Requirement: A logo format keeps transparency
El sistema SHALL generar al subir, ademas de los formatos existentes, `logo` en WebP con transparencia, que quepa completo en 640x320 (modo `contain` sin fondo), y MUST servirlo por la misma ruta publica inmutable de las demas variantes.

#### Scenario: Logo with transparent background
- **WHEN** se sube un PNG con fondo transparente
- **THEN** `logo` conserva la transparencia y mantiene la proporcion original dentro de 640x320

#### Scenario: Logo from a JPEG
- **WHEN** se sube un JPEG como logo
- **THEN** `logo` se genera igualmente, sin recortar la imagen
