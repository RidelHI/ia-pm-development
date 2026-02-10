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
- `GET /health` estado del servicio, versión e integración Supabase
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`

## Persistencia de productos
- Si `SUPABASE_URL` y `SUPABASE_ANON_KEY` están configuradas, `ProductsService` usa `SupabaseProductsRepository`.
- Si faltan variables de Supabase, se usa fallback `InMemoryProductsRepository` para desarrollo local.
- Tabla por defecto: `products` (override con `SUPABASE_PRODUCTS_TABLE`).

## Deploy en Vercel
- Entry serverless: `apps/api/api/index.ts`
- Config: `apps/api/vercel.json`
- Secrets esperados en GitHub Actions:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
