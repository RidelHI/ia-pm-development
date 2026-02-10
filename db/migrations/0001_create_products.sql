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
