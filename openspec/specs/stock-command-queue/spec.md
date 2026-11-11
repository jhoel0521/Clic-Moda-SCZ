# stock-command-queue Specification

## Purpose
Garantizar que ninguna solicitud sobre el stock se pierda ni se procese fuera de orden: todo cambio entra a una cola persistida y una máquina de estados lo resuelve, de modo que ante una o un millón de solicitudes simultáneas sobre la misma variante gane el primero que llegó y los demás reciban un rechazo claro.

## Requirements

### Requirement: Stock changes are accepted as queued commands
El sistema SHALL recibir todo cambio de stock (ingreso, salida, ajuste) como un comando que se guarda de forma duradera antes de responder, y MUST responder `202 Accepted` con el identificador del comando y su estado `PENDING`, sin modificar el stock en ese momento. Un comando aceptado MUST sobrevivir a un reinicio del sistema.

#### Scenario: Command accepted
- **WHEN** Despacho envía un ingreso válido
- **THEN** el sistema responde 202 con el id del comando en estado PENDING y el stock aún no cambia

#### Scenario: Restart does not lose commands
- **WHEN** el sistema se reinicia con comandos PENDING
- **THEN** esos comandos se procesan después del reinicio, sin perderse ni duplicarse

#### Scenario: Invalid command is not queued
- **WHEN** se envía un comando con formato inválido (cantidad cero, motivo ausente, variante inexistente)
- **THEN** el sistema lo rechaza de inmediato como inválido o no encontrado y no crea ningún comando

### Requirement: Commands follow an explicit state machine
Cada comando SHALL pasar solo del estado `PENDING` a `APPLIED` o a `REJECTED`, y cada resolución MUST ocurrir de forma atómica junto con su efecto sobre el stock (si el comando queda APPLIED el stock y el movimiento ya cambiaron; si queda REJECTED no cambió nada). Los estados `APPLIED` y `REJECTED` MUST ser finales e inmutables. Un `REJECTED` MUST llevar un motivo (por ejemplo `INSUFFICIENT_STOCK`). Un comando MUST aplicarse a lo sumo una vez.

#### Scenario: Applied command
- **WHEN** un comando de ingreso se procesa con éxito
- **THEN** su estado final es APPLIED y existe exactamente un movimiento asociado

#### Scenario: Rejected command
- **WHEN** una salida pide más unidades que las disponibles
- **THEN** su estado final es REJECTED con motivo INSUFFICIENT_STOCK y el stock no cambia

#### Scenario: Final states do not change
- **WHEN** se intenta reprocesar un comando APPLIED o REJECTED
- **THEN** el sistema no lo cambia ni genera otro movimiento

### Requirement: Arrival order decides, per variant
El sistema MUST asignar a cada comando un número de orden con el reloj y la secuencia del servidor al aceptarlo, y SHALL procesar los comandos de una misma variante estrictamente en ese orden y de uno en uno. Comandos de variantes distintas MAY procesarse en paralelo.

#### Scenario: First come, first served
- **WHEN** 100 salidas de 1 unidad llegan simultáneamente para una variante con 3 unidades disponibles
- **THEN** exactamente las 3 primeras en orden de llegada quedan APPLIED, las otras 97 quedan REJECTED con INSUFFICIENT_STOCK y el stock termina en 0

#### Scenario: Different variants do not block each other
- **WHEN** hay comandos pendientes para dos variantes distintas
- **THEN** cada variante se procesa en su propio orden sin esperar a la otra

### Requirement: Commands are idempotent
El cliente SHALL poder enviar una clave de idempotencia con cada comando. Si llega otro comando con la misma clave, el sistema MUST devolver el comando original sin crear uno nuevo ni aplicar el cambio dos veces. Dos comandos con la misma clave y contenido distinto MUST rechazarse como conflicto.

#### Scenario: Retry after a timeout
- **WHEN** el cliente repite un comando con la misma clave de idempotencia
- **THEN** recibe el mismo id y estado que el primero y el stock no se aplica dos veces

#### Scenario: Same key, different content
- **WHEN** se reutiliza una clave con otra cantidad o variante
- **THEN** el sistema responde conflicto

### Requirement: The outcome of a command can be consulted
El sistema SHALL permitir consultar un comando por su id y devolver su estado, motivo de rechazo si lo hay, fechas de aceptación y resolución y el movimiento resultante. Un comando inexistente MUST responder no encontrado.

#### Scenario: Poll until resolved
- **WHEN** el cliente consulta un comando PENDING y luego otra vez tras ser procesado
- **THEN** la primera respuesta indica PENDING y la segunda el estado final con su resultado

### Requirement: Failures are retried without double application
Si el procesamiento de un comando falla por un error transitorio, el sistema SHALL reintentarlo hasta un máximo de intentos sin aplicar el cambio dos veces. Agotados los intentos el comando MUST quedar `REJECTED` con motivo `PROCESSING_FAILED` y registrarse para revisión.

#### Scenario: Transient failure
- **WHEN** el procesamiento se interrumpe a mitad de un comando (caída del proceso o de la conexión)
- **THEN** ni el stock ni el comando cambian, el comando sigue PENDING, se reintenta y el stock se aplica una sola vez

#### Scenario: Retries exhausted
- **WHEN** un comando falla en todos sus intentos
- **THEN** queda REJECTED con PROCESSING_FAILED y el stock no cambia

### Requirement: The queue is observable
El sistema SHALL permitir al personal ver la cantidad de comandos pendientes y la antigüedad del más viejo, y MUST registrar cada transición de estado con fecha y hora.

#### Scenario: Backlog visible
- **WHEN** el personal consulta el estado de la cola
- **THEN** recibe el número de comandos PENDING y la antigüedad del más antiguo
