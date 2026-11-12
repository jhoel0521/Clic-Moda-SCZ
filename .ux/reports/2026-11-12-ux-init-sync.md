# ux-init · sync a ux-kit 0.2.0

- **Fecha**: 2026-11-12 · **Modo**: sync · **ux-kit**: commit `44ecd72` (0.2.0)
- Skills actualizadas (6): ux-check (0.2.0, con «3b. ux-laws checklist»), ux-discover, ux-guide, ux-init, **ux-laws (nueva)** y ux-plan-review. `agent/skills/` (fuente de verdad del proyecto) quedó al día y `pnpm skills:check` pasa.

## Archivos refrescados
- `.ux/knowledge/`: `README.md`, `laws-of-ux.md`, `myths.md`, `severity.md` (cambiaron). Nuevas reglas bloqueantes de Fitts y Hick en `severity.md`: `touch-target-platform`, `fitts-reach`, `fitts-spacing`, `hick-options`, `hick-steps`, `primary-action-competition`.
- `.ux/scripts/`: sin cambios (idénticos a los de 0.2.0).
- `.ux/standard/`: **no se tocó**.

## Hechos sincronizados (`config.yaml`)
- `apps/shop`: el comentario del tema decía «solo importa tailwindcss: aún no define valores»; ya define la marca y los tokens en `@theme`. Se actualizó el comentario. Stack, plataformas y ruta no cambian.
- `apps/admin`: sin cambios.
- `services/api`: sin UI, no se agrega a `apps:`.

## Decisiones pendientes (no se cambiaron)
- Usuarios por app (`users:`) siguen pendientes de `ux-discover`.
- Las plataformas de `shop` siguen en `[web]` aunque el uso real es móvil primero: con la regla nueva, **la web en teléfono cuenta como móvil**, así que `touch-target-platform` aplica a la tienda salvo que se declare lo contrario aquí.
