## ADDED Requirements

### Requirement: Applying a command records an event in the same transaction
El sistema SHALL guardar un evento de cambio de stock en la misma transacción que aplica el comando, de modo que existan los dos o ninguno. El evento MUST llevar la variante, el movimiento, el código del tipo, la clase, la variación, las unidades físicas y disponibles resultantes, la hora y un número de orden que crece dentro de una misma variante. MUST NOT llevar motivo, operador ni datos de personas.

#### Scenario: Applied command
- **WHEN** la cola aplica un ingreso de 12 unidades
- **THEN** existe exactamente un evento con la variante, el movimiento, +12 y el stock resultante

#### Scenario: Rejected command
- **WHEN** la cola rechaza un comando por stock insuficiente
- **THEN** no se crea ningún evento

#### Scenario: Failure inside the transaction
- **WHEN** la transacción falla después de calcular el stock pero antes de confirmar
- **THEN** no queda ni movimiento ni evento ni cambio de stock

### Requirement: Each event gets one delivery per subscriber
El sistema SHALL crear, en la misma transacción que guarda el evento, una entrega propia por cada suscriptor registrado en ese momento, con su estado, número de intentos, último error y fecha de ejecución. Un suscriptor registrado después MUST empezar desde su registro y no recibir los eventos anteriores. La falla de un suscriptor MUST NOT impedir ni retrasar la entrega a los demás.

#### Scenario: Two subscribers
- **WHEN** se aplica un comando y hay dos suscriptores registrados
- **THEN** se crean dos entregas y cada una se ejecuta por separado

#### Scenario: One subscriber fails
- **WHEN** la entrega de un suscriptor falla y la del otro no
- **THEN** la del otro queda ejecutada en la misma pasada

#### Scenario: Late subscriber
- **WHEN** se registra un suscriptor nuevo con eventos anteriores ya guardados
- **THEN** solo recibe los eventos posteriores a su registro

### Requirement: Failures are retried and then held for review
Si la entrega falla, el sistema SHALL aumentar el número de intentos, guardar el error y reintentarla con una espera creciente. Al llegar a 5 intentos MUST pasarla a «necesita revisión» y no procesarla más hasta que el Gerente la reintente.

#### Scenario: Recovers after two failures
- **WHEN** una entrega falla dos veces y la tercera sale bien
- **THEN** queda ejecutada con 3 intentos y el efecto se aplicó una sola vez

#### Scenario: Attempts exhausted
- **WHEN** una entrega falla 5 veces
- **THEN** queda en «necesita revisión» y las pasadas siguientes no la intentan

#### Scenario: Manual retry
- **WHEN** el Gerente reintenta una entrega en «necesita revisión» y el fallo ya no ocurre
- **THEN** se ejecuta y el efecto se aplica una sola vez

### Requirement: A duplicate or out-of-order delivery is harmless
El sistema MUST NOT volver a entregar una entrega ya ejecutada y SHALL entregar cada evento a cada suscriptor al menos una vez. Un suscriptor cuyo efecto no se confirme junto con la marca de ejecución MUST ser idempotente. Cada evento SHALL llevar el estado resultante y su número de orden para que un suscriptor pueda ignorar uno viejo.

#### Scenario: Redelivery
- **WHEN** una entrega ya ejecutada se vuelve a presentar al despachador
- **THEN** no se entrega de nuevo, el efecto no se aplica otra vez y queda marcada como duplicada

### Requirement: The dispatcher can be turned off
El sistema SHALL permitir apagar el despachador de eventos por configuración, igual que el procesador de la cola, sin perder ningún evento guardado.

#### Scenario: Dispatcher off
- **WHEN** el despachador está apagado y se aplican comandos
- **THEN** los eventos quedan guardados y se entregan cuando el despachador se enciende

### Requirement: Event deliveries are observable
El sistema SHALL informar al personal cuántas entregas están pendientes, cuántas necesitan revisión y la antigüedad de la más antigua pendiente, y MUST registrar el error de cada entrega fallida.

#### Scenario: Stuck delivery visible
- **WHEN** hay una entrega en «necesita revisión»
- **THEN** el estado de la cola la cuenta y el Gerente puede ver su último error por la API
