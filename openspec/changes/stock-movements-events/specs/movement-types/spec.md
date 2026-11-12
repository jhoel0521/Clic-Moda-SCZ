## ADDED Requirements

### Requirement: Movement types are data with a class
El sistema SHALL mantener un catálogo de tipos de movimiento. Cada tipo MUST tener un nombre legible (de 3 a 60 caracteres), una clase (ingreso, salida o ajuste), un estado activo o inactivo y un código único (mayúsculas, dígitos y guion bajo, de 2 a 30 caracteres) que el sistema genera a partir del nombre y que la persona nunca escribe; si el código ya existe, agrega un sufijo numérico. La clase decide cómo cambia el stock; el tipo solo registra el motivo del cambio.

#### Scenario: Type with its class
- **WHEN** el catálogo contiene el tipo "Merma o daño" de clase salida
- **THEN** un movimiento de ese tipo descuenta stock como cualquier salida y falla por falta de disponible igual que una salida

#### Scenario: Code generated from the name
- **WHEN** el Gerente crea el tipo "Cambio por talla"
- **THEN** el tipo queda con el código `CAMBIO_POR_TALLA` sin que la persona lo escriba

#### Scenario: Same name again
- **WHEN** el Gerente crea otro tipo cuyo nombre genera un código que ya existe
- **THEN** el sistema agrega un sufijo (`CAMBIO_POR_TALLA_2`) y crea el tipo

#### Scenario: Invalid name
- **WHEN** el Gerente crea un tipo con un nombre vacío o de más de 60 caracteres
- **THEN** el sistema lo rechaza, indica que el error está en el nombre y no crea el tipo

### Requirement: The system ships with its own types
El sistema SHALL incluir tres tipos de sistema, uno por clase, con los códigos `RECEIVE`, `WITHDRAW` y `ADJUST`, y los tipos sugeridos "Ingreso por compra", "Devolución de cliente", "Venta", "Merma o daño", "Regalo o muestra" y "Ajuste por conteo". Los tipos de sistema MUST NOT poder desactivarse ni cambiar de clase.

#### Scenario: Existing data stays valid
- **WHEN** el sistema se actualiza con comandos y movimientos anteriores a los tipos
- **THEN** cada uno queda asociado al tipo de sistema de su clase y nada se pierde

#### Scenario: Deactivating a system type
- **WHEN** el Gerente intenta desactivar `RECEIVE`
- **THEN** el sistema lo rechaza y el tipo sigue activo

### Requirement: Only the Gerente manages types
El sistema SHALL permitir crear, renombrar, activar y desactivar tipos solo al Gerente. Todo el personal MUST poder consultar los tipos activos para registrar movimientos.

#### Scenario: Despacho tries to create a type
- **WHEN** una persona con rol Despacho intenta crear un tipo
- **THEN** el sistema responde prohibido y no crea el tipo

#### Scenario: Despacho reads active types
- **WHEN** Despacho consulta los tipos
- **THEN** recibe los activos con código, nombre y clase

### Requirement: A type's code and class never change
El sistema MUST NOT permitir cambiar el código ni la clase de un tipo después de crearlo, ni borrarlo. Un tipo se retira desactivándolo, y su nombre se puede cambiar.

#### Scenario: Rename keeps the history
- **WHEN** el Gerente renombra un tipo usado por movimientos anteriores
- **THEN** el historial muestra el nuevo nombre y los códigos de esos movimientos no cambian

#### Scenario: Delete refused
- **WHEN** alguien intenta borrar un tipo
- **THEN** no existe esa operación

### Requirement: An inactive type cannot be used for new commands
El sistema SHALL rechazar un comando nuevo cuyo tipo esté inactivo, y MUST seguir procesando los comandos ya aceptados con ese tipo.

#### Scenario: Inactive type on a new command
- **WHEN** se envía un comando con un tipo desactivado
- **THEN** el sistema lo rechaza como inválido y no crea ningún comando

#### Scenario: Pending command keeps its type
- **WHEN** un tipo se desactiva mientras un comando suyo espera en la cola
- **THEN** el comando se procesa con normalidad y el movimiento queda con ese tipo
