alter table public.products
  add column if not exists barcode text,
  add column if not exists category text,
  add column if not exists brand text,
  add column if not exists "minimumStock" integer check ("minimumStock" >= 0),
  add column if not exists "imageUrl" text,
  add column if not exists notes text;

create index if not exists products_category_idx on public.products (category);
create index if not exists products_brand_idx on public.products (brand);
create unique index if not exists products_barcode_unique_idx
  on public.products (barcode)
  where barcode is not null;
