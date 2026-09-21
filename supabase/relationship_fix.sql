-- Apply this once to an existing database before seed_1000.sql.
-- It repairs ownership and customer-state relationships without deleting data.

alter table public.purchase_orders
  add column if not exists created_by uuid references public.profiles(id);

create table if not exists public.cart_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  variant_id uuid references public.product_variants(id),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists purchase_orders_created_by_idx on public.purchase_orders(created_by);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);
create index if not exists wishlist_items_product_id_idx on public.wishlist_items(product_id);

alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;

drop policy if exists authenticated_inventory on public.inventory;
drop policy if exists public_inventory on public.inventory;
create policy public_inventory on public.inventory for select using (true);

drop policy if exists own_cart_items on public.cart_items;
create policy own_cart_items on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists own_wishlist_items on public.wishlist_items;
create policy own_wishlist_items on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

update public.purchase_orders
set created_by = admin_profile.id
from (
  select id from public.profiles
  where role in ('Super Admin', 'Beauty Admin', 'Beauty Staff')
  order by created_at
  limit 1
) admin_profile
where public.purchase_orders.created_by is null;
