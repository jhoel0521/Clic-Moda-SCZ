# Revisión UX — catálogo y detalle de producto (tienda)

- **Fecha**: 2026-11-12 · **Skill**: ux-check · **Versión del estándar**: 0.3.0
- **Apps / plataformas**: `apps/shop` · web, móvil primero (360 px) y escritorio · **Stack**: Astro SSR + Tailwind v4
- **Método**: `scan.mjs` (0 candidatos) + lectura del código + **navegador real** (Chromium a 360 y 1280 px, y con JavaScript desactivado) + pruebas de páginas con el contenedor de Astro. Se aplicó la revisión del plan (`2026-11-12-ux-plan-review-shop-catalog.md`, PLAN-01 a PLAN-07).

## Veredicto: LISTO

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 0 | 2 | 1 |

## Resumen
El visitante ve el catálogo con filtros y, en el detalle, nombre, precio, disponibilidad, fotos, talla y color. Elige y consulta por WhatsApp con el producto, la talla y el color ya en el mensaje. Sin cuenta y sin guardar datos personales. En el navegador real: sin desborde a 360 px, objetivos táctiles de 52 px en las tallas, consola limpia y todo funcional sin JavaScript.

## Hallazgos corregidos durante la revisión
- **Nombre y precio bajo el pliegue en teléfono** (detalle a 360×740): la foto 4:5 ocupaba toda la primera pantalla. Ahora nombre, precio y disponibilidad van **sobre** la foto en teléfono y la foto se acota a 48 % de la altura; la barra fija inferior deja siempre a mano el botón.
- **Bordes de controles muy tenues**: las opciones de talla sin elegir y los campos de filtro tenían un borde de ~1,5:1 (WCAG 1.4.11 pide 3:1). Ahora usan un gris de ~4,7:1 (`neutral-500`); igual los botones de la galería.
- **Faltaba «Saltar al contenido»** (WCAG 2.4.1): agregado, visible al recibir el foco, con ancla en `<main id="contenido">`.

## ✅ Qué cumple
- **Revisión del plan**: producto agotado ofrece «Preguntar cuándo vuelve» (no hay callejón sin salida); talla y color son grupos con `legend`, opciones de 44 px o más, «Agotada» con texto y ícono, elegida con borde y marca; filtros en panel plegable «Filtrar (N)» con chips que se quitan (44 px) y conteo; galería con botones anterior/siguiente, miniaturas, `alt` y anuncio «Foto 2 de 3»; barra fija con margen y `scroll-padding-bottom`; «Últimas unidades» sin cifras y precios «Bs 349,90».
- Contraste AA: muted #6b5a64 sobre blanco 6,2:1; avisos `warning` #92400e sobre ámbar claro 6,8:1; el color de la marca pasa por la validación AA de la configuración. Nada depende solo del color (la disponibilidad lleva ícono y texto).
- Estados: sin resultados (con salida «Quitar los filtros»), API caída (503 con «Reintentar»), producto inexistente (404 con enlace al catálogo), sin fotos (recuadro con el nombre), sin WhatsApp (sin botón).
- Imágenes con ancho y alto (sin saltos de diseño), las dos primeras con carga inmediata y el resto diferida.
- Funciona sin JavaScript: filtros (formulario GET), selección de talla y color (formulario GET con la elección en la URL), fotos en columna y botón de WhatsApp armado por el servidor.
- SEO: canónica sin `talla`, `color` ni `ref`; `og:image` del formato `link`; JSON-LD `Product` escapado; `sitemap.xml` y `robots.txt`.
- Privacidad: «No guardamos datos personales» en el pie; la referencia `ref` va solo en una cookie de sesión.

## ❔ Por verificar
- El comportamiento en un celular real (teclado, barra del navegador y zonas seguras del iPhone con la barra fija). Se probó con Chromium a 360 px; falta un teléfono físico.

## 💡 Sugerencias
- Cuando el cliente tenga fotos reales, revisar si conviene un recorte distinto en la tarjeta (hoy 4:5) y si la galería necesita zoom.
- Si el catálogo supera unos 100 modelos, agregar búsqueda con sugerencias; hoy el filtro de texto alcanza.

## Desvío del estándar
- Ninguno. Los colores de la marca vienen de variables CSS derivadas de la configuración; los valores literales de texto y muted coinciden con `text` y `muted` del estándar.

## Siguiente paso
Probar con el cliente en su teléfono cuando haya productos y fotos reales, y ajustar los textos con su vocabulario.
