# product-catalog Specification

## Purpose
Registrar y mantener los productos de la tienda y sus variantes (talla y color), con precio en bolivianos, de forma que cada unidad vendible tenga una identidad única (SKU) sobre la que se controla el inventario.

## Requirements

### Requirement: A product is registered with its variants
El sistema SHALL permitir al Gerente registrar un producto con nombre (2 a 120 caracteres), descripción opcional (hasta 2000), una categoría existente y al menos una variante. Cada variante MUST tener un SKU único, una talla y un color opcional, y un precio. Registrar un producto MUST ser atómico: si cualquier variante es inválida no se guarda nada.

#### Scenario: Register a product
- **WHEN** el Gerente registra "Zapatilla Runner" con variantes talla 38 y 39 en color negro
- **THEN** el sistema guarda el producto activo con sus dos variantes, cada una con un SKU único, y las devuelve

#### Scenario: Atomic registration
- **WHEN** el Gerente registra un producto con dos variantes y la segunda repite un SKU ya existente
- **THEN** el sistema rechaza todo como conflicto y no queda guardado el producto ni la primera variante

#### Scenario: Unknown category
- **WHEN** el Gerente registra un producto con una categoría inexistente
- **THEN** el sistema rechaza la solicitud como no encontrada y no guarda nada

#### Scenario: Product without variants
- **WHEN** el Gerente registra un producto sin variantes
- **THEN** el sistema lo rechaza como inválido

### Requirement: SKUs are unique and can be generated
El SKU de una variante MUST ser único sin distinguir mayúsculas, de 3 a 40 caracteres alfanuméricos, guiones o puntos. Si el Gerente no lo indica, el sistema SHALL generarlo a partir del producto, la talla y el color y garantizar que no choque con otro.

#### Scenario: Generated SKU
- **WHEN** se registra una variante sin SKU
- **THEN** el sistema le asigna un SKU legible y único derivado de producto, talla y color

#### Scenario: Duplicate SKU ignoring case
- **WHEN** se envía "ZAP-38-NEG" existiendo "zap-38-neg"
- **THEN** el sistema lo rechaza como conflicto

### Requirement: Prices are exact amounts in bolivianos
El sistema MUST representar los precios como cantidades exactas de centavos de boliviano, mayores que cero y con un máximo de 100 000 Bs por variante. SHALL rechazar precios con más de dos decimales o no numéricos.

#### Scenario: Valid price
- **WHEN** se envía un precio de 349,90 Bs
- **THEN** el sistema lo guarda sin pérdida de precisión y lo devuelve como 349,90

#### Scenario: Invalid price
- **WHEN** se envía un precio de 0, negativo, con tres decimales o superior al máximo
- **THEN** el sistema lo rechaza como inválido

### Requirement: Products and variants are edited, never deleted
El sistema SHALL permitir al Gerente editar los datos de un producto y de sus variantes, agregar variantes nuevas, y activar o desactivar productos y variantes. El sistema MUST NOT permitir borrar productos ni variantes, para conservar el historial de inventario y de pedidos. Un producto o variante inactivo SHALL seguir visible para el personal.

#### Scenario: Deactivate a product
- **WHEN** el Gerente desactiva un producto
- **THEN** el producto queda inactivo, conserva sus variantes y su historial y sigue apareciendo en el listado del personal con su estado

#### Scenario: Delete is not offered
- **WHEN** alguien intenta borrar un producto
- **THEN** el sistema no ofrece esa operación

#### Scenario: Change a SKU
- **WHEN** el Gerente intenta cambiar el SKU de una variante que ya tiene movimientos de inventario
- **THEN** el sistema lo rechaza como conflicto

### Requirement: Products can be searched and listed by any staff role
El sistema SHALL permitir a todo el personal listar productos con paginación, filtrar por categoría, estado y texto (nombre o SKU sin distinguir mayúsculas) y consultar el detalle con sus variantes.

#### Scenario: Search by SKU
- **WHEN** el personal busca "zap-38"
- **THEN** recibe los productos que tienen una variante cuyo SKU contiene ese texto

#### Scenario: Pagination
- **WHEN** existen más productos que el tamaño de página pedido
- **THEN** el sistema devuelve solo esa página e indica el total

### Requirement: Only the Manager can change the catalog
El sistema MUST rechazar con 403 a Despacho y Atención al registrar o editar productos y variantes.

#### Scenario: Other role tries to edit
- **WHEN** un usuario con rol Atención intenta editar un producto
- **THEN** el sistema responde prohibido y no cambia nada

### Requirement: Products can be filtered by stock and out-of-stock ones deactivated in bulk
El sistema SHALL permitir filtrar el listado de productos por stock («sin stock» o «con stock») y SHALL informar las unidades disponibles de cada producto del listado. El disponible de un producto MUST ser la suma de `físico − reservado` de sus variantes activas; «sin stock» MUST significar un disponible de 0 o menos. El panel SHALL permitir al Gerente desactivar de una vez todos los productos activos sin stock que cumplan el filtro, pidiendo confirmación con la cantidad real y sin borrar nada.

#### Scenario: Filter products without stock
- **WHEN** el personal filtra el listado por «sin stock»
- **THEN** recibe solo los productos cuyo disponible es 0 o menos, cada uno con sus unidades disponibles

#### Scenario: Inactive variants do not count
- **WHEN** un producto tiene una variante inactiva con unidades y una activa sin unidades
- **THEN** el producto cuenta como «sin stock»

#### Scenario: Deactivate an out-of-stock product
- **WHEN** el Gerente desactiva un producto sin stock
- **THEN** queda inactivo, conserva sus variantes y se puede reactivar

### Requirement: A model has a single price
El sistema SHALL permitir al Gerente fijar un solo precio para todas las variantes de un modelo en una operación atómica, con las mismas reglas de los precios exactos en bolivianos.

#### Scenario: Set the model price
- **WHEN** el Gerente fija 349,90 en un modelo con 6 variantes de distinto precio
- **THEN** las 6 variantes quedan con 349,90

#### Scenario: Invalid model price
- **WHEN** el Gerente envía un precio de 0 o con tres decimales
- **THEN** el sistema lo rechaza y ninguna variante cambia

### Requirement: The product listing reports the stock of each variant
El listado de productos SHALL informar, para cada variante, su disponible, su ubicación y su umbral de reposición, de modo que el panel pueda mostrar la matriz de un modelo sin consultas adicionales.

#### Scenario: Variant stock in the listing
- **WHEN** el personal lista los productos
- **THEN** cada variante incluye su disponible, su ubicación (o ninguna) y su umbral
