<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Skills (válido para cualquier agente)

Las skills viven **solo** en `agent/skills/` (fuente de verdad, versionada). `.claude/skills/` y `.agents/skills/` son enlaces locales a esa carpeta y no se versionan. Si falta alguna skill en tu agente, ejecuta `pnpm skills:link` (se hace sola con `pnpm install`). Tras instalar una skill nueva con `npx skills add`, vuelve a ejecutarlo: la adopta en `agent/skills/`.

## UX/UI

Este proyecto usa ux-kit. Antes de planificar o construir UI, lee `.ux/config.yaml` y los archivos relevantes de `.ux/standard/`. Usa solo los tokens de `.ux/standard/tokens.json`. Ejecuta `ux-check` después de cambios de UI.

## Flujo de cambios

Los cambios se especifican con OpenSpec (`openspec/`). El contexto del proyecto está en `openspec/config.yaml` y la hoja de ruta en `openspec/ROADMAP.md`.
