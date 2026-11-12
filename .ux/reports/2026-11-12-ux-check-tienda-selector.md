# Revisión UX — selector de talla y color, barra de consulta y navegación del teléfono (tienda)

- **Fecha**: 2026-11-12 · **Skill**: ux-check (ejecutada con la skill, no a mano) · **Versión del estándar**: 0.3.0
- **App**: `apps/shop` · web, móvil primero (390 px) · **Stack**: Astro SSR + Tailwind v4
- **Método**: `scan.mjs --changed HEAD` sobre 17 archivos (0 hallazgos; 2 antiguos no mostrados) + lectura del código + **Chromium real**: tamaños medidos por grupo, no-recarga, desplazamiento, camino sin JavaScript.

## Veredicto: LISTO

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 3 | 2 | 1 |

## Qué cambió y por qué
- **Una sola fuente de estilo** (`lib/option-styles.ts`) para las opciones de la tarjeta (enlaces) y del detalle (radios): píldoras redondas, la elegida rellena. Antes el detalle usaba cajas con borde y la tarjeta píldoras, y no se leían como lo mismo (Similitud, H4 consistencia, WCAG 3.2.4).
- **Ningún texto de estado dentro de una opción.** «Últimas» dentro del botón hacía opciones de tamaños distintos y además era **incorrecto**: ignoraba el color elegido (marcaba tallas con stock normal). Ahora es un punto en la esquina con leyenda «Últimas unidades» y texto para lectores, calculado por el color elegido; y la disponibilidad de la **variante elegida** se lee junto al precio, dentro del bloque que se actualiza (`aria-live`).
- **Elegir no recarga**: se pide la página por `fetch` y se reemplazan solo precio, selector y botón; la URL se actualiza con `replaceState`; el foco vuelve a la opción tocada; si falla, navega. Medido: el desplazamiento no cambia (722 antes y después) y sin JavaScript sigue funcionando el formulario GET.
- **Navegación del teléfono**: se quitó el menú de la cabecera. La barra inferior es la única y ahora **siempre** está visible, también en el producto; la barra de consulta (una fila) va encima.

## Medido en el navegador (390 px)
- Alto de todas las opciones de cada grupo: **44 px** (un solo valor). Ancho de las tallas: **48 px** (igual).
- Barra de consulta 69 px + barra inferior 72 px = 141 px de 780 (18 %).
- Consola limpia; sin botón de menú; sin desborde.

## 🟡 Menores
- **Píldoras de la tarjeta de 36×40 px y círculos de color de 32 px** (el estándar pide 44 para lo importante). Son atajos secundarios (la tarjeta entera lleva al detalle) y cumplen WCAG 2.5.8; ya estaba anotado en el informe anterior.
- **Tres accesos a WhatsApp en la ficha del producto en teléfono** (cabecera, barra de consulta y pestaña inferior). Redundante (Hick). Fix: ocultar el botón de la cabecera en teléfono cuando hay barra de consulta, o quitar la pestaña en esa página.
- **Sin indicador si la actualización tarda más de 400 ms.** La opción tocada se rellena al instante (`:checked`), lo que da respuesta inmediata, pero el precio puede tardar si la API responde lento. Fix: atenuar el bloque de precio mientras se pide (`aria-busy`).

## 💡 Sugerencias
- `SwatchDot.astro` usa tres colores literales para los estampados (degradado) y `lib/colors.ts` un mapa de nombres a tonos. Es decorativo, pero si el catálogo trae el tono por color (campo en el panel) se elimina el mapa.
- El ícono de búsqueda de la cabecera lleva a `/catalogo` sin enfocar el campo de búsqueda; su nombre dice «Buscar en el catálogo». Enfocar el campo al llegar con `#buscar` lo haría fiel.

## ❔ Por verificar
- Las dos barras fijas apiladas con el teclado en pantalla y las zonas seguras en un teléfono real.

## ✅ Qué cumple
- Nombres: radios dentro de `label` con el texto de la opción; el círculo de color es decorativo (`aria-hidden`) y el nombre va en texto; el punto de «Últimas» tiene texto solo para lectores.
- Contraste: relleno `brand-dark` con texto blanco (validado por la configuración); inactivas `neutral-100` con `ink`; punto y leyenda con `warning` (≥ 7:1 sobre el fondo).
- La elección no depende solo del color (relleno + `aria-current` / `:checked`); foco visible con `has-[:focus-visible]`.
- Glosario: «Últimas unidades», «Agotada», «Consultar por WhatsApp», «Elige tu talla». Escasez real (≤ 3 unidades): no es un patrón oscuro.

## Desvío del estándar
- Ninguno nuevo. Los dos literales anteriores son decorativos (ver sugerencias).
