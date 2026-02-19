# API (NestJS)

Backend del proyecto de aprendizaje de gestión de productos de almacén.

## Stack
- NestJS 11
- Prisma ORM 7
- Jest + ESLint
- Deploy en Render (web service)
- Integración preparada con Supabase

## Scripts
```bash
pnpm --filter api start:dev
pnpm --filter api lint
pnpm --filter api test
pnpm --filter api build
pnpm --filter api prisma:generate
```

## Variables de entorno
Copiar `apps/api/.env.example` y completar:

- `DATABASE_URL` (PostgreSQL connection string, recomendado para Prisma)
- `DATABASE_SCHEMA` (default: `public`)
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (recomendado para backend server-to-server)
- `SUPABASE_PRODUCTS_TABLE` (default recomendado: `products`)
- `SUPABASE_USERS_TABLE` (default recomendado: `users`)
- `APP_CORS_ORIGINS` (lista separada por comas)
- `APP_DOCS_ENABLED` / `APP_DOCS_PATH`
- `AUTH_JWT_SECRET` (minimo 32 caracteres en `production`)
- `AUTH_JWT_EXPIRES_IN_SECONDS` / `AUTH_JWT_ISSUER` / `AUTH_JWT_AUDIENCE`

## Endpoints actuales
- `GET /v1` info básica de la API
- `POST /v1/auth/register` registra usuario con password hasheado
- `POST /v1/auth/token` autentica contra usuarios persistidos y emite JWT
- `GET /v1/health/live` liveness probe pública
- `GET /v1/health/ready` readiness probe protegida (JWT + rol `admin`)
- `GET /v1/products`
- `GET /v1/products/:id`
- `POST /v1/products`
- `PATCH /v1/products/:id`
- `DELETE /v1/products/:id`
- `GET /docs` documentación OpenAPI (si `APP_DOCS_ENABLED=true`)

## Persistencia de productos
- Si `SUPABASE_URL` y una key de Supabase están configuradas, `ProductsService` usa `SupabaseProductsRepository`.
- Orden de prioridad de key: `SUPABASE_SECRET_KEY` -> `SUPABASE_SERVICE_ROLE_KEY` -> `SUPABASE_ANON_KEY` (legacy).
- Si faltan variables de Supabase, se usa fallback `InMemoryProductsRepository` para desarrollo local.
- Tabla por defecto: `products` (override con `SUPABASE_PRODUCTS_TABLE`).
- Tabla de usuarios por defecto: `users` (override con `SUPABASE_USERS_TABLE`).
- Migraciones SQL base:
  - `db/migrations/0001_create_products.sql`
  - `db/migrations/0002_create_users.sql`
- Los usuarios registrados via endpoint se crean con rol `user`.
- Para habilitar operaciones mutables de productos se requiere token con rol `admin`.
- Runbook de setup/verificacion: `docs/runbooks/supabase-setup.md`.

## Deploy en Render
- Via recomendada: `Blueprint` con `render.yaml` (seleccionando la rama en Render).
- Build command: `pnpm install --frozen-lockfile --filter api... && pnpm --filter api build`
- Start command: `node apps/api/dist/main.js`
- Health check recomendado: `/v1/health/live`
- Alternativa: crear `Web Service` manual con la misma configuracion.
- Runbook de setup/verificacion: `docs/runbooks/render-api-deploy.md`.
