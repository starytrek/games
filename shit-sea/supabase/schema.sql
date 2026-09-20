-- GeoSea shared leaderboard (Supabase/Postgres)
create extension if not exists unaccent;

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name varchar(16) not null,
  score integer not null check (score >= 0),
  max integer not null check (max between 10 and 1000 and score <= max),
  region text not null check (region in ('europe','asia','africa','northamerica','southamerica','oceania','antarctica','world')),
  mode text not null check (mode in ('ten','full')),
  created_at timestamptz not null default now(),
  constraint leaderboard_name_length check (char_length(name) between 2 and 16),
  constraint leaderboard_name_chars check (name !~ '[^[:alnum:]]')
);

create or replace function public.geosea_nick_ok(v text)
returns boolean
language sql
stable
as $$
  select not (
    lower(unaccent(v)) ~
    '(dupa|dupek|kurw|chuj|huj|pierdol|jeb|pizd|cip|kutas|cwel|dziwk|sukinsyn|skurw|debil|idiot|kretyn|fuck|shit|bitch|asshole|dick|cock|pussy)'
  );
$$;

alter table public.leaderboard
  drop constraint if exists leaderboard_name_clean;
alter table public.leaderboard
  add constraint leaderboard_name_clean check (public.geosea_nick_ok(name));

alter table public.leaderboard enable row level security;

revoke all on table public.leaderboard from anon, authenticated;
grant select on table public.leaderboard to anon, authenticated;
grant insert (name, score, max, region, mode) on table public.leaderboard to anon, authenticated;

drop policy if exists "leaderboard public read" on public.leaderboard;
create policy "leaderboard public read"
on public.leaderboard for select
to anon, authenticated
using (true);

drop policy if exists "leaderboard public insert" on public.leaderboard;
create policy "leaderboard public insert"
on public.leaderboard for insert
to anon, authenticated
with check (
  score >= 0 and score <= max
  and max between 10 and 1000
  and char_length(name) between 2 and 16
  and public.geosea_nick_ok(name)
);
