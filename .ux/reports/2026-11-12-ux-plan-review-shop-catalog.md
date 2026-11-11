# Revisión UX del plan — shop-catalog

- **Fecha**: 2026-11-12 · **Skill**: ux-plan-review · **Estándar**: 0.2.0
- **Plan**: `openspec/changes/shop-catalog/` (proposal, 5 specs, design, tasks)
- **Apps**: `apps/shop` (catálogo y detalle, móvil primero, visitante anónimo desde WhatsApp/Live) y `apps/admin` (sección de fotos, Gerente)
- **Nota**: `users.md` aún tiene marcadores sin completar; no hay glosario ni perfiles que aplicar. Se usan los valores por omisión de `.ux/knowledge/`.

## Veredicto: LISTO CON AJUSTES

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia |
|---|---|---|---|
| 0 | 3 | 4 | 2 |

## Ya cubierto en el plan ✅
Flujo de la compra sin cuenta; selección de talla en la URL y sin JavaScript; barra inferior fija en teléfono; estados vacío y de error de la API; sin foto; 404 con salida al catálogo; ancho y alto en imágenes; 360 px sin desborde; objetivos de 44 px; formularios sin anidar y consola limpia (el error de hidratación ya ocurrido); orden de fotos con botones (no solo arrastrar); ux-check al final.

## Hallazgos

### 🟠 PLAN-01 — Producto agotado en el detalle es un callejón sin salida
Si todas las tallas están agotadas el botón queda deshabilitado y el visitante que llegó desde el Live se va sin acción.
**Agregar** (spec `shop-product-inquiry`): escenario «Producto agotado: el botón pasa a "Preguntar cuándo vuelve" y abre WhatsApp con el producto, sin talla».

### 🟠 PLAN-02 — Selector de talla y color: accesibilidad
El plan dice "deshabilitadas" pero no cómo se entiende ni se alcanza.
**Agregar** (spec `shop-catalog-pages`, tarea 6.1): grupo con `fieldset` y `legend` («Talla», «Color»); cada opción de al menos 44 px; las agotadas dicen «Agotada» con texto (no solo color ni tachado); los colores se nombran con texto, no solo muestra; el elegido se ve con borde y marca, no solo color; foco visible.

### 🟠 PLAN-03 — Filtros del catálogo en 360 px
Un formulario GET con cuatro filtros ocupa toda la pantalla antes del primer producto.
**Agregar** (spec `shop-catalog-pages`, tarea 6.2): en teléfono los filtros van en un panel plegable (`details`) con el resumen «Filtrar (2)»; los filtros activos se ven como chips que se quitan con un toque (44 px); se muestra «N productos» y el orden; la paginación lleva `rel="prev"/"next"` y conserva los filtros.

### 🟡 PLAN-04 — Galería: alternativa al deslizar y textos alternativos
**Agregar** (tarea 6.1): botones «Foto anterior / siguiente» (no solo deslizar, WCAG 2.5.7) y miniaturas tocables; `alt` de cada foto = texto alternativo de la imagen, y si falta, «<producto>, foto N de M»; la foto activa anuncia su posición.

### 🟡 PLAN-05 — Copy de disponibilidad y precio
**Agregar** (design D5 / spec `public-catalog`): `low` se muestra como «Últimas unidades» (sin cifras), `out` como «Agotada»; el precio como «Bs 349,90» con formato es-BO; sin estados solo con color (ícono o texto además del color de `warning`/`danger`).

### 🟡 PLAN-06 — Fotos en el admin: avisos y estados
**Agregar** (tarea 4.1): región `aria-live` que anuncia el movimiento («Foto movida a la posición 2»); la principal se marca con una etiqueta «Principal», no solo por posición; estado «Guardando…» con el botón desactivado; el texto aclara que quitar una foto del producto **no borra** la imagen del módulo de imágenes (no hace falta confirmar); mensaje de error por imagen que falla.

### 🟡 PLAN-07 — Foco no tapado por la barra fija
La barra inferior fija puede tapar el elemento enfocado al tabular (WCAG 2.4.11).
**Agregar** (spec `shop-catalog-pages`): el contenido deja un margen inferior igual a la altura de la barra y `scroll-padding-bottom` para que el foco nunca quede detrás; el ancla «Elige tu talla» mueve el foco al selector.

### 💡 PLAN-08 — Glosario
Completar `users.md` con un glosario mínimo (Modelo, Talla, Color, Agotada, Consultar) antes de escribir los textos de la tienda → `ux-discover` (solo la parte de usuarios).

### 💡 PLAN-09 — Aviso de privacidad breve
La cookie `ref` es funcional y sin datos personales; una línea en el pie («No guardamos datos personales») refuerza la confianza del cliente y respalda la regla del cliente de no dejar datos para auditorías.

## Siguiente paso
Si se acepta, agregar PLAN-01 a PLAN-07 a las specs y tareas (no tocan código) y correr `ux-check` al terminar cada pantalla (ya está en la tarea 7.1).
