## ADDED Requirements

### Requirement: Images are uploaded once and validated
El sistema SHALL permitir al Gerente subir una imagen JPEG, PNG o WebP, y MUST validar el tipo por sus bytes (no por la extension), un peso de hasta 12 MB, hasta 50 megapixeles y un lado corto de al menos 600 px. MUST rechazar SVG, GIF, HEIC y cualquier otro formato.

#### Scenario: Valid photo
- **WHEN** el Gerente sube un JPEG de 3000x2000 y 4 MB
- **THEN** el sistema crea la imagen y genera sus variantes

#### Scenario: Wrong type
- **WHEN** el Gerente sube un archivo SVG o uno `.jpg` cuyos bytes no son JPEG
- **THEN** el sistema lo rechaza con un motivo claro y no guarda nada

#### Scenario: Too small or too heavy
- **WHEN** el Gerente sube una imagen de 400x300, de mas de 12 MB o de mas de 50 megapixeles
- **THEN** el sistema la rechaza indicando el limite incumplido

### Requirement: Uploads are normalized and private data is removed
El sistema SHALL corregir la orientacion, quitar los metadatos EXIF (incluida la ubicacion GPS) y conservar solo una copia maestra normalizada de hasta 3000 px por lado; MUST descartar el original sin procesar.

#### Scenario: Photo with GPS data
- **WHEN** se sube una foto del celular con ubicacion y orientacion rotada
- **THEN** la copia maestra queda derecha y sin ningun metadato EXIF

### Requirement: Every image has an alternative text
El sistema SHALL exigir un texto alternativo de 1 a 125 caracteres al crear una imagen y MUST usarlo como `alt` en la tienda y en `og:image:alt`.

#### Scenario: Missing alt
- **WHEN** el Gerente sube una imagen sin texto alternativo
- **THEN** el sistema la rechaza pidiendo el texto

### Requirement: The focal point drives the crop
El sistema SHALL guardar un punto de enfoque (focalX, focalY entre 0 y 1; por omision 0.5 y 0.5) por imagen y MUST permitir cambiarlo, regenerando las variantes con una nueva revision.

#### Scenario: Change the focal point
- **WHEN** el Gerente mueve el enfoque hacia el rostro o el zapato
- **THEN** todas las variantes se regeneran con ese centro y la revision aumenta en uno

### Requirement: Revisions are immutable and old ones are kept
El sistema SHALL identificar cada variante por imagen, formato y revision, MUST NOT modificar el contenido de una revision ya publicada y MUST conservar las revisiones anteriores al menos 30 dias.

#### Scenario: Old link keeps working
- **WHEN** se cambia el enfoque y alguien abre el enlace de la revision anterior dentro de 30 dias
- **THEN** recibe la imagen anterior sin error

### Requirement: Only managers manage images
El sistema SHALL permitir subir, editar y borrar imagenes solo al Gerente y MUST negar esas acciones a cualquier otro rol y a visitantes.

#### Scenario: Non-manager upload
- **WHEN** una persona de Atencion intenta subir una imagen
- **THEN** el sistema responde que no tiene permiso
