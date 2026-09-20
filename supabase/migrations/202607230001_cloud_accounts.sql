-- HaghDān cloud accounts and learner progress.
-- Run with `supabase db push` after linking the production project.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  username text not null check (
    char_length(username) between 3 and 24
    and username ~ '^[A-Za-z0-9_.؀-ۿ]+$'
    and username !~ '^[._]'
    and username !~ '[._]$'
    and username !~ '\.\.'
    and username !~ '__'
  ),
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

create table if not exists public.learner_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_goal smallint not null default 2 check (daily_goal between 1 and 3),
  language text not null default 'fa' check (language in ('fa', 'en', 'zh', 'ar', 'es')),
  audio_enabled boolean not null default false,
  sound_effects_enabled boolean not null default true,
  persian_first boolean not null default true,
  theme_mode text not null default 'system' check (theme_mode in ('system', 'light', 'dark')),
  updated_at timestamptz not null default now()
);

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  completed_lessons text[] not null default '{}',
  saved_lessons text[] not null default '{}',
  quiz_scores jsonb not null default '{}'::jsonb check (jsonb_typeof(quiz_scores) = 'object'),
  completion_dates jsonb not null default '{}'::jsonb check (jsonb_typeof(completion_dates) = 'object'),
  review_queue jsonb not null default '[]'::jsonb check (jsonb_typeof(review_queue) = 'array'),
  active_days text[] not null default '{}',
  test_history jsonb not null default '[]'::jsonb check (jsonb_typeof(test_history) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.learner_settings enable row level security;
alter table public.learner_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "settings_select_own" on public.learner_settings;
create policy "settings_select_own" on public.learner_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "settings_insert_own" on public.learner_settings;
create policy "settings_insert_own" on public.learner_settings
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "settings_update_own" on public.learner_settings;
create policy "settings_update_own" on public.learner_settings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "settings_delete_own" on public.learner_settings;
create policy "settings_delete_own" on public.learner_settings
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress_select_own" on public.learner_progress;
create policy "progress_select_own" on public.learner_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress_insert_own" on public.learner_progress;
create policy "progress_insert_own" on public.learner_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress_update_own" on public.learner_progress;
create policy "progress_update_own" on public.learner_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress_delete_own" on public.learner_progress;
create policy "progress_delete_own" on public.learner_progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.learner_settings to authenticated;
grant select, insert, update, delete on public.learner_progress to authenticated;
revoke all on public.profiles from anon;
revoke all on public.learner_settings from anon;
revoke all on public.learner_progress from anon;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    'learner_' || substr(replace(new.id::text, '-', ''), 1, 12)
  );

  insert into public.profiles (user_id, display_name, username, terms_accepted_at)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      'Learner'
    ),
    requested_username,
    nullif(new.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz
  )
  on conflict (user_id) do nothing;

  insert into public.learner_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.learner_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
