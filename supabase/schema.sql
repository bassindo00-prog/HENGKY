-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor

create table if not exists public.site_config (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_whatsapp text not null,
  product text not null,
  technique text not null default '-',
  qty integer not null default 1,
  sizes jsonb not null default '{}'::jsonb,
  notes text not null default '',
  file_name text,
  file_url text,
  status text not null default 'Baru'
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Bucket Storage untuk sample gambar & file sablonan customer
insert into storage.buckets (id, name, public)
values ('samples', 'samples', true)
on conflict (id) do nothing;

