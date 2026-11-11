## ADDED Requirements

### Requirement: Every product has a stable unique slug
El sistema SHALL asignar a cada producto, al registrarlo, un slug derivado de su nombre (minusculas, sin acentos, palabras separadas por guion), unico en todo el catalogo (agregando un sufijo numerico si ya existe) y MUST conservarlo aunque el producto se renombre, para que los enlaces compartidos no se rompan. Los productos existentes SHALL recibir su slug al actualizar el sistema.

#### Scenario: Slug from the name
- **WHEN** el Gerente registra "Bota Andes Coñac"
- **THEN** el producto queda con el slug `bota-andes-conac`

#### Scenario: Name collision
- **WHEN** ya existe `bota-andes` y se registra otro producto con ese nombre
- **THEN** el nuevo recibe `bota-andes-2`

#### Scenario: Rename keeps the slug
- **WHEN** el Gerente renombra el producto
- **THEN** su slug no cambia

#### Scenario: Existing products
- **WHEN** se actualiza el sistema con productos ya registrados
- **THEN** cada uno recibe un slug unico sin intervencion manual
