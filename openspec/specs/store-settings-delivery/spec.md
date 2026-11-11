# store-settings-delivery Specification

## Purpose
TBD - created by archiving change store-branding-config. Update Purpose after archive.

## Requirements

### Requirement: Public settings are readable without authentication
El sistema SHALL exponer `GET /store-settings` a cualquier visitante sin iniciar sesion, con nombre, eslogan, logo, paleta, SEO, contacto y redes, y MUST NOT incluir secretos ni datos privados.

#### Scenario: Anonymous read
- **WHEN** un cliente anonimo pide la configuracion publica
- **THEN** recibe 200 con los datos publicos

### Requirement: Reads are cacheable with validators
El sistema SHALL responder con `Cache-Control` y `ETag`, y MUST contestar 304 sin cuerpo cuando el validador coincide.

#### Scenario: Conditional request
- **WHEN** un cliente repite la peticion con el `ETag` recibido y nada cambio
- **THEN** recibe 304

### Requirement: Saved changes reach visitors within 60 seconds
El sistema SHALL hacer visible un cambio guardado a todos los visitantes en menos de 60 segundos, sin nuevo despliegue.

#### Scenario: Name edited
- **WHEN** el Gerente guarda un nombre nuevo
- **THEN** quien cargue una pagina pasados 60 segundos ve el nombre nuevo

### Requirement: Branding is rendered on the server
La tienda MUST renderizar en el HTML inicial el nombre, la paleta y las etiquetas de SEO, sin depender de JavaScript, para evitar parpadeos y para los rastreadores.

#### Scenario: No flash of default colors
- **WHEN** un visitante carga una pagina con una paleta no predeterminada
- **THEN** el primer cuadro ya usa esa paleta y el HTML contiene las etiquetas de titulo y descripcion

### Requirement: Defaults are used when settings are unavailable
El sistema SHALL usar los ultimos valores validos y, si no hay, la semilla ("Clic Moda SC" y la paleta predeterminada) cuando la API no responda, sin mostrar un error al visitante.

#### Scenario: API down
- **WHEN** la API falla despues de haber servido un valor valido
- **THEN** la tienda sigue mostrando ese valor

### Requirement: Only the manager changes settings
El sistema MUST aceptar `PUT /store-settings` solo de un Gerente con sesion iniciada, validar el cambio completo y guardarlo entero o rechazarlo con errores por campo.

#### Scenario: Unauthorized write
- **WHEN** un visitante o una persona de Despacho o Atencion intenta guardar
- **THEN** el sistema lo rechaza y no cambia nada

#### Scenario: Invalid field
- **WHEN** el Gerente envia un campo invalido
- **THEN** no se guarda nada y la respuesta nombra el campo
