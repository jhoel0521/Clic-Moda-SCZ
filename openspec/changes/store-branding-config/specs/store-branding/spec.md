## ADDED Requirements

### Requirement: The brand name is configurable and bounded
El sistema SHALL mostrar el nombre configurado en todo lugar donde la tienda se identifica (cabecera, pie, titulos de pagina, mensajes de WhatsApp) y MUST aceptar nombres de 2 a 24 caracteres y un eslogan opcional de hasta 60. Sin configuracion, el sistema MUST usar la semilla "Clic Moda SC".

#### Scenario: Default name
- **WHEN** no se ha configurado un nombre
- **THEN** la tienda muestra "Clic Moda SC"

#### Scenario: Name too long
- **WHEN** el Gerente intenta guardar un nombre de 25 caracteres o de 1
- **THEN** el sistema lo rechaza indicando el rango y no guarda nada

#### Scenario: Long name on a phone
- **WHEN** el nombre tiene 24 caracteres y la pantalla mide 360 px
- **THEN** la cabecera no se rompe ni genera desplazamiento horizontal

### Requirement: The logo is uploaded and optional
El sistema SHALL usar como logo una imagen subida por el modulo de medios (no una URL externa) y, sin logo o si la imagen falla, MUST mostrar el nombre como texto sin romper el diseno.

#### Scenario: Logo configured
- **WHEN** hay un logo subido
- **THEN** la cabecera y el pie lo muestran con el nombre como texto alternativo

#### Scenario: Logo missing or broken
- **WHEN** no hay logo o no carga
- **THEN** se muestra el nombre como texto y el diseno no se rompe

### Requirement: The brand palette derives from one primary color
El sistema SHALL permitir elegir un color primario y MUST derivar de el las variantes oscura, clara y suave; todo color de marca de la tienda SHALL venir de esa paleta y no de valores literales en componentes.

#### Scenario: Primary color changed
- **WHEN** el Gerente guarda un nuevo color primario
- **THEN** botones, enlaces, foco, insignias y degradados usan la nueva paleta

#### Scenario: Default palette
- **WHEN** no hay color configurado
- **THEN** se usa la paleta rosa del estandar `.ux` (`action` #c7305a), que cumple el contraste

### Requirement: Brand colors must meet contrast AA
El sistema MUST rechazar un color primario cuando el texto blanco encima tenga un contraste menor a 4.5:1 o cuando el color sobre el fondo de la pagina tenga menos de 3:1, e informar la razon obtenida y el color aceptable mas cercano.

#### Scenario: Color fails contrast
- **WHEN** el Gerente intenta guardar un color con 3.96:1 contra texto blanco
- **THEN** el sistema no lo guarda y muestra la razon y un color cercano que si pasa

### Requirement: The manager sees a preview before saving
La pantalla de configuracion SHALL mostrar una vista previa del nombre, logo y paleta aplicados a elementos representativos de la tienda, a 360 px y a 1280 px, sin cambiar la tienda publica hasta guardar.

#### Scenario: Preview while editing
- **WHEN** el Gerente edita nombre, logo o color sin guardar
- **THEN** la vista previa refleja el cambio y la tienda publica sigue igual

### Requirement: Search and sharing fields have bounded lengths
El sistema SHALL permitir un titulo de busqueda de 10 a 60 caracteres, una descripcion de 70 a 160 y una imagen de compartir (formato `link` del modulo de medios), y MUST rechazar valores fuera de rango. Sin imagen de compartir propia, se usa el logo sobre fondo de marca.

#### Scenario: Description out of range
- **WHEN** el Gerente guarda una descripcion de 40 caracteres
- **THEN** el sistema la rechaza indicando el rango de 70 a 160

### Requirement: No payment data is stored
El sistema MUST NOT guardar ni exponer datos de pago (cuentas bancarias, QR, tarjetas); el pago se coordina por WhatsApp.

#### Scenario: Settings contain no payment fields
- **WHEN** se lee o se guarda la configuracion
- **THEN** no existe ningun campo de cuenta, banco, QR o tarjeta
