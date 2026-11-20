-- MORI — Supabase schema. Run this once in: Supabase dashboard → SQL Editor → New query.
-- Golden rule: every row belongs to exactly one user, and Row Level Security means
-- the database itself refuses to show or change anyone else's rows.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  preferences  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 300),
  description   text not null default '' check (char_length(description) <= 5000),
  category      text not null default 'General' check (char_length(category) between 1 and 60),
  priority      text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  deadline      date,
  minutes       integer not null default 45 check (minutes between 1 and 1440),
  progress      integer not null default 0 check (progress between 0 and 100),
  subtasks      jsonb not null default '[]'::jsonb,
  depends_on    uuid[] not null default '{}',
  snoozed_until date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_user_created_idx on public.tasks (user_id, created_at);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- every new account starts with a profile and NOTHING else: no tasks, no flowers.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security: the privacy guarantee ----------
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;

drop policy if exists "own profile: select" on public.profiles;
drop policy if exists "own profile: insert" on public.profiles;
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile: insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile: update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own tasks: select" on public.tasks;
drop policy if exists "own tasks: insert" on public.tasks;
drop policy if exists "own tasks: update" on public.tasks;
drop policy if exists "own tasks: delete" on public.tasks;
create policy "own tasks: select" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "own tasks: insert" on public.tasks for insert to authenticated with check (user_id = auth.uid());
create policy "own tasks: update" on public.tasks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own tasks: delete" on public.tasks for delete to authenticated using (user_id = auth.uid());

-- logged-out visitors (the anon role) get no access to either table
revoke all on public.profiles from anon;
revoke all on public.tasks    from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
