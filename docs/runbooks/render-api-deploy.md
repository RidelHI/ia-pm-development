# Runbook: Deploy API en Render

## Objetivo
Configurar y verificar el deploy de `apps/api` hacia Render, priorizando `Blueprint` (`render.yaml`).

## Prerrequisitos
- Cuenta en Render.
- Repositorio conectado a Render.
- Rama de deploy definida (ejemplo: `main`).
- Variables de entorno del API disponibles (Supabase y CORS).

## 1) Crear servicio desde Blueprint (recomendado)
1. En Render, entrar a `Blueprints`.
2. Seleccionar este repositorio.
3. Elegir la rama a desplegar.
4. Confirmar configuracion detectada desde `render.yaml`.
5. Crear el servicio (ejemplo: `warehouse-api`).

## 2) Configuracion esperada
- Build:
```bash
pnpm install --frozen-lockfile --filter api... && pnpm --filter api build
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
- `AUTH_USERNAME` (no usar `admin` en production)
- `AUTH_PASSWORD` (no usar `admin123!` en production)
- `AUTH_PASSWORD_HASH` (bcrypt, obligatorio en production)
- `AUTH_JWT_SECRET` (minimo 32 caracteres en production)
- `AUTH_JWT_EXPIRES_IN_SECONDS` (default: `900`)
- `AUTH_JWT_ISSUER` (default: `warehouse-api`)
- `AUTH_JWT_AUDIENCE` (default: `warehouse-clients`)

Generar hash bcrypt para `AUTH_PASSWORD_HASH`:
```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "TU_PASSWORD_SEGURA"
```

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
- Si no puedes usar Blueprint, crear `Web Service` manual con los mismos comandos y health check.

## Postman (assets listos)
- Collection: `docs/postman/warehouse-api.postman_collection.json`
- Environment: `docs/postman/warehouse-api.render.postman_environment.json`
- Flujo recomendado: `1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9`.
