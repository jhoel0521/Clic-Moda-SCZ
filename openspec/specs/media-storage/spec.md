# media-storage Specification

## Purpose
TBD - created by archiving change media-share-formats. Update Purpose after archive.

## Requirements

### Requirement: Storage is private and only the API reaches it
El sistema SHALL guardar los archivos en SeaweedFS (compatible con S3) dentro de la red interna, con bucket privado, sin puertos publicados en produccion y accesible solo desde la API. En desarrollo SHALL publicar un puerto solo en 127.0.0.1.

#### Scenario: Not reachable from outside
- **WHEN** alguien intenta llegar a SeaweedFS desde fuera de la red interna
- **THEN** no hay ruta ni puerto publicado hacia el

### Requirement: Public delivery goes through the shop domain
El sistema SHALL servir las variantes publicadas en `https://<tienda>/m/<id>/<formato>-<rev>.<ext>`, con la tienda (Astro) reenviando `/m/*` a la API y la API leyendo del almacenamiento, sin redirecciones ni URLs firmadas.

#### Scenario: Crawler fetches the image
- **WHEN** WhatsApp pide la URL `og:image` de una pagina
- **THEN** recibe 200 con `Content-Type: image/jpeg` desde el dominio de la tienda

### Requirement: Only published variants are public
El sistema SHALL servir publicamente solo variantes publicadas; las copias maestras y las imagenes sin publicar MUST ser accesibles unicamente por el admin autenticado a traves de la API.

#### Scenario: Master is not public
- **WHEN** alguien pide la copia maestra por la ruta publica
- **THEN** recibe 404

### Requirement: Delivery is cacheable and crawlers are not blocked
El sistema SHALL responder las variantes con `Cache-Control: public, max-age=31536000, immutable` y `ETag`, atender `If-None-Match` con 304, y MUST NOT bloquear a los rastreadores de vista previa.

#### Scenario: Conditional request
- **WHEN** un cliente repite la peticion con el `ETag` recibido
- **THEN** la respuesta es 304 sin cuerpo

### Requirement: Storage sits behind a port
El sistema SHALL acceder al almacenamiento solo por `MediaStoragePort`, con un adaptador S3 y un adaptador de disco, y cada puerto MUST tener su prueba de contrato.

#### Scenario: Swap the adapter
- **WHEN** se configura el adaptador de disco en lugar del S3
- **THEN** los casos de uso funcionan sin cambios y pasan las mismas pruebas de contrato
