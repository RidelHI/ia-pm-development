# Runbook: Supabase Setup para BE-14

## Objetivo
Configurar Supabase para que el API (`apps/api`) persista productos en tabla real `products`.

## Prerrequisitos
- Cuenta en Supabase (plan gratuito).
- Proyecto creado en Supabase.
- API local ejecutando NestJS.

## 1) Obtener credenciales del proyecto
En Supabase Dashboard:
1. Ir a `Project Settings` -> `API`.
2. Copiar:
   - `Project URL` -> `SUPABASE_URL`
   - `secret` key -> `SUPABASE_SECRET_KEY` (para backend)
   - `publishable` key (opcional por ahora, se usara en frontend cuando conectemos web)

Regla de seguridad:
- Nunca commitear keys en el repo.
- No pegar keys en issues o PRs.

## 2) Crear tabla `products`
SQL versionado en repo:
- `db/migrations/0001_create_products.sql`
- `db/migrations/0002_create_users.sql`

En `SQL Editor`, ejecutar el contenido de ese archivo:

```sql
create table if not exists public.products (
  id text primary key,
  sku text not null unique,
  name text not null,
  quantity integer not null check (quantity >= 0),
  "unitPriceCents" integer not null check ("unitPriceCents" >= 0),
  status text not null check (status in ('active', 'inactive')),
  location text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists products_status_idx on public.products (status);
create index if not exists products_name_idx on public.products (name);

create table if not exists public.users (
  id text primary key,
  username text not null unique,
  "passwordHash" text not null,
  role text not null check (role in ('admin', 'user')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
```

## 3) Configurar variables de entorno para desarrollo local
Variables requeridas por el API:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PRODUCTS_TABLE` (usar `products`)
- `SUPABASE_USERS_TABLE` (usar `users`)

Opcion recomendada: archivo local `apps/api/.env.local` (no versionado):

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<secret-key>
SUPABASE_PRODUCTS_TABLE=products
SUPABASE_USERS_TABLE=users
PORT=3000
```

Nota: el API carga automaticamente `.env` y `.env.local` al iniciar.

PowerShell (sesion actual, alternativa):
```powershell
$env:SUPABASE_URL="https://<project-ref>.supabase.co"
$env:SUPABASE_SECRET_KEY="<secret-key>"
$env:SUPABASE_PRODUCTS_TABLE="products"
pnpm --filter api start:dev
```

Bash (sesion actual):
```bash
export SUPABASE_URL="https://<project-ref>.supabase.co"
export SUPABASE_SECRET_KEY="<secret-key>"
export SUPABASE_PRODUCTS_TABLE="products"
pnpm --filter api start:dev
```

## 4) Verificar conexion y CRUD real
1. Verificar health:
```bash
curl http://localhost:3000/health
```
Esperado:
- `integrations.supabase.configured = true`
- `integrations.supabase.productsTable = "products"`

2. Crear producto:
```bash
curl -X POST http://localhost:3000/products \
  -H "content-type: application/json" \
  -d '{"sku":"SKU-TEST-001","name":"Caja test","quantity":5,"unitPriceCents":1999,"status":"active","location":"A-01"}'
```

3. Listar y verificar persistencia:
```bash
curl http://localhost:3000/products
```

4. Reiniciar API y volver a listar:
```bash
curl http://localhost:3000/products
```
Si el producto sigue presente, la persistencia en Supabase esta funcionando.

## Troubleshooting rapido
- Error `Supabase client is not configured`:
  - Revisar que `SUPABASE_URL` y `SUPABASE_SECRET_KEY` esten definidas en la misma sesion donde corre `pnpm`.
- Error de permisos (401/403):
  - Revisar politicas RLS de la tabla `products`.
- Error `relation "products" does not exist`:
  - Ejecutar el SQL de creacion de tabla.

## Nota de compatibilidad
La API mantiene fallback temporal para keys legacy (`SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ANON_KEY`) para no romper entornos existentes. La configuracion recomendada para BE-14 es `SUPABASE_SECRET_KEY`.
