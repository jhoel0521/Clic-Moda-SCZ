# Standard changelog

The version of the standard increases with every change to `.ux/standard/`. Reports record the version they were made against.

## [0.3.0] — 2026-11-12
- Glosario inicial en `users.md` (Modelo, Talla, Color, Agotada, Últimas unidades, Consultar por WhatsApp, Preguntar cuándo vuelve, Catálogo, Inventario, Imágenes, Principal, Recojo) con los términos que no se deben usar. No cambia colores, marca ni tokens. Los perfiles de usuarios siguen sin definir (piden una entrevista con el cliente).
- Requested by: equipo (ux-plan-review de `shop-catalog`, PLAN-08) · Reason: los textos de la tienda y del panel necesitan un vocabulario único.

## [0.2.0] — 2026-11-11
- Colores corregidos para cumplir WCAG AA (los 9 pares de contraste pasan): `text-muted` #8a7a84 → #6b5a64; `action` #e63f6e → #c7305a (con texto blanco: 3.96:1 → 5.25:1); `success` #16a34a → #15803d; `warning` #d97706 → #92400e; `danger` #dc2626 → #b91c1c; `border` pasa a ser el borde de controles (#8a7a84, 3.89:1) y se agrega `border-subtle` (#ede7e9) para lo decorativo.
- Nuevos: `brand` (#e63f6e, solo decorativo) y los primitivos `neutral.500` y `amber.800`. brand.md: color de acción, marca como texto y colores de estado.
- Requested by: equipo (ux-discover, por partes) · Reason: 5 pares de contraste fallaban; se adoptan los valores que el admin ya aplicaba y verificó.

## [0.1.0] — 2026-11-10
- Initial standard created by ux-init / ux-discover.
- Requested by: ux-init (automatic) · Reason: initial setup
