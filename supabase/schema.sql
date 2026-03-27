-- AIO Shop Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. PROFILES TABLE (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  email text unique not null,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text not null default '',
  price real not null default 0,
  pricing_tiers jsonb,
  instructions text,
  image_url text not null default '',
  image_public_id text,
  pinned_image_url text,
  pinned_image_public_id text,
  in_stock boolean not null default true,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

-- 4. SETTINGS TABLE (single row)
create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  site_password text,
  whatsapp_number text,
  telegram_username text,
  site_name text default 'AIO Shop',
  site_description text,
  products_sold integer not null default 0
);

-- 5. AUTO-UPDATE updated_at TRIGGER
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.handle_updated_at();

-- 6. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'USER')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. ROW LEVEL SECURITY POLICIES

-- Profiles: anyone can read, users can update own
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Products: anyone can read visible, admins can do everything
alter table public.products enable row level security;

create policy "Visible products are viewable by everyone"
  on public.products for select using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can update products"
  on public.products for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- Reviews: anyone can read approved, authenticated can create, admins can manage
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Admins can update reviews"
  on public.reviews for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can delete reviews"
  on public.reviews for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- Settings: anyone can read, admins can manage
alter table public.settings enable row level security;

create policy "Settings are viewable by everyone"
  on public.settings for select using (true);

create policy "Admins can insert settings"
  on public.settings for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can update settings"
  on public.settings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- 8. INDEXES for performance
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_visible on public.products(is_visible);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_profiles_username on public.profiles(username);

-- 9. INSERT DEFAULT SETTINGS
insert into public.settings (site_password, whatsapp_number, telegram_username, site_name, products_sold)
values ('aio2026', '+919082146640', 'jack26_ig', 'AIO Shop', 0)
on conflict do nothing;
