# Spec Delta

## Purpose

Dar al personal un panel de administración, usable en computadora y en celular, para mantener categorías y productos y operar el almacén, mostrando con claridad que los cambios de stock se procesan en cola.

## ADDED Requirements

### Requirement: Admin access requires sign-in and shows only what the role allows
El panel SHALL exigir iniciar sesión con una cuenta del personal y MUST mostrar solo las acciones que el rol permite: el Gerente ve todo, Despacho no ve acciones de catálogo y Atención no ve acciones que modifican nada. Un acceso directo a una pantalla no permitida MUST llevar a una pantalla de acceso denegado.

#### Scenario: Not signed in
- **WHEN** alguien abre una pantalla del panel sin sesión
- **THEN** es llevado a iniciar sesión y, tras hacerlo, vuelve a la pantalla pedida

#### Scenario: Role limits
- **WHEN** un usuario Atención abre el almacén
- **THEN** ve el stock y los movimientos pero no los botones de ingreso ni ajuste

### Requirement: Categories and products can be managed from the panel
El panel SHALL permitir al Gerente crear, editar y borrar (si no tienen productos) categorías, y registrar y editar productos con sus variantes, activarlos y desactivarlos, con listado paginado, búsqueda por nombre o SKU y filtro por categoría y estado. Cada formulario MUST validar antes de enviar y mostrar el error del servidor junto al campo correspondiente.

#### Scenario: Register a product with variants
- **WHEN** el Gerente completa el formulario con 3 tallas y lo guarda
- **THEN** el producto aparece en el listado con sus 3 variantes y SKU

#### Scenario: Server error shown at the field
- **WHEN** el servidor rechaza un SKU duplicado
- **THEN** el formulario conserva los datos y muestra el error junto al campo SKU

### Requirement: The warehouse screen operates stock through the queue
El panel SHALL mostrar por variante el stock físico, reservado y disponible, la ubicación y el umbral, y permitir ingresos, salidas y ajustes con motivo. Tras enviar, el panel MUST mostrar el comando como "En cola" y actualizarlo hasta su estado final, informando con claridad si fue aplicado o rechazado y por qué. El panel MUST evitar el doble envío por doble clic.

#### Scenario: Receive and see the result
- **WHEN** Despacho registra un ingreso de 12 unidades
- **THEN** el panel muestra "En cola" y luego "Aplicado" con el nuevo stock

#### Scenario: Rejected shown clearly
- **WHEN** una salida es rechazada por stock insuficiente
- **THEN** el panel muestra "Rechazado: stock insuficiente" y el stock mostrado no cambia

#### Scenario: Double click
- **WHEN** el usuario hace doble clic en "Registrar ingreso"
- **THEN** se envía un solo comando

### Requirement: Low stock and movement history are visible
El panel SHALL mostrar la lista de stock bajo y el historial de movimientos de cada variante con tipo, cantidad, motivo, operador y fecha, y una vista de la cola con los comandos pendientes.

#### Scenario: Low stock list
- **WHEN** el personal abre "Stock bajo"
- **THEN** ve las variantes activas por debajo de su umbral, de menos a más disponible

### Requirement: The panel is usable on phone and desktop and accessible
Las pantallas MUST funcionar sin desplazamiento horizontal desde 360 px de ancho, usar solo los tokens de `.ux/standard/tokens.json`, cumplir contraste AA, tener objetivos táctiles de al menos 44 px, foco visible, etiquetas en todos los campos y estados de carga, vacío y error.

#### Scenario: Phone width
- **WHEN** se abre el listado de productos con 360 px de ancho
- **THEN** no hay desplazamiento horizontal y las acciones se alcanzan con el pulgar

#### Scenario: Empty state
- **WHEN** no hay productos registrados
- **THEN** el panel muestra un estado vacío con la acción para registrar el primero
