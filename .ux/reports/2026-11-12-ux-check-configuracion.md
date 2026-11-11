# Revisión UX — pantalla de Configuración (admin)

- **Fecha**: 2026-11-12 · **Skill**: ux-check · **Versión del estándar**: 0.2.0
- **Apps / plataformas**: `apps/admin` · web, móvil primero (360 px) y escritorio · **Stack**: Astro + React + Tailwind v4
- **Método**: `scan.mjs` (0 candidatos) + lectura del código + flujos Playwright (escritorio, iPhone 15 y 360 px). 1 hallazgo propio confirmado y corregido.

## Veredicto: LISTO

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 1 |

## Resumen
El Gerente cambia nombre, eslogan, color, logo, imagen de compartir, contacto y redes, con una vista previa a 360 px y 1280 px y un aviso de contraste en vivo con el color cercano que sí cumple. El escáner no encontró nada; la lectura del código encontró un punto real, ya corregido.

## Hallazgo corregido
- **Enlace real dentro de la vista previa** (`StorePreview.tsx`): el botón «Escribir por WhatsApp» de la maqueta era un `<a href="wa.me…">`: se podía llegar con Tab y abría WhatsApp desde el panel. Ahora es un `<span>` sin navegación.

## ✅ Qué cumple
- Campos con etiqueta, ayuda (contador «12 de 24 caracteres») y error asociados (`aria-describedby`); errores con `role="alert"`; el guardado correcto con `role="status"`.
- Contraste: el aviso usa ícono y texto, nunca solo color; `success` #15803d y `danger` #b91c1c sobre blanco superan 4.5:1; el color de la marca se valida con la misma función que la API (casos fijos idénticos en ambos lados).
- Objetivos táctiles de 48 px (campos, botones, selector de color, resumen de «Subir una imagen nueva») y miniaturas de más de 90 px.
- Foco visible en los selectores de imagen y de tamaño de vista previa (`has-[:focus-visible]`, contorno de 3 px) aunque el radio esté oculto.
- Estados: cargando imágenes, error al cargar la lista, ocupado al guardar («Guardando…», botón desactivado, sin doble envío), errores por campo de la API (422), sin permiso (solo Gerente) y sin imagen elegida.
- 360 px sin desplazamiento horizontal (flujo `a 360 px la pantalla de configuración no se desborda`, también en iPhone).
- El enlace «Configuración» solo se muestra al Gerente; Despacho y Atención ven el mensaje de permiso y ningún botón de guardar.

## ❔ Por verificar
- La vista previa a 1280 px se reduce (zoom 0,3) para caber: el texto es pequeño a propósito, es una maqueta; conviene revisarla con el cliente en pantalla real.

## 💡 Sugerencia
- Cuando exista el catálogo en la tienda, la vista previa debería usar los mismos componentes de cabecera y pie que la tienda en lugar de una maqueta propia, para que no se desvíen.

## Desvío del estándar
- La maqueta de la tienda usa literales `#24151c` y `#6b5a64` (los valores de `text` y `muted` del estándar) y el blanco de la página, porque representa otra app (la tienda) y no el panel. El color de marca viene de variables CSS derivadas del color elegido. No hay valores nuevos que deban pasar al estándar.

## Siguiente paso
Revisar la pantalla con el cliente cuando elija su nombre, su logo y su color definitivos.
