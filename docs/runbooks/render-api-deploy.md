# Runbook: Deploy API en Render

## Objetivo
Configurar y verificar el deploy de `apps/api` hacia Render mediante un `Web Service` creado manualmente.

## Prerrequisitos
- Cuenta en Render.
- Repositorio conectado a Render.
- Rama de deploy definida (ejemplo: `main`).
- Variables de entorno del API disponibles (Supabase y CORS).

## 1) Crear servicio Web Service (manual)
1. En Render, entrar a `New` -> `Web Service`.
2. Seleccionar este repositorio.
3. Elegir la rama a desplegar.
4. Configurar nombre del servicio (ejemplo: `warehouse-api`).

## 2) Comandos esperados
- Build:
```bash
pnpm install --frozen-lockfile && pnpm --filter api build
```
- Start:
```bash
node apps/api/dist/main.js
```
- Health Check Path: `/v1/health/live`

## 3) Runtime recomendado
- Runtime: `Node`.
- Node version: `22.x`.
- Root directory: repo root (`.`).

## 4) Variables de entorno recomendadas
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PRODUCTS_TABLE` (default: `products`)
- `APP_CORS_ORIGINS`
- `APP_CORS_CREDENTIALS`
- `APP_DOCS_ENABLED`
- `APP_DOCS_PATH`

## 5) Verificacion end-to-end
1. Esperar `Deploy live` en Render.
2. Validar health:
```bash
curl https://<tu-servicio>.onrender.com/v1/health/live
```
3. Validar endpoint base:
```bash
curl https://<tu-servicio>.onrender.com/v1
```

## Nota operativa
- El API usa `PORT` de entorno (inyectado por Render), no requiere adaptador serverless.
- `render.yaml` queda como referencia opcional de configuracion declarativa.
