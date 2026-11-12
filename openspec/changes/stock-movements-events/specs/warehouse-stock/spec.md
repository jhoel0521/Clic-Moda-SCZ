## ADDED Requirements

### Requirement: Each movement records its type code
Todo movimiento SHALL registrar el código de su tipo además de su clase (ingreso, salida o ajuste). Los movimientos anteriores a los tipos MUST quedar con el tipo de sistema de su clase.

#### Scenario: Sale movement
- **WHEN** se aplica una salida con el tipo "Venta"
- **THEN** el movimiento queda con clase salida y el código del tipo "Venta"

### Requirement: Each movement records the balance after it
Todo movimiento SHALL guardar las unidades físicas que quedaron después de aplicarlo, calculadas en la misma transacción que el cambio. El saldo del último movimiento de una variante MUST ser igual a sus unidades físicas.

#### Scenario: Balance after a receive
- **WHEN** una variante con 10 unidades recibe 12
- **THEN** el movimiento guarda 22 como saldo y la variante tiene 22 unidades físicas

#### Scenario: Balance of existing history
- **WHEN** el sistema se actualiza con movimientos anteriores
- **THEN** cada uno recibe su saldo según el orden de sus comandos, y si el último saldo de una variante no coincide con su stock actual la actualización se detiene sin cambiar nada

### Requirement: History shows the type and the balance and can be filtered by type
El historial de una variante SHALL mostrar el nombre del tipo y el saldo de cada movimiento, y MUST poder filtrarse por el código del tipo además de por clase y rango de fechas.

#### Scenario: Filter by type
- **WHEN** el personal filtra el historial por el tipo "Merma o daño"
- **THEN** recibe solo los movimientos de ese tipo con su saldo
