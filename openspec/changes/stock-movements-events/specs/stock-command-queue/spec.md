## ADDED Requirements

### Requirement: A command carries a movement type
El sistema SHALL aceptar en cada comando el código de un tipo de movimiento activo cuya clase coincida con la del comando. Sin código MUST usar el tipo de sistema de la clase. Un código desconocido, inactivo o de otra clase MUST rechazarse de inmediato, sin crear el comando.

#### Scenario: Command with a type
- **WHEN** Despacho envía una salida con el tipo "Venta"
- **THEN** el sistema responde 202 y el comando queda guardado con ese código

#### Scenario: Command without a type
- **WHEN** se envía una salida sin código de tipo
- **THEN** el comando se acepta con el tipo de sistema `WITHDRAW`

#### Scenario: Type of another class
- **WHEN** se envía un ingreso con el tipo "Merma o daño", que es una salida
- **THEN** el sistema lo rechaza como inválido y no crea ningún comando

### Requirement: The type takes part in idempotency without changing past commands
El código del tipo SHALL formar parte de lo que distingue un reintento legítimo de una clave reutilizada, y MUST NOT alterar la huella de los comandos aceptados antes de los tipos.

#### Scenario: Same key, different type
- **WHEN** se reutiliza una clave de idempotencia con otro tipo de la misma clase
- **THEN** el sistema responde conflicto

#### Scenario: Retry of an old command
- **WHEN** se repite con su clave un comando aceptado antes de que existieran los tipos
- **THEN** el sistema devuelve el comando original, sin conflicto

### Requirement: The queue status includes event deliveries
El estado de la cola SHALL incluir el número de entregas de eventos pendientes, las que necesitan revisión y la antigüedad de la más antigua pendiente.

#### Scenario: Status with deliveries
- **WHEN** el personal consulta el estado de la cola con entregas pendientes
- **THEN** recibe además de los comandos pendientes el número de entregas pendientes y su antigüedad
