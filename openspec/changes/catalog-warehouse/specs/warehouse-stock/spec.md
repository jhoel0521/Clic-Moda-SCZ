# Spec Delta

## Purpose

Llevar el inventario del almacén de la tienda: cuántas unidades hay de cada variante, dónde están y qué movimientos las cambiaron, con historial inmutable que reemplaza al cuaderno y garantiza que el stock nunca sea negativo.

## ADDED Requirements

### Requirement: Every variant has a stock level
El sistema SHALL mantener para cada variante un nivel de stock con las unidades físicas (`on_hand`), las unidades reservadas (`reserved`), una ubicación opcional de hasta 40 caracteres (por ejemplo "Estante A-2") y un umbral de reposición. El disponible MUST ser `on_hand - reserved`. Al registrar una variante el stock MUST iniciar en cero.

#### Scenario: New variant starts empty
- **WHEN** se registra una variante
- **THEN** su stock tiene 0 unidades físicas, 0 reservadas y 0 disponibles

#### Scenario: Available is derived
- **WHEN** una variante tiene 10 unidades físicas y 3 reservadas
- **THEN** el sistema informa 7 disponibles

### Requirement: Stock can never be negative or over-reserved
El sistema MUST garantizar siempre que las unidades físicas y las reservadas no sean negativas y que las reservadas no superen las físicas, incluso con solicitudes simultáneas.

#### Scenario: Withdraw more than available
- **WHEN** se pide retirar 5 unidades de una variante con 3 disponibles
- **THEN** el sistema rechaza el movimiento, el stock queda igual y el motivo queda registrado

### Requirement: Every stock change is a recorded movement
Todo cambio de stock SHALL registrarse como un movimiento inmutable con tipo (ingreso, salida o ajuste), variante, cantidad, motivo obligatorio de 3 a 200 caracteres, operador y fecha y hora del servidor. El sistema MUST NOT permitir editar ni borrar movimientos. El stock actual MUST coincidir siempre con la suma de los movimientos aplicados.

#### Scenario: Receive merchandise
- **WHEN** Despacho registra el ingreso de 12 unidades de una variante con motivo "Compra proveedor"
- **THEN** el stock físico sube en 12 y existe un movimiento de ingreso con operador, motivo y hora

#### Scenario: Stock count correction
- **WHEN** Despacho ajusta una variante de 10 a 8 unidades por conteo con motivo "Conteo del sábado"
- **THEN** existe un movimiento de ajuste de −2 y el stock físico es 8

#### Scenario: Reason is required
- **WHEN** se envía un movimiento sin motivo o con menos de 3 caracteres
- **THEN** el sistema lo rechaza como inválido y no cambia el stock

#### Scenario: Ledger matches stock
- **WHEN** se suman todos los movimientos aplicados de una variante
- **THEN** el total es igual a sus unidades físicas

### Requirement: Movement history can be consulted
El sistema SHALL permitir a todo el personal consultar el historial de movimientos de una variante, del más reciente al más antiguo y paginado, y filtrar por tipo y rango de fechas.

#### Scenario: History of a variant
- **WHEN** el personal consulta los movimientos de una variante
- **THEN** recibe los movimientos con tipo, cantidad, motivo, operador y fecha, del más reciente al más antiguo

### Requirement: Low stock is reported
El sistema SHALL listar las variantes activas cuyo disponible sea menor o igual a su umbral de reposición, ordenadas de menos a más disponible.

#### Scenario: Below threshold
- **WHEN** una variante activa tiene umbral 3 y 2 disponibles
- **THEN** aparece en el listado de stock bajo

#### Scenario: Inactive variants excluded
- **WHEN** una variante inactiva está por debajo de su umbral
- **THEN** no aparece en el listado de stock bajo

### Requirement: Stock changes are restricted by role
Gerente y Despacho SHALL poder registrar ingresos, salidas y ajustes y cambiar ubicación y umbral. Atención SHALL poder consultar stock, movimientos y stock bajo, pero MUST NOT modificar nada (403).

#### Scenario: Attention tries to adjust
- **WHEN** un usuario con rol Atención intenta ajustar el stock
- **THEN** el sistema responde prohibido y no encola ni cambia nada
