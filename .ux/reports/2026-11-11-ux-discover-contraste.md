# ux-discover — colores y contraste (actualización por partes)

- **Fecha**: 2026-11-11 · **Skill**: ux-discover · **Estándar**: 0.1.0 → 0.2.0
- **Alcance**: solo colores de `tokens.json` y las líneas de color de `brand.md`. Usuarios, referencias y preguntas no cambian.

## Resultado
Los 5 pares que fallaban pasan; los 9 pares declarados cumplen (`node .ux/scripts/tokens.mjs .ux/standard/tokens.json`).

| Par | Antes | Ahora |
|---|---|---|
| text-muted / surface | 4.04:1 | 6.42:1 |
| on-action / action | 3.96:1 | 5.25:1 |
| border / bg (mín. 3) | 1.17:1 | 3.89:1 |
| success / bg | 3.17:1 | 4.82:1 |
| warning / bg | 3.06:1 | 6.82:1 |

## Impacto (estándar 0.1.0 → 0.2.0)
- **admin**: alineado. `apps/admin/src/styles/global.css` ya usaba estos valores; `#e63f6e` solo aparece como `--color-brand` y en el degradado del logo (uso decorativo permitido).
- **shop**: sin tema todavía (esqueleto); cuando se cree debe partir de los tokens 0.2.0.
- Los reportes anteriores de `.ux/reports/` se hicieron contra 0.1.0.

## Pendiente para el equipo
- Confirmar los valores para pasar `ux-kit.status` de `extracted` a `defined`.
- `info` y el modo oscuro siguen sin definir.
