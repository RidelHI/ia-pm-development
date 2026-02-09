# API (NestJS)

Backend del proyecto de aprendizaje de gestión de productos de almacén.

## Stack
- NestJS 11
- Jest + ESLint
- Deploy serverless en Vercel
- Integración preparada con Supabase

## Scripts
```bash
pnpm --filter api start:dev
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
```

## Variables de entorno
Copiar `apps/api/.env.example` y completar:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_PRODUCTS_TABLE` (default recomendado: `products`)

## Endpoints actuales
- `GET /` info básica de la API
- `GET /health` estado del servicio e integración Supabase
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`

## Deploy en Vercel
- Entry serverless: `apps/api/api/index.ts`
- Config: `apps/api/vercel.json`
- Secrets esperados en GitHub Actions:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`