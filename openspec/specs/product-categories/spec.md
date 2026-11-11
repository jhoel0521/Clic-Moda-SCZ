# product-categories Specification

## Purpose
Permitir al personal organizar los productos en categorías (por ejemplo "Zapatillas" o "Sandalias"), de modo que el catálogo se pueda ordenar y filtrar sin perder productos al reorganizarlo.

## Requirements

### Requirement: Categories can be created and edited by a Manager
El sistema SHALL permitir al Gerente crear y editar categorías con un nombre de 2 a 60 caracteres. El nombre MUST ser único sin distinguir mayúsculas, minúsculas ni espacios sobrantes al inicio o al final. Cada categoría MUST tener un identificador de URL (slug) derivado del nombre y único.

#### Scenario: Create a category
- **WHEN** el Gerente crea la categoría "Zapatillas Urbanas"
- **THEN** el sistema la guarda activa con el slug "zapatillas-urbanas" y la devuelve con su identificador

#### Scenario: Duplicate name
- **WHEN** el Gerente crea "zapatillas urbanas " existiendo "Zapatillas Urbanas"
- **THEN** el sistema rechaza la solicitud como conflicto y no crea nada

#### Scenario: Invalid name
- **WHEN** el Gerente envía un nombre vacío, de un solo carácter o de más de 60 caracteres
- **THEN** el sistema lo rechaza como inválido e indica el límite incumplido

### Requirement: Categories can be listed by any staff role
El sistema SHALL permitir a Gerente, Despacho y Atención listar categorías ordenadas por nombre y ver cuántos productos tiene cada una.

#### Scenario: List with counts
- **WHEN** un miembro del personal lista las categorías
- **THEN** recibe cada categoría con su nombre, slug, estado y cantidad de productos

#### Scenario: Unauthenticated request
- **WHEN** alguien sin sesión pide el listado
- **THEN** el sistema responde que se requiere autenticación

### Requirement: Categories with products cannot be deleted
El sistema MUST rechazar el borrado de una categoría que tenga productos asociados, activos o no. Una categoría sin productos SHALL poder borrarse por el Gerente.

#### Scenario: Delete empty category
- **WHEN** el Gerente borra una categoría sin productos
- **THEN** la categoría deja de existir

#### Scenario: Delete category in use
- **WHEN** el Gerente borra una categoría con al menos un producto
- **THEN** el sistema rechaza la operación como conflicto, conserva la categoría y sus productos y explica el motivo

### Requirement: Only the Manager can change categories
El sistema MUST rechazar con 403 a Despacho y Atención cuando intenten crear, editar o borrar categorías.

#### Scenario: Other role tries to create
- **WHEN** un usuario con rol Despacho intenta crear una categoría
- **THEN** el sistema responde prohibido y no crea nada
