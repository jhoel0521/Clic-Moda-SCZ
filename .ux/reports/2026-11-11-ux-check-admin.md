# ux-check — apps/admin (pantallas del Inventario)

- **Fecha**: 2026-11-11 · **Skill**: ux-check · **Estándar**: 0.2.0
- **Apps / plataformas**: admin · web, móvil primero · **Stack**: astro + react + tailwind-v4
- **Método**: scan.mjs sobre `apps/admin/src` (4 candidatos: 1 confirmado, 3 descartados) · lectura de código · pruebas Playwright a 360 px y en iPhone emulado

## Verdict: READY

| ❌ Blocker | 🟠 Major | 🟡 Minor | 💡 Suggestion | ❔ Unverifiable |
|---|---|---|---|---|
| 0 | 0 | 2 (corregidos) | 0 | 2 |

## Summary
Sin bloqueos. Se corrigieron dos menores: un botón de 40 px y el estado de la celda de la matriz, que dependía solo del color. Los colores cumplen AA con el estándar 0.2.0, los objetivos táctiles son de 48 px o más, y a 360 px la página no se desplaza en horizontal (la matriz sí, dentro de su contenedor, con el color fijo).

## Findings
### [M1] "Ver historial" medía 40 px — 🟡 Minor (corregido)
- **Dónde**: `components/CellPanel.tsx:64` · **Regla**: WEB-TARGET (44 px en móvil)
- **Fix aplicado**: `min-h-12` (48 px).

### [M2] El estado de la celda solo se distinguía por color — 🟡 Minor (corregido)
- **Dónde**: `components/MatrixTable.tsx` · **Regla**: no depender solo del color (WCAG 1.4.1)
- **Evidencia**: agotada (rojo), stock bajo (ámbar) e inactiva (gris) cambiaban solo de color y tachado.
- **Fix aplicado**: el nombre accesible de la celda añade "agotada", "stock bajo" o "inactiva", y la tarjeta muestra una leyenda visible.

## Candidatos descartados
- `CategoriesManager.tsx:93-94` y `LogoutButton.tsx:10` (WEB-ICON-NAME): `IconButton` pone `aria-label` y `title` desde la propiedad `label`; el escáner no lo ve. Falsos positivos.

## ✅ What passes
- Contraste AA de todos los pares del estándar (`tokens.mjs` sin problemas).
- Interruptor de 48×64 px con `role="switch"` y `aria-checked`; celdas de 48 px mínimo.
- Foco visible global (`:focus-visible` en `global.css`); la hoja de movimientos usa `<dialog>` nativo.
- Estados: carga, vacío y error en todas las listas; doble envío bloqueado en los movimientos; rechazo explicado.
- Acciones destructivas con confirmación (borrar categoría); desactivar es reversible.
- Sin desplazamiento horizontal de la página a 360 px (4 pantallas, Playwright).

## ❔ To verify
- Lector de pantalla real (VoiceOver en iPhone): los nombres accesibles están, pero no se probó con uno.
- Modo oscuro: el estándar aún no lo define.
