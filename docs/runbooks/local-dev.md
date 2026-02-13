# Runbook: Desarrollo Local

## Requisitos
- Node.js 22+
- Git 2.45+
- Corepack habilitado (`corepack` viene con Node moderno)

## Instalacion
Opciones evaluadas para `pnpm`:
1. Instalar `pnpm` global con `npm i -g pnpm`.
2. Usar `corepack` fijado por el repo (`packageManager`).

Eleccion recomendada: opcion 2 (mas reproducible por version).

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
pnpm install
```

Fallback si tu entorno corporativo bloquea `corepack enable`:
```bash
npm i -g pnpm@10.17.1
pnpm install
```

Si acabas de instalar `pnpm` global, reinicia la terminal para refrescar `PATH`.

## Git bootstrap
```bash
git init -b main
git checkout -b feature/<slug-tarea>
```

## Ejecutar aplicaciones
```bash
pnpm dev:web
pnpm dev:api
```

- Web: `http://localhost:4200`
- API: `http://localhost:3000`
- Entorno local API: usar `apps/api/.env.local` (ignorado por git).

## Calidad local
```bash
pnpm lint
pnpm test
pnpm build
```

## E2E Web (Playwright)
```bash
pnpm exec playwright install chromium
pnpm test:e2e:web
```

## Deploy Web (GitHub Pages)
1. El workflow intenta habilitar Pages automaticamente en el primer despliegue.
2. Si falla por permisos, habilitar Pages en el repo (source: GitHub Actions).
3. Push a `main` con cambios en `apps/web`.
4. Workflow: `.github/workflows/deploy-web-pages.yml`.
5. Configurar variable de repositorio `WEB_API_BASE_URL` con la URL del API publicada (ejemplo: `https://ia-pm-development-api.vercel.app/v1`).

Notas operativas:
- Si `WEB_API_BASE_URL` no existe, el workflow usa fallback `https://ia-pm-development-api.vercel.app/v1`.
- El deploy genera `404.html` a partir de `index.html` para soportar refresh en rutas SPA (`/login`, `/products`).

## Deploy API (Render)
1. Usar `Blueprint` de Render con `render.yaml` (recomendado).
2. Seleccionar la rama objetivo en la configuracion del Blueprint.
3. Confirmar que Render toma:
   - Build: `pnpm install --frozen-lockfile --filter api... && pnpm --filter api build`
   - Start: `node apps/api/dist/main.js`
   - Health check: `/v1/health/live`
4. Configurar variables de entorno del API en Render.
   - Importante en `production`: definir `AUTH_JWT_SECRET` (minimo 32 caracteres), `SUPABASE_URL` y `SUPABASE_SECRET_KEY`.
5. Alternativa si no hay Blueprint: crear `Web Service` manual con la misma configuracion.
6. Runbook detallado: `docs/runbooks/render-api-deploy.md`.

## Notas
- No hardcodear secretos en codigo ni en workflows.
- El backend corre como servicio Node tradicional y escucha el `PORT` que inyecta Render.
- Flujo PR/proteccion de `main`: ver `docs/runbooks/github-pr-flow.md`.
- Flujo operativo de planificacion y seguimiento: ver `docs/runbooks/github-project-workflow.md`.
- Modelo operativo de agentes: ver `docs/ai/agent-operating-model.md`.
- Workflows repetibles del agente: ver `docs/ai/workflows/`.
- Prompt templates reutilizables: ver `docs/ai/prompts/`.
- Playbook Angular + IA: ver `docs/ai/angular-ai-professional-playbook.md`.
- Setup MCP Angular CLI: ver `docs/runbooks/angular-mcp-setup.md`.
- E2E navegador real (Playwright): ver `docs/runbooks/playwright-web-e2e.md`.
- Setup de Supabase para BE-14: ver `docs/runbooks/supabase-setup.md`.
- Decision tecnica local-first (GitHub Projects + Codex): ver `docs/adr/0003-github-project-local-first.md`.

## Quickstart GitHub Projects
```bash
gh auth status
gh project view 1 --owner RidelHI --web
gh issue list --state open
```
