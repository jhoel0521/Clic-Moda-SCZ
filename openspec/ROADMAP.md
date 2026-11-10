# Roadmap — Clic Moda SCZ (del MVP universitario a producción)

> Documento vivo. Cada fase se desglosa en **changes de OpenSpec** (`/opsx:propose <nombre>`); el roadmap dice *qué y en qué orden*, OpenSpec dice *cómo*.

## Visión

Tienda de moda cruceña cuyo canal principal es TikTok/Instagram. Diferenciador: **venta en vivo con reserva en tiempo real** — en un Live se fija una prenda con número de serie, quien la reserva primero la gana por un tiempo definido y confirma por WhatsApp. La tienda normal usa **el mismo motor de reservas**.

**Restricciones del cliente:** sin pasarela de pago por ahora (aún no factura); presupuesto acotado; mercado móvil-first.

## Arquitectura objetivo

```
services/api   NestJS + PostgreSQL + WebSocket (Socket.io)   ← única fuente de verdad
apps/shop      Next.js, móvil-first / PWA                    ← clientes y espectadores del Live
apps/admin     Panel de gestión + consola del Live           ← Gerente, Despacho, Atención
```

- Cada proyecto es **independiente** (su `package.json`, `pnpm-lock.yaml` y `node_modules`); la raíz solo los orquesta (`pnpm dev:shop`, `pnpm build:all`, …).
- Contratos compartidos: el API publica OpenAPI; los clientes generan tipos desde ahí (sin paquete compartido por ahora).
- Un solo servicio para REST y tiempo real: el servidor mantiene el estado vivo de las salas y es el **único árbitro** de las reservas.

## Principios de diseño del motor de reservas

1. **Reservar primero, vender después.** Toda compra pasa por una reserva con vencimiento (TTL configurable por canal/producto).
2. **El servidor manda.** Orden por reloj del servidor; cola serial por unidad; `UPDATE ... WHERE estado='disponible'` como garantía final en BD (nunca doble venta).
3. **Inventario por unidad** para prendas de serie única; stock por talla para producto masivo (modo híbrido, a decidir en F2).
4. **Los timers sobreviven reinicios:** el vencimiento vive en BD y se reprograma al arrancar.
5. **Antiabuso desde el inicio:** OTP por teléfono, tope de reservas activas, contador de no-shows.

---

## Fase 0 — Fundaciones del repo ✅ (en curso)

- [x] Monorepo con orquestador pnpm en la raíz; `apps/shop` migrada a pnpm y compilando
- [x] Placeholders `apps/admin` y `services/api`
- [x] OpenSpec inicializado (artefactos en español)
- [x] Skills de ux-kit instalados (`ux-guide`, `ux-init`, `ux-discover`, `ux-plan-review`, `ux-check`)
- [x] Husky + lint-staged (pre-commit) con protector de secretos (secretlint) y formato/lint de la shop
- [x] Regla `max-lines-per-function` (25 líneas) en la shop como `warn`: ~75 funciones heredadas la violan (54 archivos, 28 con más de 80 líneas)
- [ ] En `services/api` y `apps/admin` la misma regla va como `error` desde el primer commit; ampliar `.lintstagedrc.mjs` a esas apps al crearlas
- [ ] Reducir los `warn` de la shop refactorizando al tocar cada archivo (objetivo: pasar la regla a `error`)
- [ ] Ejecutar `ux-init` y `ux-discover` (usuarios reales, marca, tokens) — mejor tras crear admin/api para que detecte las 3 apps
- [ ] CI básico (lint + build por app)
- [ ] Decidir si `.claude/` y `.agents/` se versionan (hoy están en `.gitignore`: el equipo no recibiría los skills)

**Changes OpenSpec:** `repo-monorepo-conventions`, `ci-pipeline`

## Fase 1 — API base y datos reales

Objetivo: la shop deja de leer `data/db.json` y consume una API real.

- [ ] Scaffold NestJS (`services/api`), PostgreSQL + ORM (Prisma o TypeORM), migraciones, seeds desde `db.json`
- [ ] Auth real: registro/login, JWT o sesión, roles (Gerente, Despacho, Atención, Cliente), reemplazo de `proxy.ts`/mock
- [ ] Módulos CRUD: productos (+imágenes, etiquetas, categorías), pedidos, cupones, banners, reseñas, favoritos
- [ ] OpenAPI publicado + cliente tipado generado para shop y admin
- [ ] Almacenamiento de imágenes (S3-compatible / CDN) en lugar de URLs sueltas
- [ ] Shop consumiendo la API (se retiran los route handlers y servicios en `src/backend`)

**Changes OpenSpec:** `api-scaffold`, `auth-roles`, `catalog-api`, `orders-api`, `marketing-api`, `shop-migrate-to-api`

## Fase 2 — Motor de reservas (núcleo del negocio) ⭐

- [ ] Modelo `unidad` (producto, talla, **serie**, estado) y `reserva` (+ ítems, canal, expira_en, extendida)
- [ ] Reserva atómica multi-unidad en transacción (todas o ninguna)
- [ ] TTL configurable (Live ≈ 10–15 min, tienda ≈ 30–60 min) desde el admin; extensión única por staff
- [ ] Vencimiento con timers persistidos + reprogramación al reiniciar; liberación automática
- [ ] Confirmación manual (staff) → `vendida`; flujo WhatsApp con ticket y serie
- [ ] Fila de espera: al vencer, se ofrece al siguiente
- [ ] Checkout de la tienda reserva en vez de descontar stock directo
- [ ] Antiabuso: OTP por teléfono, tope de reservas activas, no-shows
- [ ] Pruebas de concurrencia (N clientes simultáneos sobre la misma unidad)
- [ ] **Decisión pendiente:** ¿todas las prendas pasan a unidades o solo las de serie única?

**Changes OpenSpec:** `inventory-units`, `reservation-engine`, `reservation-ttl-expiry`, `waitlist`, `anti-abuse-otp`, `shop-checkout-reservation`

## Fase 3 — Venta en vivo (Live/Drop) en tiempo real

- [ ] Gateway WebSocket: salas por Live, autenticación de conexión
- [ ] Eventos: `prenda:fijada`, `unidad:reservada`, `unidad:liberada`, `unidad:vendida`, `espectadores:n`
- [ ] Shop móvil: pantalla `/live/[id]` — prenda fijada, botón "¡Lo quiero!" de un toque, cuenta regresiva de la reserva, estado en vivo
- [ ] Compra sin fricción: nombre + teléfono (OTP), sin registro obligatorio
- [ ] Links por prenda/serie pensados para el navegador interno de TikTok/Instagram
- [ ] Rate limiting por conexión; reconexión y resincronización de estado
- [ ] Prueba de carga (cientos de espectadores) y de latencia

**Changes OpenSpec:** `realtime-gateway`, `live-rooms`, `shop-live-page`, `live-guest-checkout`, `live-load-testing`

## Fase 4 — Admin

- [ ] Scaffold `apps/admin`; extraer del `src/app/(admin)` actual de la shop
- [ ] Consola del Live: fijar prenda, ver reservas activas y cuenta regresiva, confirmar/liberar/extender
- [ ] Inventario por serie: alta masiva, etiquetas/QR, historial por unidad
- [ ] Pedidos (kanban actual), pagos manuales (QR/transferencia: marcar como verificado)
- [ ] Configuración: TTLs, topes antiabuso, número de WhatsApp, mensajes
- [ ] Reportes: ventas por Live, reservas vencidas, no-shows, rotación

**Changes OpenSpec:** `admin-scaffold`, `admin-live-console`, `admin-serial-inventory`, `admin-orders-payments`, `admin-settings`, `admin-reports`

## Fase 5 — Salida a producción

- [ ] Infraestructura: VPS (API + Postgres + Nginx), shop y admin desplegados, dominio y HTTPS
- [ ] Backups automáticos de Postgres y prueba de restauración
- [ ] Logs, métricas y alertas (reservas, errores, latencia del gateway)
- [ ] Seguridad: secretos, CORS, validación de entrada, revisión OWASP básica, rate limits
- [ ] Legal/operativo: términos de reservas y no-show, política de datos, capacitación del staff
- [ ] Piloto con el cliente (un Live real acotado) y ajustes

**Changes OpenSpec:** `deploy-infra`, `backups-observability`, `security-hardening`, `pilot-launch`

## Fase 6 — Después del piloto (backlog abierto)

- Pasarela/QR interoperable con conciliación automática (cuando el negocio facture)
- Facturación electrónica
- Notificaciones push / WhatsApp Business API
- Multi-Live simultáneos, métricas por vendedor
- Investigación de referencias de live-commerce en China (Douyin/Taobao Live) para mecánicas de venta rápida — *no realizada aún*

---

## Orden recomendado y camino crítico

`F0 → F1 → F2 → F3 → F4 → F5`. F4 puede avanzar en paralelo a F3 una vez cerrada F1. **Para mostrar valor al cliente cuanto antes:** prototipo mínimo de F2+F3 (una prenda, una sala, reserva en vivo) apenas exista la API base.

## Decisiones abiertas

| # | Decisión | Impacto |
|---|---|---|
| 1 | ORM: Prisma vs TypeORM | F1 |
| 2 | ¿Todo el catálogo por unidades o modo híbrido? | F2 |
| 3 | TTL por defecto en Live y en tienda | F2/F3 |
| 4 | Admin: reutilizar Next o framework distinto | F4 |
| 5 | Hosting concreto (proveedor, región) y presupuesto mensual | F5 |
| 6 | ¿Se versionan los skills de `.claude/`/`.agents/`? | F0 |
