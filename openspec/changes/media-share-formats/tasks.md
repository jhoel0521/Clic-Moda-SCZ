## 1. Infraestructura

- [x] 1.1 (shared) Agregar `seaweedfs` a `docker-compose.dev.yml` en red interna, bucket privado, puerto solo en 127.0.0.1:10002; actualizar `ports.json` y `.env.example` (credenciales generadas, nunca commiteadas)
- [x] 1.2 (shared) Variables de configuracion del almacenamiento (endpoint, bucket, claves, adaptador `s3|disk`) validadas al arrancar

## 2. Dominio (services/api, contexto media)

- [ ] 2.1 (domain) Objetos de valor `MediaFormat`, `FocalPoint`, `AltText`, `ImageDimensions`, `Revision` con pruebas
- [ ] 2.2 (domain) `computeCrop` puro (cover con enfoque y `contain`) con casos fijos de prueba
- [ ] 2.3 (domain) Entidades `MediaAsset` y `MediaVariant` y puerto `MediaAssetRepository`

## 3. Aplicacion

- [ ] 3.1 (application) Puertos `MediaStoragePort` e `ImageProcessorPort` con tokens
- [ ] 3.2 (application) Caso de uso `UploadMedia` (validacion, normalizacion, variantes, revision 1)
- [ ] 3.3 (application) Casos de uso `ChangeFocalPoint`, `DeleteMedia`, `ListMedia`, `GetPublicVariant`
- [ ] 3.4 (application) Limpieza de revisiones con mas de 30 dias que no son la vigente

## 4. Infraestructura (API)

- [ ] 4.1 (infrastructure) Migracion `media_asset` y `media_variant` y `TypeOrmMediaAssetRepository`
- [ ] 4.2 (infrastructure) `SharpImageProcessor` (limitInputPixels, autoorient, sin EXIF, JPEG/WebP, tope de 300 KB en `link`)
- [ ] 4.3 (infrastructure) `S3MediaStorage` y `DiskMediaStorage`
- [ ] 4.4 (infrastructure) `MediaAdminController` (solo Gerente, multipart 12 MB) y DTOs HTTP con mappers
- [ ] 4.5 (infrastructure) `MediaPublicController` con `Cache-Control` inmutable, `ETag`, 304 y 404 para lo no publicado
- [ ] 4.6 (infrastructure) Modulo `media` registrado y limites de capa verificados por el lint

## 5. Pruebas del API

- [ ] 5.1 Contratos de `MediaStoragePort` (fake, disco y S3 contra SeaweedFS real) y de `ImageProcessorPort`, `MediaAssetRepository`
- [ ] 5.2 e2e: subir, rechazos (tipo, peso, tamano, sin alt), EXIF/GPS eliminado, permiso solo Gerente, entrega publica y 304

## 6. Tienda

- [ ] 6.1 (apps/shop) Ruta `/m/[...path]` que reenvia a la API por red interna y conserva cabeceras de cache
- [ ] 6.2 (apps/shop) Componente de etiquetas Open Graph y Twitter en el servidor con `og:image` completo y respaldo a la imagen de marca

## 7. Admin

- [ ] 7.1 (apps/admin) Funcion `computeCrop` copiada como modulo puro con las mismas pruebas que el API
- [ ] 7.2 (apps/admin) Pantalla de imagenes: subir, texto alternativo, lista
- [ ] 7.3 (apps/admin) Editor de encuadre: selector de formato, enfoque arrastrable y con teclado/botones, zonas seguras, avisos
- [ ] 7.4 (apps/admin) Vista previa simulada de tarjetas de WhatsApp, Facebook y X y kit de descarga con Web Share
- [ ] 7.5 (apps/admin) Pruebas de componentes y flujo Playwright (360 px y escritorio) y ux-check

## 8. Cierre

- [ ] 8.1 Verificar una URL real con los depuradores de WhatsApp y Facebook y documentar el resultado
- [ ] 8.2 Actualizar README, ARCHITECTURE y ROADMAP
