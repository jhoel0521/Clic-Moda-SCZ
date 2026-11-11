## ADDED Requirements

### Requirement: WhatsApp is the single closing channel
El sistema SHALL guardar un numero de WhatsApp en formato internacional (Bolivia +591) y MUST generar todos los enlaces de contacto `wa.me` desde ese unico dato, sin numeros literales en la tienda.

#### Scenario: Valid number
- **WHEN** el Gerente guarda 59171234567
- **THEN** los botones de WhatsApp de la tienda abren `wa.me/59171234567`

#### Scenario: Invalid number
- **WHEN** el Gerente guarda un numero con letras o sin codigo de pais
- **THEN** el sistema lo rechaza indicando el formato esperado

### Requirement: Warehouse and pickup information is configurable
El sistema SHALL permitir configurar la direccion del almacen, el horario de recojo y un enlace opcional de mapa, y mostrarlos en el pie y en la pagina de contacto.

#### Scenario: Pickup hours shown
- **WHEN** el Gerente guarda direccion y horario de recojo
- **THEN** la tienda los muestra en el pie y en contacto

### Requirement: Social links are optional and validated
El sistema SHALL permitir enlaces opcionales a Instagram, TikTok y Facebook, aceptar solo URLs https del dominio de cada red y omitir de la tienda los que esten vacios.

#### Scenario: Foreign domain
- **WHEN** el Gerente guarda como Instagram una URL de otro dominio
- **THEN** el sistema la rechaza indicando el campo

#### Scenario: Empty network
- **WHEN** no hay enlace de TikTok
- **THEN** la tienda no muestra el icono de TikTok

### Requirement: Contact data is public and carries no secrets
El sistema SHALL exponer los datos de contacto en la lectura publica de la configuracion y MUST NOT incluir secretos ni datos privados.

#### Scenario: Anonymous read
- **WHEN** un visitante anonimo lee la configuracion
- **THEN** recibe WhatsApp, direccion, horario y redes, sin ningun dato privado
