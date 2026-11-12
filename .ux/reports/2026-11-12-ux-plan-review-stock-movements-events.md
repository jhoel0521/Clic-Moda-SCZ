# Revisión del plan con ux-laws — change `stock-movements-events`

- **Fecha**: 2026-11-12 · **Skill**: ux-plan-review (ux-kit 0.2.0) · **Estándar**: 0.3.0
- **Alcance**: `openspec/changes/stock-movements-events/` (proposal, design, tasks y 5 specs).
- **Plataforma**: admin web, usado en teléfono y escritorio por Gerente, Despacho y Atención. `users.md` sigue sin perfiles ni glosario: se aplican los valores por omisión de `.ux/knowledge`.
- **Alcance de UI**: solo el admin (hoja de movimiento, historial, pantalla de tipos). La API y la tienda no tienen UI nueva.

## ¿Declara el plan Hick, Fitts y el final de cada flujo?
| Ley | Qué dice el plan | Veredicto |
|---|---|---|
| **Hick** | D10 y D11: máximo 7 tipos visibles por clase, tipo de sistema preseleccionado, una acción principal por pantalla. | ✅ declarado |
| **Fitts** | D11 y spec `warehouse-admin`: controles de 44×44 px con 8 px de separación; acción principal al alcance del pulgar. | ✅ declarado |
| **Peak-End** | El flujo del movimiento termina en «En cola» y luego el resultado, como hoy. La pantalla de tipos no decía cómo termina. | ⚠️ incompleto (PLAN-04) |

## Hallazgos (antes de corregir)
- **PLAN-01 · 🟠 mayor · `hick-options`** — la pantalla de tipos iba como pantalla nueva sin decir dónde entra. La navegación del Gerente ya tiene 5 entradas (Inicio, Categorías, Inventario, Imágenes, Configuración): una sexta pestaña empuja el límite de 7 y estrecha la barra del teléfono. **Adición**: enlace secundario desde Inventario, sin pestaña nueva.
- **PLAN-02 · 🟠 mayor · formularios y contenido** — el Gerente debía escribir el «código» del tipo (`PURCHASE`), un dato técnico sin sentido para él, con reglas de formato. **Adición**: el sistema lo genera del nombre y la persona solo escribe el nombre.
- **PLAN-03 · 🟡 menor · `hick-options`** — «los 7 más usados» no tiene definición ni dato que lo calcule. **Adición**: orden fijo (sistema primero, luego por creación) y «Ver todos».
- **PLAN-04 · 🟡 menor · `peak-end` y estados** — la pantalla de tipos no declaraba confirmación, foco, estados de carga y error ni permisos. **Adición**: escenarios de anuncio `aria-live`, foco en el tipo afectado, conservar lo escrito, cargando, error con reintento y sin permiso.
- **PLAN-05 · 🟡 menor · coherencia** — el spec decía que el Gerente «puede ver el último error» de una entrega, pero no hay pantalla para eso. **Adición**: dejarlo escrito como solo por API y fuera de alcance la pantalla.
- **PLAN-06 · 💡 sugerencia · formularios** — el motivo del movimiento sigue siendo obligatorio y se escribe aparte del tipo. Precargarlo con el nombre del tipo ahorraría escribir en el caso común. No se agregó: es decisión del equipo.
- **PLAN-07 · 💡 sugerencia · contenido** — los nombres de los 6 tipos sugeridos y de los mensajes de error deben pasar por el glosario cuando `users.md` lo tenga.

## Los 11 puntos
1 Usuarios y contexto ⚠️ (`users.md` sin completar) · 2 Flujo ✅ (con PLAN-04) · 3 Estados ✅ tras PLAN-04 · 4 Plataforma ✅ · 5 Accesibilidad ✅ (aria-live, foco, 44 px) · 6 Contenido ✅ tras PLAN-02 · 7 Estándar visual ✅ (sin tokens nuevos) · 8 Formularios ✅ tras PLAN-02 · 9 Riesgo ✅ (desactivar es reversible; no hay borrado) · 10 Rendimiento ✅ (lista corta) · 11 Verificación ✅ (tareas 6.2 y 7.2).

## Estado después de aplicar el plan
Se agregaron al change: el código generado desde el nombre (spec `movement-types`, D2 y tarea 2.1), el enlace secundario desde Inventario y los estados de la pantalla de tipos (spec `warehouse-admin`, D10), el orden fijo de los tipos, y la aclaración de que las entregas de eventos se ven solo por API (spec `stock-events` y proposal). PLAN-06 y PLAN-07 quedan como sugerencias.

**Veredicto del plan: LISTO** · 0 bloqueantes · 2 mayores resueltos · 3 menores resueltos · 2 sugerencias abiertas.
