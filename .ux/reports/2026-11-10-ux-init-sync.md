# ux-init (sync) — actualizacion a ux-kit c59d701

- **Fecha**: 2026-11-10 · **Skill**: ux-init (modo sync) · **Standard**: 0.1.0 (sin cambios)
- **Commit de ux-kit**: c59d701760ed5e1985c7f52569c7078fe3732e60 (main)

## Hechos sincronizados
- `.ux/scripts/` y `.ux/knowledge/` sobrescritos con los de la skill (idénticos, verificado con `diff -rq`).
  Scripts nuevos: `is-main.mjs`, `token-extract.mjs`.
- `detect.mjs` ahora: `Monorepo: yes`; candidatos de tema de shop = `tailwind.config.ts`, `globals.css`;
  `apps/admin` y `services/api` en "Without UI" (package.json sin dependencias).
- `config.yaml → apps`: sin cambios (shop sigue igual; admin/api no se agregan por no tener UI).
- `.ux/standard/` no se modificó (hash idéntico antes y después).

## Pendiente de decisión (no se aplicó)
Comparación del `tokens.json` real contra la extracción automática (`--from-tailwind --from-css`),
hecha sobre una copia fuera del repo. Ver la conversación para el detalle.
