## ADDED Requirements

### Requirement: A logo format keeps transparency
El sistema SHALL generar al subir, ademas de los formatos existentes, `logo` en WebP con transparencia, que quepa completo en 640x320 (modo `contain` sin fondo), y MUST servirlo por la misma ruta publica inmutable de las demas variantes.

#### Scenario: Logo with transparent background
- **WHEN** se sube un PNG con fondo transparente
- **THEN** `logo` conserva la transparencia y mantiene la proporcion original dentro de 640x320

#### Scenario: Logo from a JPEG
- **WHEN** se sube un JPEG como logo
- **THEN** `logo` se genera igualmente, sin recortar la imagen
