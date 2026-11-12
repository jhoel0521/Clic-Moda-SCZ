# Revisión UX — esqueleto de la tienda (barra superior, menú, barra inferior, pie) y tarjeta de producto

- **Fecha**: 2026-11-12 · **Skill**: ux-check · **Versión del estándar**: 0.3.0
- **App**: `apps/shop` · web, móvil primero (390 px) y escritorio (1280 px) · **Stack**: Astro SSR + Tailwind v4
- **Método**: `scan.mjs` (2 candidatos de texto pequeño, corregidos) + lectura del código + **navegador real** (Chromium): sin desborde horizontal, consola limpia, menú lateral abre y cierra con Esc, la barra inferior se oculta en el detalle del producto.

## Veredicto: LISTO, con 2 desvíos conscientes

| ❌ Bloqueante | 🟠 Mayor | 🟡 Menor | 💡 Sugerencia | ❔ No verificable |
|---|---|---|---|---|
| 0 | 0 | 2 | 2 | 1 |

## Qué se hizo
El esqueleto vuelve al de la demo aprobada (`demo-aprobada`: `StoreNavbar`, `MobileBottomNav`, `StoreFooter`) sobre el estándar:
- **Barra superior fija** con difuminado, sombra y borde; enlaces centrales Inicio, Catálogo y Contacto con subrayado en la página activa (`aria-current="page"`); búsqueda y WhatsApp a la derecha. Marca en texto bicolor («CLIC» + «MODA SC» con el color de la marca) o el logo de la configuración.
- **Sin menú en la cabecera**: en el teléfono la navegación es solo la barra inferior (el menú lateral se quitó: duplicaba la barra y dejaba la ficha del producto sin navegación).
- **Barra inferior del teléfono** con 4 pestañas (Inicio, Catálogo, Contacto, WhatsApp), ícono relleno en la activa y margen de zona segura del iPhone. Siempre visible, también en el detalle del producto, donde la barra del botón de consulta va encima.
- **Pie en una sola superficie oscura** (marca y lema, «Descubrir» solo en escritorio porque en el teléfono ya está la barra inferior, contacto, línea de privacidad y redes). Sin franjas apiladas, sin banda de WhatsApp aparte y sin «Cómo comprar» (ahora cierra la portada). En la página de contacto no repite WhatsApp, dirección ni horario, que la página ya trae. Mide **584 px** en teléfono (antes 1.267; 392 en contacto). Reserva el alto de las barras fijas: 4,5 rem la de navegación, 9,5 rem en el producto (antes la barra de consulta tapaba la línea de privacidad y las redes al final).
- Fondo `#fff9fb`, contenedor de 1200 px y la fuente del estándar (Inter con respaldo del sistema).

## Desvíos conscientes
- 🟡 **Objetivos táctiles de 32 y 36 px** en los círculos de color y las píldoras de talla de la tarjeta (el estándar pide 44). Son controles secundarios (cada tarjeta ya enlaza al detalle con esa talla y color) y cumplen WCAG 2.5.8 (24 px); el diseño pide píldoras compactas. Revisar con el cliente en un teléfono.
- 🟡 **Sin carrito ni perfil en la barra**: la demo los tenía; aquí aún no existen (change `reservations-whatsapp-checkout`). Se sustituyen por Contacto y WhatsApp para no dejar controles muertos.

## ✅ Qué cumple
- Contraste: texto del pie `neutral-300/400` sobre `neutral-950` (≥ 8:1); el botón del pie es blanco con `brand-dark`, así no depende de que el color de marca sea claro.
- Estados activos con texto, subrayado y `aria-current`; íconos decorativos con `aria-hidden` y nombre en el enlace.
- Teclado: enlace «Saltar al contenido», foco visible, menú modal con foco atrapado.

## ❔ Por verificar
- Barra inferior y barra de consulta apiladas con el teclado y las zonas seguras en un teléfono real.

## 💡 Sugerencias
- La portada aún no tiene el bloque de bienvenida de la demo (degradado y destacados); no se tocó en este paso.
- Mostrar el color de marca real (rosa `#e63f6e`) en la configuración: hoy el entorno de desarrollo guarda un azul oscuro y la tienda se ve más seria que la demo.
