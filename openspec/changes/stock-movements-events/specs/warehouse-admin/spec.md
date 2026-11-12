## ADDED Requirements

### Requirement: A movement is registered by choosing its class and then its type
Al registrar un movimiento, el panel SHALL pedir primero la clase (ingreso, retiro o ajuste), como hoy, y después el tipo entre los activos de esa clase, con el tipo de sistema preseleccionado. El panel MUST mostrar como máximo 7 tipos a la vez (el de sistema primero y luego por fecha de creación) y enviar siempre el código elegido.

#### Scenario: Choose a type
- **WHEN** Despacho elige «Retiro» y selecciona el tipo "Merma o daño"
- **THEN** el comando se envía con ese tipo y el historial lo muestra con su nombre

#### Scenario: Default type
- **WHEN** Despacho elige «Ingreso» y no cambia el tipo
- **THEN** se usa el tipo preseleccionado y el flujo no tiene un paso más

#### Scenario: Many types
- **WHEN** una clase tiene más de 7 tipos activos
- **THEN** el panel ofrece los 7 primeros y un acceso a «Ver todos», sin superar 7 opciones a la vez

### Requirement: The history shows type and balance
El historial de una variante SHALL mostrar en cada movimiento el nombre del tipo, la variación, el saldo resultante, el motivo y la fecha.

#### Scenario: History line
- **WHEN** Despacho abre el historial de una variante
- **THEN** cada línea muestra el tipo, el cambio, el saldo después y la fecha

### Requirement: Types are managed from their own screen
El panel SHALL ofrecer al Gerente una pantalla de tipos de movimiento para crear, renombrar, activar y desactivar tipos, y al resto del personal solo su consulta. Cada acción MUST confirmar su resultado y mostrar el error junto al campo.

#### Scenario: Create a type
- **WHEN** el Gerente crea el tipo "Cambio por talla" de clase ingreso
- **THEN** aparece en la lista y en el selector de ingresos

#### Scenario: Deactivate a type
- **WHEN** el Gerente desactiva un tipo
- **THEN** deja de ofrecerse al registrar movimientos y sigue visible en el historial

#### Scenario: Reachable from Inventory without a new tab
- **WHEN** el Gerente abre la pantalla de Inventario
- **THEN** encuentra un enlace secundario «Tipos de movimiento» y la navegación principal no suma una opción

#### Scenario: Result is confirmed
- **WHEN** el Gerente crea o cambia un tipo
- **THEN** el panel anuncia el resultado en una región `aria-live`, deja el foco en el tipo afectado y conserva lo escrito si hubo un error

#### Scenario: Loading, failure and no permission
- **WHEN** la lista de tipos tarda, falla o la persona no tiene permiso
- **THEN** el panel muestra «Cargando», un mensaje con reintento, o la lista sin acciones, según el caso

#### Scenario: Read-only for others
- **WHEN** Despacho abre la pantalla de tipos
- **THEN** ve la lista sin acciones para crear ni cambiar

### Requirement: The new screens keep the touch and choice rules
Los controles de las pantallas nuevas SHALL medir al menos 44 por 44 px en el teléfono con 8 px de separación, y cada pantalla MUST ofrecer una sola acción principal.

#### Scenario: Phone
- **WHEN** se abre la hoja de movimiento a 390 px de ancho
- **THEN** todos los controles miden al menos 44 px y hay una sola acción principal
