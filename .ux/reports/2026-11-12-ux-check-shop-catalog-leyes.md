# ux-check con ux-laws — todo lo que cambió en `shop-catalog`

- **Fecha**: 2026-11-12 · **Skill**: ux-check 0.2.0 (checklist 3b) · **Estándar**: 0.3.0 · **Plataforma**: `--platform mobile` (la web en teléfono cuenta como móvil)
- **Base**: `git merge-base main HEAD` = `4919659` → `HEAD` `a3ad0e9` (134 archivos; shop 68 y admin 12 con UI revisados por el escáner).
- **Método**: escáner (`scan.mjs --changed`) + lectura de código + **Chromium real a 390 px** midiendo cada control (tamaño, separación, cantidad por pantalla, tamaños de letra).
- **No verificado**: ver al final.

## Veredicto: NO LISTO — 3 bloqueantes

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | ⚠️ Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 3 | 0 | 0 | 5 | 2 |

Escáner: shop 3 candidatos y admin 3, **todos descartados** (3 son cadenas dentro de pruebas `ref.test.ts:42` y `product-page.test.ts:75`; 3 son `IconButton` del admin que ya tiene `label`). 1 hallazgo antiguo no mostrado. El escáner **no ve** `min-h-9`/`size-8`, por eso los bloqueantes salen de la medición.

## Bloqueantes

### [UX-01] Tallas y colores de la tarjeta por debajo de 44 px — ❌ blocker
- **Dónde**: `apps/shop/src/lib/option-styles.ts:11` (`sm: 'min-h-9 min-w-10 px-2 text-sm'`, usado por `SizePill.astro`) y `components/ColorSwatch.astro:22` (`size-8`). Visibles en Inicio (Novedades) y Catálogo.
- **Regla**: `touch-target-platform` · Fitts · WCAG 2.5.8 se cumple (≥ 24), el equipo exige 44.
- **Evidencia (medido)**: píldora de talla **40×36 px**; enlace de color **32×32 px** (círculo visible 20 px). Detalle del producto: 44×48 ✅.
- **Impacto**: pulgar en teléfono; en el catálogo se toca la talla equivocada o se abre otro producto.
- **Confirmado el hallazgo del usuario** ✔.

### [UX-02] Logo de la cabecera de 28 px de alto — ❌ blocker (hallazgo nuevo)
- **Dónde**: `apps/shop/src/components/StoreBrand.astro` (enlace sin alto mínimo), en todas las pantallas.
- **Regla**: `touch-target-platform` · Fitts.
- **Evidencia (medido)**: enlace de **140×28 px**.
- **Fix** (2 líneas): `class="inline-flex min-h-11 items-center …"` en el `<a>`.

### [UX-03] Separaciones menores que la regla — ❌ blocker
- **Regla**: `fitts-spacing` · Fitts (8 px en móvil, 16 px entre acciones opuestas).
- **Evidencia (medido)**:
  - Tallas de la tarjeta: **6 px** (`SizePills.astro:16`, `gap-1.5`). Colores: **4 px** (`ColorSwatches.astro`, `gap-1`).
  - Barra inferior: las 4 pestañas **se tocan (0 px)** (`MobileBottomNav.astro`, `flex-1` sin `gap`); cada una mide 94×52, el riesgo real es bajo pero la regla es literal.
  - Admin, fotos del producto: «Bajar» y «Quitar» a **12 px** (`ProductPhotos.tsx`, `gap-3` de la fila); la regla pide 16 entre acciones opuestas.
- **Fix**: pestañas `gap-2 px-2`; en la fila de fotos `ml-4` en el botón «Quitar» (o `gap-4`); la tarjeta se resuelve con UX-04.

### [UX-04] Demasiadas opciones a la vez en listado y portada — ❌ blocker
- **Regla**: `hick-options` · Hick (más de 7 opciones principales visibles por pantalla) y `primary-action-competition`.
- **Evidencia (medido a 390 px)**: controles visibles en la primera pantalla **sin contar barras fijas**: Inicio **10**, Catálogo **16**; Detalle 5 y Contacto 2. Catálogo completo: **49 píldoras** de talla en 12 tarjetas (hasta 7 por tarjeta + hasta 5 colores).
- **Impacto**: cada tarjeta compite consigo misma: abrir el producto o elegir talla/color; la píldora elegida va rellena y llama más la atención que el precio.

## Propuesta para UX-01, 03 (tarjeta) y 04 — una sola decisión
Con tarjetas de 2 columnas el ancho útil es ~170 px: caben 3 objetivos de 44 px con 8 px entre ellos, no 7 tallas.
- **A (recomendada)**: la tarjeta **no ofrece tallas ni colores como controles**. Muestra foto, etiqueta de precio, nombre y una línea de texto («Coñac · Talla 36» o «Tallas 36–43 · 3 colores»). Toda la tarjeta es **un** objetivo y abre el detalle con la variante más barata elegida. Elegir talla y color pasa al detalle (ya cumple: 44×48 px, 8 px). Resuelve UX-01 (tarjeta), UX-03 (tarjeta), UX-04 y la competencia de acciones. Costo: se pierde el atajo de la tarjeta.
- **B**: tarjetas a ancho completo en teléfono (358 px) con píldoras de 44×44 y 8 px, máximo 5 + «+N». Cumple Fitts pero sigue en ~9 controles por tarjeta (Hick) y alarga el catálogo.
- **C**: aprobar una excepción en `.ux/config.yaml → exceptions:` (`rule: touch-target-platform`, `where: tarjeta del catálogo`, `reason`, `date`), con la justificación del equipo. No se hizo nada de esto.

## Checklist de ux-laws por pantalla (390 px)
✅ cumple · ❌ falla (bloqueante) · ⚠️ sugerencia no cumplida · ❔ no verificable

| Regla (ley) | Inicio | Catálogo | Detalle | Contacto | Admin · Fotos |
|---|---|---|---|---|---|
| `touch-target-platform` (Fitts) | ❌ UX-01, 02 | ❌ UX-01, 02 | ❌ UX-02 | ❌ UX-02 | ✅ botones 48 px |
| `fitts-reach` (Fitts) | ✅ | ✅ | ✅ barra de consulta y navegación abajo | ✅ | ❔ uso de escritorio |
| `fitts-spacing` (Fitts) | ❌ UX-03 | ❌ UX-03 | ❌ UX-03 (pestañas; opciones 8 px ✅) | ❌ UX-03 (pestañas) | ❌ UX-03 (12 < 16) |
| `hick-options` (Hick) | ❌ UX-04 (10) | ❌ UX-04 (16) | ✅ 5; grupos ≤ 7 | ✅ 2 | ❔ no medido |
| `hick-steps` (Hick) | ✅ | ✅ 5 filtros | ✅ | ✅ | ❔ formulario sin cambios |
| `primary-action-competition` (Hick) | ⚠️ tarjetas | ⚠️ tarjetas | ✅ un botón | ✅ | ✅ |
| `jakob-conventions` (Jakob) | ⚠️ UX-09 | ⚠️ UX-09 | ⚠️ UX-09 | ⚠️ UX-09 | ✅ |
| `miller-chunks` (Miller) | ⚠️ UX-08 | ⚠️ UX-08 | ⚠️ UX-08 | ✅ | ✅ |
| `peak-end` (apogeo y final) | ✅ cierra con «Cómo comprar» y WhatsApp | ✅ sin resultados ofrece salida | ⚠️ UX-06 | ✅ WhatsApp y mapa | ✅ anuncio de guardado |
| `type-levels` (estética) | ⚠️ UX-07 (7) | ⚠️ UX-07 (6) | ⚠️ UX-07 (5) | ⚠️ UX-07 (6) | ❔ |
| `spacing-scale` (estética) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `aesthetic-consistency` (estética) | ✅ | ✅ | ✅ | ✅ | ✅ |

## Sugerencias (no bloquean)
- **[UX-05] ⚠️ `primary-action-competition`** — en la tarjeta la talla elegida va rellena y la etiqueta de precio destaca; con la opción A desaparece.
- **[UX-06] ⚠️ `peak-end`** — en el teléfono el detalle no explica qué pasa tras «Consultar por WhatsApp»: la frase «Cerramos tu compra por WhatsApp: entrega a domicilio o recojo en el almacén» vive en un bloque `hidden md:flex` (`pages/p/[slug].astro`). **Confirmado el hallazgo del usuario** ✔. Fix: mostrarla también en teléfono, encima de la barra o bajo el selector, con lo que sigue (WhatsApp abre con el mensaje listo, el equipo responde, pago manual y entrega o recojo).
- **[UX-07] ⚠️ `type-levels`** — tamaños de letra por pantalla (medidos): Inicio 7 (12, 14, 16, 18, 20, 24, 30), Catálogo 6, Contacto 6, Detalle 5; una sola familia (Inter). Límite del equipo: 4.
- **[UX-08] ⚠️ `miller-chunks`** — «+591 77045885» sin agrupar los 8 dígitos: `displayWhatsapp` en `lib/whatsapp.ts` → «+591 7704 5885».
- **[UX-09] ⚠️ `jakob-conventions`** — el ícono de WhatsApp es un globo de chat genérico; ayuda poner la palabra al lado (ya está en la barra inferior y en los botones).

## No pude verificar (❔)
- Zona del pulgar y barras fijas apiladas en un **teléfono real** (con teclado y zona segura de iPhone): solo Chromium emulado.
- `fitts-reach`, `hick-options` y `type-levels` del **admin** (pantalla de producto): no lo medí en el navegador; sus fotos usan botones de 48 px.
- Escritorio: no se evaluó con la regla de 24 px (la tienda se revisó como móvil).

---

## Estado después de las correcciones (misma medición, Chromium a 390 px)
**Veredicto: LISTO** · 0 bloqueantes · el escáner da los mismos 6 falsos positivos descartados (3 en cadenas de pruebas, 3 en `IconButton` del admin con `label`).

| Hallazgo | Corrección | Medido después |
|---|---|---|
| UX-01 tarjeta bajo 44 px | **Opción A**: la tarjeta es un solo objetivo (foto, precio, nombre y resumen en texto); tallas y colores se eligen en el detalle. Se eliminaron `SizePill(s)` y `ColorSwatch(es)`. | Sin controles de talla ni color en las tarjetas; en el detalle 44×48 px |
| UX-02 logo | `StoreBrand.astro`: `inline-flex min-h-11 items-center` | **140×44 px** |
| UX-03 separaciones | Pestañas con `gap-2`; «Quitar» con `ml-4` en el admin | Separación mínima de la tienda **8 px**; mover→quitar 12 + 16 = **28 px** (calculado por las clases `gap-3` y `ml-4`, no medido en el navegador) |
| UX-04 Hick | La tarjeta ofrece una sola acción | Controles por nivel en la primera pantalla: tarjetas 4, barra inferior 4, cabecera 2, filtro 1 (todos ≤ 7) |
| UX-06 final del flujo | Párrafo «Se abre el chat de WhatsApp con tu mensaje listo… coordinamos el pago y la entrega…» visible en todos los anchos | Presente a 390 y 1280 px |
| UX-08 Miller | `displayWhatsapp` agrupa: «+591 7704 5885» | Visible en el pie |

Siguen como **sugerencias** (no bloquean): UX-05 (resuelta con la opción A), UX-07 tamaños de letra por pantalla (5 a 7; límite del equipo 4), UX-09 ícono de WhatsApp genérico.
Sin verificar: teléfono real y el admin en navegador (sus pruebas unitarias pasan).
