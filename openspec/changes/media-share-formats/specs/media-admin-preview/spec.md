## ADDED Requirements

### Requirement: The manager frames each format with a live preview
El admin SHALL permitir subir una imagen, elegir el formato y ver el recorte resultante con la misma geometria que la API, a 360 px y a 1280 px sin desplazamiento horizontal.

#### Scenario: Switch format
- **WHEN** el Gerente cambia de `link` a `story`
- **THEN** la vista previa muestra el recorte de `story` con el mismo enfoque

### Requirement: The focal point has non-drag alternatives
El admin SHALL permitir mover el punto de enfoque arrastrando o con el dedo y tambien con controles de teclado y botones (arriba, abajo, izquierda, derecha, centrar), con objetivos tactiles de 44 px o mas.

#### Scenario: Keyboard only
- **WHEN** el Gerente usa solo el teclado sobre el selector de enfoque
- **THEN** puede mover el punto con las flechas y la vista previa se actualiza

### Requirement: The preview warns about poor results
El admin SHALL avisar cuando la resolucion es menor que 1080 px de lado corto, cuando el recorte muestra menos del 50 % de la foto y cuando una variante supera su peso recomendado, sin impedir guardar.

#### Scenario: Aggressive crop
- **WHEN** el formato `story` de una foto horizontal muestra menos del 50 % de la imagen
- **THEN** aparece un aviso que sugiere el modo `contain`

### Requirement: Link cards are simulated
El admin SHALL mostrar como se veria la tarjeta de enlace en WhatsApp, Facebook y X con el titulo, la descripcion y el dominio reales.

#### Scenario: Card preview
- **WHEN** el Gerente abre la vista previa de compartir
- **THEN** ve las tres tarjetas con la imagen `link`, el titulo y la descripcion

### Requirement: The share kit can be shared from a phone
El admin SHALL ofrecer descargar cada formato y, si el navegador lo permite, compartirlo con la API Web Share.

#### Scenario: Share on mobile
- **WHEN** el Gerente toca compartir en `story` desde un celular compatible
- **THEN** se abre el menu del sistema con el archivo adjunto
