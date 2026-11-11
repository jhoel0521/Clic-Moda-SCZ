# Revisión UX — pantalla de Imágenes (admin)

- **Fecha**: 2026-11-11 · **Skill**: ux-check · **Versión del estándar**: 0.2.0
- **Apps / plataformas**: `apps/admin` · web, móvil primero (360 px) y escritorio · **Stack**: Astro + React + Tailwind v4
- **Método**: `scan.mjs` + lectura del código + flujos Playwright (escritorio, iPhone 15 y 360 px). Candidatos: 2 confirmados y corregidos / 0 reclasificados / 2 descartados.

## Veredicto: LISTO

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 0 | 1 | 1 |

## Resumen
La pantalla permite subir una foto, encuadrarla por formato con vista previa exacta y descargar el kit para compartir. El enfoque se puede mover arrastrando, con flechas del teclado y con botones de 48 px (WCAG 2.5.7). Se corrigieron en esta revisión tres puntos reales (marcador de 32 px, foco invisible en los formatos y doble envío al subir) y las imágenes sin medidas. Quedan dos avisos del escáner que son falsos positivos.

## Hallazgos corregidos
- **Marcador de enfoque de 32 px** (menor que 44 px): ahora el objetivo táctil mide 44 px con el punto visible de 24 px dentro. `FocalPicker.tsx`.
- **Selector de formato sin foco visible** (el radio está oculto): la tarjeta muestra el contorno de foco con `has-[:focus-visible]`. `FramingEditor.tsx`.
- **Doble envío al subir**: el botón queda desactivado y dice «Subiendo…» mientras la foto sube (prueba incluida). `MediaBoard.tsx`.
- **`<img>` sin ancho y alto** (`WEB-IMG-DIM` en `FocalPicker` y `FormatPreview`): ahora llevan las medidas de la foto, sin saltos de diseño.

## Candidatos descartados
- **`WEB-ICON-NAME` en `FocalPicker.tsx` y `MediaBoard.tsx`**: son `IconButton` del proyecto; reciben `label`, que el componente convierte en `aria-label` y `title`. El escáner no sigue la propiedad. Las pruebas buscan esos botones por su nombre accesible.

## ✅ Qué cumple
- Objetivos táctiles de 48 px (botones, descargas, direcciones) y 44 px (marcador); miniaturas de más de 90 px.
- Estados: cargando, vacío, error de la API, ocupado al subir y al guardar, sin permiso (solo Gerente).
- Texto de aviso con `warning` (#92400e, 6.8:1 sobre blanco); errores con `danger`; nada depende solo del color (los avisos llevan ícono y texto).
- 360 px sin desplazamiento horizontal (flujo `a 360 px la pantalla de imágenes no se desborda`).
- Acciones destructivas con confirmación (borrar imagen); la nota avisa que los enlaces compartidos dejarán de mostrarla.
- El enlace «Imágenes» solo se muestra al Gerente; Despacho y Atención ven el mensaje de permiso.

## ❔ Por verificar
- La API Web Share (botón «Compartir») depende del navegador: se probó con un doble; falta una prueba en un celular real.

## 💡 Sugerencia
- Cuando exista el nombre y el dominio de la tienda (`store-branding-config`), las vistas previas de WhatsApp, Facebook y X deben leerlos de la configuración y no de `SHOP_URL`.

## Desvío del estándar
- Las tarjetas simuladas de WhatsApp, Facebook y X usan colores literales (`#d9fdd3`, blanco, grises) a propósito: imitan el aspecto de apps ajenas y no son parte de la marca. Los superpuestos de zonas seguras (`bg-black/45`) son decorativos y `aria-hidden`; el porcentaje también se ve en los campos numéricos.
- No se repiten valores nuevos que deban pasar al estándar.

## Siguiente paso
Probar «Compartir» en un celular real y revisar la pantalla con el cliente cuando existan fotos de verdad.
