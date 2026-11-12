## ADDED Requirements

### Requirement: A product has ordered photos chosen from the media module
El sistema SHALL permitir asociar a un producto hasta 8 fotos del modulo de imagenes, en un orden definido, donde la primera es la foto principal. MUST guardar solo la referencia a cada imagen (no copiarla) y rechazar una imagen que no exista o no este publicada.

#### Scenario: Photos in order
- **WHEN** el Gerente guarda las fotos A, B y C de un producto
- **THEN** el producto devuelve A, B y C en ese orden y A es la principal

#### Scenario: Unknown image
- **WHEN** el Gerente intenta guardar una foto que no existe o no esta publicada
- **THEN** el sistema rechaza el cambio indicando que imagen falla y no modifica las fotos del producto

#### Scenario: Too many photos
- **WHEN** el Gerente intenta guardar 9 fotos
- **THEN** el sistema lo rechaza indicando el maximo de 8

### Requirement: Photos are replaced as a whole and never repeated
El sistema SHALL reemplazar la lista completa de fotos en cada guardado, MUST rechazar la misma imagen dos veces en un producto y permitir dejar el producto sin fotos.

#### Scenario: Reorder
- **WHEN** el Gerente guarda las fotos en el orden C, A
- **THEN** el producto queda con C como principal y B ya no aparece

#### Scenario: Duplicate photo
- **WHEN** la lista trae la misma imagen dos veces
- **THEN** el sistema la rechaza indicando la repeticion

### Requirement: Only the Manager manages product photos
El sistema SHALL permitir cambiar las fotos de un producto solo al Gerente y MUST permitir verlas a todo el personal con el detalle del producto.

#### Scenario: Another role
- **WHEN** Despacho o Atencion intenta cambiar las fotos
- **THEN** el sistema responde 403 y no cambia nada

### Requirement: Deleting an image does not break the product
El sistema SHALL omitir de un producto la foto cuya imagen se borro del modulo de imagenes, sin error, y MUST pasar a ser principal la siguiente foto restante.

#### Scenario: Main photo deleted
- **WHEN** se borra la imagen principal de un producto que tiene otra foto
- **THEN** el producto sigue disponible y la siguiente foto pasa a ser la principal

### Requirement: The photo editor is clear and announces changes
El panel de administracion SHALL marcar la foto principal con la etiqueta "Principal", anunciar cada cambio de orden (por ejemplo "Foto movida a la posicion 2"), mostrar "Guardando..." sin permitir doble envio, aclarar que quitar una foto del producto no borra la imagen del modulo de imagenes y mostrar el error de la imagen que falla.

#### Scenario: Reordering
- **WHEN** el Gerente mueve una foto con los botones
- **THEN** el panel anuncia su nueva posicion y la etiqueta "Principal" sigue a la primera foto

#### Scenario: Removing a photo
- **WHEN** el Gerente quita una foto del producto
- **THEN** la imagen sigue existiendo en el modulo de imagenes y se puede volver a elegir

#### Scenario: Opposite actions are separated
- **WHEN** el Gerente ve los botones de una foto (subir, bajar, quitar)
- **THEN** cada boton mide al menos 44 px, hay al menos 8 px entre ellos y 16 px entre mover y quitar

#### Scenario: How the flow ends
- **WHEN** el Gerente guarda las fotos
- **THEN** el panel anuncia que se guardaron y que las fotos quitadas siguen disponibles en el modulo de imagenes
