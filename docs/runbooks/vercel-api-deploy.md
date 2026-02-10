# Runbook: Deploy API en Vercel

## Objetivo
Configurar y verificar el deploy serverless de `apps/api` hacia Vercel mediante GitHub Actions.

## Secretos requeridos en GitHub
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 1) Obtener `VERCEL_TOKEN`
En Vercel Dashboard:
1. Ir a `Settings` -> `Tokens`.
2. Crear un token nuevo con alcance a tu cuenta/equipo.
3. Guardarlo en un lugar seguro (solo se muestra una vez).

## 2) Obtener `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`
Forma recomendada (deterministica con CLI):

```bash
pnpm dlx vercel login
pnpm dlx vercel link --cwd apps/api
```

Luego leer archivo generado localmente (no versionado) `apps/api/.vercel/project.json`:
- `orgId` -> `VERCEL_ORG_ID`
- `projectId` -> `VERCEL_PROJECT_ID`

## 3) Cargar secretos en GitHub
Con GitHub CLI:

```bash
gh secret set VERCEL_TOKEN --body "<token>"
gh secret set VERCEL_ORG_ID --body "<org-id>"
gh secret set VERCEL_PROJECT_ID --body "<project-id>"
```

Verificar nombres cargados:

```bash
gh secret list
```

## 4) Variables de entorno del API en Vercel
El workflow ejecuta `vercel pull --environment=production`, por lo que las variables deben existir en Vercel (entorno `Production`), por ejemplo:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PRODUCTS_TABLE`

## 5) Verificar deploy end-to-end
1. Lanzar workflow manual:
```bash
gh workflow run .github/workflows/deploy-api-vercel.yml --ref main
```

2. Revisar ejecucion:
```bash
gh run list --workflow .github/workflows/deploy-api-vercel.yml --limit 5
gh run view <run-id>
```

3. Validar endpoint desplegado:
```bash
curl https://<tu-proyecto>.vercel.app/health
```

## Nota de hardening
El workflow tiene preflight de secretos: si falta alguno, el job no falla por configuracion invalida y el deploy queda omitido con mensajes `notice`.

## Nota de monorepo/pnpm
En monorepos con `pnpm` (node_modules con symlinks), Vercel puede fallar en runtime si el bundle no incluye dependencias.
El workflow genera un directorio standalone con `pnpm --filter api deploy ...` antes de `vercel build/deploy` para reducir problemas de empaquetado.

## Deployment Protection (401 Unauthorized)
Si tu deployment responde `401 Authentication Required`, es porque Vercel tiene activada proteccion de despliegue.
Opciones:
1. Desactivar proteccion para `Production` en Vercel (recomendado para un API publico).
2. Para pruebas internas, usar `vercel curl` (genera bypass automaticamente):
```bash
pnpm dlx vercel curl /health --deployment https://<deployment>.vercel.app --cwd apps/api
```
