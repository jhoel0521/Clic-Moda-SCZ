# Revisión UX — fotos del producto (admin)

- **Fecha**: 2026-11-12 · **Skill**: ux-check · **Versión del estándar**: 0.2.0
- **Apps / plataformas**: `apps/admin` · web, móvil primero (360 px) y escritorio · **Stack**: Astro + React + Tailwind v4
- **Método**: `scan.mjs` (3 candidatos descartados) + lectura del código + pruebas de componente + flujos Playwright (escritorio, iPhone 15 y 360 px). Se aplicó la revisión del plan (`2026-11-12-ux-plan-review-shop-catalog.md`, PLAN-06).

## Veredicto: LISTO

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 0 |

## Resumen
El Gerente elige fotos del módulo de imágenes, las ordena con botones, quita las que no quiere y guarda. La primera lleva la etiqueta «Principal». La sección va fuera del formulario del producto (no hay formularios anidados) y la consola queda limpia.

## Candidatos descartados
- **`WEB-ICON-NAME` en `ProductPhotos.tsx` (líneas 67, 68 y 74)**: son `IconButton` del proyecto; reciben `label`, que el componente convierte en `aria-label` y `title`. El escáner no sigue la propiedad. Las pruebas buscan esos botones por su nombre accesible («Subir la foto Frente», etc.).

## ✅ Qué cumple (revisión del plan, PLAN-06)
- Orden con botones de 48 px (no solo arrastrar, WCAG 2.5.7); el primero no se puede subir y el último no se puede bajar.
- Región `aria-live` que anuncia cada cambio («Foto movida a la posición 2 de 3», «Foto quitada: …», «Fotos guardadas»).
- «Principal» como etiqueta con texto, no solo por posición.
- Aviso de que quitar una foto del producto **no borra** la imagen: no hace falta confirmar.
- Estados: cargando, vacío («Este producto todavía no tiene fotos»), ocupado al guardar («Guardando…», botón desactivado), error de la API por foto («Foto 2: …») y máximo de 8 (los botones de agregar se desactivan).
- «Guardar fotos» solo se habilita cuando hay cambios.
- 360 px sin desplazamiento horizontal (flujo `la sección de fotos no se desborda`).
- Los nombres accesibles incluyen el texto alternativo de la foto, así que cada botón es único para un lector de pantalla.

## 💡 Sugerencia
- Cuando haya muchas imágenes en el módulo, la lista «Agregar desde las imágenes» puede necesitar búsqueda o paginación; con pocas fotos reales hoy no hace falta.

## Siguiente paso
Probar la sección con fotos reales del cliente y, en la tienda, verificar que la primera foto es la que aparece en el catálogo.
