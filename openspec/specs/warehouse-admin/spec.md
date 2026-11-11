# warehouse-admin Specification

## Purpose
Dar al personal un panel de administración, pensado primero para el celular y usable también en computadora, para mantener categorías y modelos y operar el almacén desde una sola pantalla de Inventario, mostrando con claridad que los cambios de stock se procesan en cola.

## Requirements

### Requirement: Admin access requires sign-in and shows only what the role allows
El panel SHALL exigir iniciar sesión con una cuenta del personal y MUST mostrar solo las acciones que el rol permite: el Gerente ve todo, Despacho mueve el stock y cambia el estante pero no cambia precios ni registra modelos, y Atención no ve acciones que modifican nada. Un acceso directo sin sesión MUST llevar a iniciar sesión, y las rutas del panel hacia la API MUST responder 401 sin sesión.

#### Scenario: Not signed in
- **WHEN** alguien abre una pantalla del panel sin sesión
- **THEN** es llevado a iniciar sesión y, tras hacerlo, vuelve a la pantalla pedida

#### Scenario: Role limits
- **WHEN** un usuario Atención abre un modelo del inventario
- **THEN** ve el stock y los movimientos pero no los botones de ingreso, retiro ni ajuste, ni el precio ni el estante editables

### Requirement: Categories and models can be managed from the panel
El panel SHALL permitir al Gerente crear, editar y borrar (si no tienen productos) categorías, y registrar y editar modelos con sus variantes de color y talla. Cada formulario MUST validar antes de enviar y mostrar el error del servidor junto al campo correspondiente.

#### Scenario: Register a model with variants
- **WHEN** el Gerente completa el formulario con 3 tallas y lo guarda
- **THEN** el modelo aparece en el inventario con sus 3 variantes y SKU

#### Scenario: Server error shown at the field
- **WHEN** el servidor rechaza un SKU duplicado
- **THEN** el formulario conserva los datos y muestra el error junto al campo SKU

### Requirement: The inventory screen shows each model as a color-by-size matrix
El panel SHALL unir productos y almacén en una sola pantalla de Inventario: un resumen (modelos, pares, variantes agotadas y con stock bajo), una lista paginada de modelos con búsqueda por modelo o SKU y filtros por categoría y stock, y, al abrir un modelo, una matriz con los colores en filas y las tallas en columnas donde cada celda muestra el disponible de esa variante. El estado de una celda (agotada, stock bajo o inactiva) MUST informarse también en su nombre accesible y en una leyenda visible, sin depender solo del color.

#### Scenario: Open a model
- **WHEN** el personal abre un modelo con 2 colores y 5 tallas
- **THEN** ve una matriz de 2 filas y 5 columnas con el disponible en cada celda y el total por color

#### Scenario: Alerts are not color only
- **WHEN** una variante está agotada
- **THEN** su celda se marca en rojo y su nombre accesible incluye "agotada"

#### Scenario: Filter by sold-out
- **WHEN** el personal filtra por "con variantes agotadas"
- **THEN** la lista muestra los modelos que tienen alguna variante activa agotada, con cuántas son

### Requirement: Stock is operated from a matrix cell through the queue
Al tocar una celda, el panel SHALL permitir ingresos, retiros y ajustes con motivo y mostrar el historial de movimientos de esa variante (tipo, cantidad, motivo y fecha). Tras enviar, el panel MUST mostrar el comando como "En cola" y actualizarlo hasta su estado final, informando con claridad si fue aplicado o rechazado y por qué. El panel MUST evitar el doble envío por doble clic y enviar siempre una clave de idempotencia.

#### Scenario: Receive and see the result
- **WHEN** Despacho registra un ingreso de 12 unidades
- **THEN** el panel muestra "En cola" y luego "Listo: el stock ya se actualizó" y la celda refleja el nuevo disponible

#### Scenario: Rejected shown clearly
- **WHEN** una salida es rechazada por stock insuficiente
- **THEN** el panel muestra "No hay stock suficiente disponible" y el stock mostrado no cambia

#### Scenario: Double click
- **WHEN** el usuario hace doble clic en "Registrar"
- **THEN** se envía un solo comando

### Requirement: Activation, single price and shelf are edited in place
El panel SHALL permitir habilitar y deshabilitar un modelo y una variante con un interruptor que cambia al instante y vuelve atrás avisando si el servidor falla, sin borrar nada. El Gerente SHALL poder fijar un solo precio para todo el modelo, y el Gerente y Despacho SHALL poder fijar un estante (texto opcional) que vale para todas las variantes del modelo y se muestra junto a su categoría.

#### Scenario: Toggle fails
- **WHEN** el servidor rechaza el cambio de un interruptor
- **THEN** el interruptor vuelve a su estado anterior y se muestra el error

#### Scenario: Single price
- **WHEN** el Gerente guarda 349,90 como precio del modelo
- **THEN** todas sus variantes quedan con 349,90

#### Scenario: Shelf for the whole model
- **WHEN** Despacho guarda "Estante D4" en un modelo con 6 variantes
- **THEN** las 6 variantes quedan con esa ubicación y el modelo la muestra junto a su categoría

### Requirement: The panel is usable on phone and desktop and accessible
Las pantallas MUST funcionar sin desplazamiento horizontal de la página desde 360 px de ancho (la matriz se desplaza dentro de su contenedor y deja fijo el color), usar solo los tokens de `.ux/standard/tokens.json`, cumplir contraste AA, tener objetivos táctiles de al menos 44 px, foco visible, etiquetas en todos los campos y estados de carga, vacío y error.

#### Scenario: Phone width
- **WHEN** se abre el inventario con 360 px de ancho
- **THEN** no hay desplazamiento horizontal de la página y las acciones se alcanzan con el pulgar

#### Scenario: Empty state
- **WHEN** no hay modelos con los filtros elegidos
- **THEN** el panel muestra un estado vacío

#### Scenario: Attention tries to adjust
- **WHEN** un usuario con rol Atención intenta ajustar el stock
- **THEN** el sistema responde prohibido y no encola ni cambia nada
