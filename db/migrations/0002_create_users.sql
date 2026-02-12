create table if not exists public.users (
  id text primary key,
  username text not null unique,
  "passwordHash" text not null,
  role text not null check (role in ('admin', 'user')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);
