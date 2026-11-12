# ux-check con ux-laws — change `stock-movements-events` (admin)

- **Fecha**: 2026-11-12 · **Skill**: ux-check 0.2.0 (checklist 3b) · **Estándar**: 0.3.0 · **Plataforma**: `--platform mobile` (admin web, usado en teléfono)
- **Base**: `HEAD` (cambios sin commit en `feat/stock-movements-events`; 17 archivos de `apps/admin` revisados por el escáner).
- **Método**: escáner + lectura de código + **Chromium a 390 px** (`apps/admin/e2e/fitts-tipos.spec.ts`, 3 pruebas) midiendo tamaño de cada control, separación entre vecinos y cantidad de controles fuera de la lista.
- **Pantallas**: hoja de movimiento (campo Tipo), historial con tipo y saldo, pantalla de tipos (`/productos/tipos`) y su enlace desde Inventario.

## Veredicto: LISTO — 0 bloqueantes

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | ⚠️ Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 (1 corregido) | 0 | 0 | 2 | 2 |

Escáner: 1 candidato (`WEB-ICON-NAME` en `MovementTypesBoard.tsx`, un `<button>` «sin nombre»). **Descartado**: el botón de cada fila contiene el nombre y las insignias del tipo (nombre accesible «Ingreso De sistema»); el escáner no ve texto que llega por un subcomponente. 0 hallazgos antiguos ocultos.

## Hallazgo corregido durante la revisión
- **[UX-01] ❌ `primary-action-competition` · Hick** — la pestaña elegida usaba el estilo de acción principal y competía con «Agregar»; con un tipo abierto había además dos acciones principales a la vez («Guardar» y «Agregar»). **Corrección**: las pestañas son secundarias (la elegida lleva borde y fondo de acento y `aria-pressed`) y el formulario de alta se oculta mientras se edita un tipo. Medido otra vez: pasa.

## Checklist de ux-laws (390 px)
| Regla (ley) | Hoja de movimiento | Historial | Pantalla de tipos | Enlace en Inventario |
|---|---|---|---|---|
| `touch-target-platform` (Fitts) | ✅ todos ≥ 44 px (medido) | ✅ sin controles | ✅ ≥ 44 px, con el editor abierto también | ✅ `min-h-12` |
| `fitts-reach` (Fitts) | ✅ hoja inferior, «Registrar» abajo | ✅ | ❔ zona del pulgar sin teléfono real | ✅ |
| `fitts-spacing` (Fitts) | ✅ ≥ 8 px (medido) | ✅ | ✅ ≥ 8 px (medido) | ✅ |
| `hick-options` (Hick) | ✅ 4 controles; «Tipo» con máx. 7 opciones y «Ver todos» | ✅ | ✅ ≤ 7 fuera de la lista (5 base, 7 con el editor) | ✅ |
| `hick-steps` (Hick) | ✅ un paso | ✅ | ✅ | ✅ |
| `primary-action-competition` | ✅ un solo «Registrar» | ✅ | ✅ tras UX-01 | ✅ |
| `jakob-conventions` (Jakob) | ✅ lista nativa para el tipo | ✅ | ✅ interruptor y pestañas conocidos | ✅ |
| `miller-chunks` (Miller) | ✅ | ✅ | ✅ tipos agrupados por clase | ✅ |
| `peak-end` (apogeo y final) | ✅ «En cola» y luego «Listo» | ✅ saldo visible | ✅ anuncio `aria-live`, foco en el tipo nuevo, error junto al campo | ✅ |
| `type-levels` (estética) | ❔ no medido | ❔ no medido | ❔ no medido | ❔ |
| `spacing-scale` / `aesthetic-consistency` | ✅ componentes y tokens del panel | ✅ | ✅ | ✅ |

## Sugerencias (no bloquean)
- **[UX-02] ⚠️ `peak-end` / formularios** — el motivo del movimiento se escribe aparte del tipo. Precargarlo con el nombre del tipo ahorraría escribir en el caso común (PLAN-06 del plan).
- **[UX-03] ⚠️ `hick-options`** — la lista de tipos de una clase crece con los datos: las filas no cuentan como opciones (un control cada una), pero con más de ~10 tipos convendría una búsqueda o «Ver todos». No hace falta hoy (9 sembrados).

## No pude verificar (❔)
- **Zona del pulgar y teclado en pantalla** en un teléfono real (solo Chromium emulado a 390 px).
- **Tamaños de letra por pantalla** (`type-levels`): no se midieron en esta pasada.
- No hay `users.md` con glosario: los textos («Tipo», «Retiros», «Merma») no se contrastaron con él.
