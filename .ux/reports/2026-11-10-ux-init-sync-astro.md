# ux-init (sync) — shop y admin ya son Astro

- **Fecha**: 2026-11-10 · **Skill**: ux-init (modo sync) · **Standard**: 0.1.0 (sin cambios)

## Hechos sincronizados
- `.ux/knowledge/` y `.ux/scripts/` ya eran idénticos a los de la skill (`diff -rq`).
- `config.yaml → apps`:
  - apps/shop: `next + react + tailwind-v4` → `astro + tailwind-v4` (tema `src/styles/global.css`).
  - apps/admin: agregada (`astro + react + tailwind-v4`).
  - services/api: sin UI, no se agrega.

## Diferencias con el estándar
Los temas de shop y admin solo hacen `@import 'tailwindcss'`: no definen colores, tipografía ni espaciado.
`tokens.json` (`ux-kit.status: extracted`) viene del prototipo Next y hoy **no tiene código que lo aplique**.
Decisión para ux-discover: confirmar la marca y volcar los tokens a los temas de Astro al construir la primera pantalla.

## Siguiente paso
Ejecutar ux-discover (usuarios, marca, referencias) y luego ux-check al tener las primeras pantallas.

## Contrastes que fallan en `tokens.json` (decisión del equipo, no se modificó)
- `border / bg`: 1.17:1 (mínimo 3:1)
- `success / bg`: 3.17:1 (mínimo 4.5:1)
- `warning / bg`: 3.06:1 (mínimo 4.5:1)
Se pueden sugerir valores que pasen con `node .ux/scripts/contrast.mjs <fg> <bg> --suggest`.
