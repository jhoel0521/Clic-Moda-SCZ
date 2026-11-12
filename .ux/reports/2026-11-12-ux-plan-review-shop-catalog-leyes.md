# Revisión del plan con ux-laws — change `shop-catalog`

- **Fecha**: 2026-11-12 · **Skill**: ux-plan-review (ux-kit 0.2.0) · **Estándar**: 0.3.0
- **Alcance**: `openspec/changes/shop-catalog/` (proposal, design, tasks y 5 specs). Revisión anterior (sin leyes): `2026-11-12-ux-plan-review-shop-catalog.md`.
- **Plataforma tomada**: web en teléfono = móvil (regla del equipo).

## ¿Declara el plan Hick, Fitts y el final de cada flujo?
**No.** Búsqueda en `proposal.md`, `design.md`, `tasks.md` y los 5 specs: ninguna mención de Hick, Fitts, Miller, apogeo/final, «opciones principales por pantalla» ni zona alcanzable. Lo único cercano:

| Ley | Qué dice hoy el plan | Veredicto |
|---|---|---|
| **Fitts** (tamaño) | `shop-catalog-pages` · *Browsing is fast and comfortable on a phone*: «objetivos táctiles de al menos 44 px» (línea 106). | Declarado pero **incumplido por la propia implementación** (ver PLAN-02). |
| **Fitts** (zona) | `design.md` D12: barra inferior fija con el botón en el teléfono. | Solo el detalle; falta declarar la zona de la navegación y de cada pantalla. |
| **Fitts** (separación) | Nada. | **Falta.** |
| **Hick** | Nada (filtros en panel plegable por `D16`, sin contar opciones). | **Falta.** |
| **Peak-End** | Cada flujo de error termina en una salida (404/503, sin resultados). El flujo principal termina en WhatsApp sin decir qué ve la persona después. | **Incompleto.** |

## Los 11 puntos
1 Usuarios y contexto ⚠️ (`users.md` aún sin perfiles; «móvil primero» está en el diseño, no en el estándar) · 2 Flujo ⚠️ (ver PLAN-04) · 3 Estados ✅ (404, 503, sin resultados, sin fotos, agotado, sin WhatsApp) · 4 Plataforma ✅ · 5 Accesibilidad ⚠️ (PLAN-02) · 6 Contenido ✅ (glosario `0.3.0`) · 7 Estándar visual ✅ (tokens; el mapa de colores por nombre es dato decorativo) · 8 Formularios ✅ (filtros por GET, datos en la URL) · 9 Riesgo ✅ (la escasez «Últimas unidades» es real, ≤ 3) · 10 Rendimiento ✅ (caché, sin N+1, actualización sin recarga) · 11 Verificación ⚠️ (existe la tarea 7.1 de `ux-check`, pero no la comprobación de leyes).

## Hallazgos

### PLAN-01 — ❌ blocker · Hick no declarado · `hick-options`
- **Dónde**: `proposal.md`, `design.md`, specs de `shop-catalog-pages`.
- **Evidencia**: no se dice cuántas opciones principales tiene cada pantalla. Medido en el código ya construido: Inicio 10 controles visibles en la primera pantalla, Catálogo 16 (ver informe `ux-check`), Detalle 5.
- **Qué agregar al plan** (`design.md`, nueva decisión D17): «Hick: máximo 7 opciones principales visibles por pantalla. Navegación: cabecera 3, barra inferior 4, pie 3. Catálogo: 5 filtros. Tarjeta: **una** acción principal (abrir el producto); no ofrece tallas ni colores como controles. Detalle: una acción principal (Consultar por WhatsApp)».

### PLAN-02 — ❌ blocker · Fitts: el spec exige 44 px y la tarjeta lo incumple · `touch-target-platform`
- **Dónde**: `shop-catalog-pages/spec.md:106` (44 px) frente a `spec.md:38` («mismo tamaño y estilo (píldoras) que las de la tarjeta») e implementación.
- **Evidencia**: tarjeta 40×36 px (tallas) y 32×32 px (colores); detalle 44×48 px.
- **Qué agregar**: un escenario «Cada objetivo táctil de la tienda mide al menos 44×44 px con 8 px entre vecinos, y 16 px entre acciones opuestas» y la decisión de qué hace la tarjeta con las tallas (ver informe `ux-check`, UX-01/UX-04).

### PLAN-03 — 🟠 major · Fitts: zona y separación sin declarar · `fitts-reach`, `fitts-spacing`
- **Qué agregar** a `design.md` D12: «Zona alcanzable: la navegación principal y la acción principal van en el tercio inferior (barra inferior de 4 pestañas; en el producto, barra de consulta encima). Controles críticos nunca pegados al borde superior. Separación mínima 8 px (16 px entre acciones opuestas)».

### PLAN-04 — 🟡 minor · Peak-End: el flujo principal no dice cómo termina · `peak-end`
- **Evidencia**: el texto «Cerramos tu compra por WhatsApp: entrega a domicilio o recojo en el almacén» solo se ve en escritorio (`pages/p/[slug].astro`, bloque `data-live="cta"`, `hidden md:flex`). En el teléfono, tras tocar «Consultar por WhatsApp», nada anticipa qué sigue.
- **Qué agregar** (escenario en `shop-product-inquiry`): «WHEN el visitante está en el detalle en un teléfono THEN junto al botón se lee una línea que dice qué pasa al tocar: WhatsApp abre con el mensaje listo, el equipo responde, y el pago y la entrega o el recojo se coordinan ahí». Pico del flujo: el mensaje ya armado con producto, talla y precio.

### PLAN-05 — 🟡 minor · Peak-End del admin
- Fotos: dejar escrito que el flujo termina con el anuncio de «Fotos guardadas» (región `aria-live`) y qué pasa con las fotos quitadas (siguen en el módulo de imágenes).

### PLAN-06 — 💡 sugerencia · Miller, Jakob y tipografía · `miller-chunks`, `jakob-conventions`, `type-levels`
- Número de teléfono con grupos («+591 7704 5885»); el ícono de WhatsApp es un globo genérico; hasta 7 tamaños de letra por pantalla (límite del equipo: 4).

### PLAN-07 — 🟡 minor · Verificación sin leyes · `ux-laws`
- **Qué agregar** a `tasks.md`: «7.x Pasar el checklist de ux-laws (`ux-check` 0.2.0) por pantalla a 390 px con `--platform mobile`; Fitts y Hick sin fallos o con excepción aprobada».

## Veredicto del plan: NO LISTO
2 bloqueantes (PLAN-01, PLAN-02), 1 mayor, 3 menores, 1 sugerencia. Nada se editó en el plan: falta tu decisión sobre la tarjeta (informe `ux-check`) y tu respuesta a «¿agrego estos puntos al plan?».

---

## Estado después de aplicar el plan (a pedido del usuario)
Se agregó al change: `design.md` **D17** (Fitts, Hick, apogeo y final, Miller/Jakob/estética), tres requisitos nuevos en `shop-catalog-pages` («Touch targets are large, separated and reachable», «Each screen offers few options and one primary action», «The flow explains how it ends»), la tarjeta reescrita como un solo objetivo, dos escenarios en `product-photos` y la tarea 7.3. PLAN-01 a PLAN-07 quedan cubiertos; el plan declara ahora Hick, Fitts y cómo termina cada flujo. **Veredicto del plan: LISTO.**
