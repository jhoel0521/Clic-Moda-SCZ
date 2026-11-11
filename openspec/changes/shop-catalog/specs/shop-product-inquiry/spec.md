## ADDED Requirements

### Requirement: The inquiry button opens WhatsApp with the chosen product
La tienda SHALL ofrecer en el detalle un boton que abre WhatsApp al numero de la configuracion con un mensaje que incluye el nombre del producto, la talla, el color, el SKU de la variante y la direccion (URL) de la pagina. MUST NOT habilitar el boton hasta que se elija una talla disponible.

#### Scenario: Message content
- **WHEN** el visitante elige talla 38 color Negro y toca el boton
- **THEN** WhatsApp abre con un mensaje que nombra el producto, talla 38, color Negro, el SKU y el enlace

#### Scenario: Selection from the URL
- **WHEN** se abre `/p/bota-andes?talla=38&color=Negro`
- **THEN** el servidor renderiza el boton de WhatsApp con esa talla y ese color ya elegidos, sin necesitar JavaScript

#### Scenario: No size chosen
- **WHEN** el visitante no ha elegido talla
- **THEN** el boton esta deshabilitado y un texto explica que debe elegir una talla

#### Scenario: Sold out product
- **WHEN** todas las tallas del producto estan agotadas
- **THEN** el boton dice "Preguntar cuando vuelve" y abre WhatsApp con el producto, sin talla

#### Scenario: Shop without WhatsApp
- **WHEN** la configuracion no tiene un numero de WhatsApp valido
- **THEN** no se muestra el boton de consulta

### Requirement: A reference code travels with the visit
La tienda SHALL aceptar el parametro `ref` en cualquier pagina (de 1 a 32 caracteres entre letras, digitos, guion y guion bajo; se pasa a minusculas antes de validar), recordarlo durante la visita en una cookie propia de sesion (funciona con y sin JavaScript) y agregarlo al mensaje de WhatsApp como "Ref: <codigo>". MUST ignorar cualquier valor que no cumpla ese formato.

#### Scenario: Live link
- **WHEN** el visitante entra por `/p/bota-andes?ref=live-nov` y luego navega a otro producto
- **THEN** el mensaje de WhatsApp de ese otro producto incluye "Ref: live-nov"

#### Scenario: Case is normalized
- **WHEN** el enlace trae `?ref=Live-Nov`
- **THEN** el mensaje lleva "Ref: live-nov"

#### Scenario: Reference does not duplicate pages
- **WHEN** dos visitantes abren el mismo producto con distinta referencia
- **THEN** ambos ven la misma URL canonica sin `ref`

#### Scenario: Invalid reference
- **WHEN** el parametro `ref` trae espacios, simbolos o mas de 32 caracteres
- **THEN** se ignora y el mensaje no lleva referencia

### Requirement: Tracking stores no personal data
La tienda MUST NOT guardar nombre, telefono, direccion IP ni identificadores de persona para medir ventas. La referencia SHALL guardarse solo en una cookie de sesion del navegador del visitante (sin enviarla a terceros), y la medicion consiste en contar los chats por codigo de referencia.

#### Scenario: What is stored
- **WHEN** el visitante entra con un codigo de referencia
- **THEN** lo unico que se recuerda es ese codigo, sin datos de la persona

### Requirement: Product links use the slug
La tienda SHALL usar el slug del producto en su direccion (`/p/<slug>`) y MUST responder 404 ante un slug desconocido o de un producto no publicado.

#### Scenario: Unknown slug
- **WHEN** el visitante abre `/p/no-existe`
- **THEN** la tienda responde 404 con una pagina que ofrece volver al catalogo
