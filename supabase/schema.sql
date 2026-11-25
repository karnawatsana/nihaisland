-- Run once in Supabase → SQL Editor
create table if not exists public.rooms (
  code            text primary key,
  demo            boolean not null default false,
  pin_hash        text not null,
  salt            text not null,
  version         integer not null default 1,
  content_version integer not null default 1,
  state           jsonb not null,
  cast_list       jsonb not null,
  poster          jsonb not null,
  updated_at      timestamptz not null default now()
);

-- Only the server (service-role key) touches this table. Browsers get NO direct access.
alter table public.rooms enable row level security;
-- (intentionally no policies)
