# Runbook: Desarrollo Local

## Requisitos
- Node.js 22+
- Git 2.45+
- Corepack habilitado (`corepack` viene con Node moderno)

## Instalación
Opciones evaluadas para `pnpm`:
1. Instalar `pnpm` global con `npm i -g pnpm`.
2. Usar `corepack` fijado por el repo (`packageManager`).

Elección recomendada: opción 2 (más reproducible por versión).

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

## Calidad local
```bash
pnpm lint
pnpm test
pnpm build
```

## Deploy Web (GitHub Pages)
1. Habilitar Pages en el repo (source: GitHub Actions).
2. Push a `main` con cambios en `apps/web`.
3. Workflow: `.github/workflows/deploy-web-pages.yml`.

## Deploy API (Vercel)
1. Crear proyecto Vercel apuntando a `apps/api`.
2. Configurar secrets en GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Push a `main` con cambios en `apps/api` o ejecutar workflow manual.
4. Workflow: `.github/workflows/deploy-api-vercel.yml`.
   - Si faltan secrets, el job se marca como `skipped` (no falla CI).

## Notas
- No hardcodear secretos en código ni en workflows.
- `apps/api/vercel.json` y `apps/api/api/index.ts` dejan lista la estructura serverless.
