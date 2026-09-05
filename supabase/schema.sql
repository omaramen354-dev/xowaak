-- =====================================================================
-- AWWA platform — AAKWHX
-- Full PostgreSQL / Supabase schema with Row Level Security.
-- Run with: supabase db reset  (or paste into the Supabase SQL editor)
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type app_role as enum ('super_admin', 'admin', 'pm', 'employee', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_stage as enum ('planning', 'design', 'development', 'testing', 'review', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type milestone_status as enum ('todo', 'in_progress', 'blocked', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type file_category as enum ('design', 'document', 'contract', 'source', 'invoice');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_category as enum ('design', 'content', 'bug', 'scope');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_visibility as enum ('public', 'private');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null default '',
  email       text        not null,
  avatar_url  text,
  company     text,
  title       text,
  locale      text        not null default 'en'
              check (locale in ('ar', 'en', 'nl', 'de', 'tr', 'fr', 'es')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- user_roles — a user may hold several roles
-- ---------------------------------------------------------------------
create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  role       app_role    not null default 'client',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);

-- ---------------------------------------------------------------------
-- Helper functions (security definer to avoid recursive RLS)
-- ---------------------------------------------------------------------
create or replace function public.has_role(target_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = target_role
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'admin', 'pm', 'employee')
  );
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'admin', 'pm')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('super_admin', 'admin')
  );
$$;

-- Can the current user see this project? (client owner, assigned staff, manager)
create or replace function public.can_view_project(target_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project
      and (
        p.client_id = auth.uid()
        or p.pm_id = auth.uid()
        or public.is_manager()
        or exists (
          select 1 from public.project_members m
          where m.project_id = p.id and m.user_id = auth.uid()
        )
      )
  );
$$;

-- ---------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text        not null,
  summary    text        not null default '',
  client_id  uuid        not null references public.profiles (id) on delete restrict,
  pm_id      uuid        references public.profiles (id) on delete set null,
  stage      project_stage      not null default 'planning',
  progress   int                not null default 0 check (progress between 0 and 100),
  visibility project_visibility not null default 'private',
  industry   text        not null default 'Other',
  budget     numeric(12, 2) not null default 0,
  currency   text        not null default 'EUR',
  start_date date,
  deadline   date,
  tech       text[]      not null default '{}',
  cover      text        not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_client_idx on public.projects (client_id);
create index if not exists projects_pm_idx on public.projects (pm_id);
create index if not exists projects_stage_idx on public.projects (stage);

-- staff assignment table (used by can_view_project)
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role_label text not null default 'contributor',
  primary key (project_id, user_id)
);

-- ---------------------------------------------------------------------
-- project_milestones
-- ---------------------------------------------------------------------
create table if not exists public.project_milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null,
  stage       project_stage    not null default 'planning',
  status      milestone_status not null default 'todo',
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date    date,
  order_index int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists milestones_project_idx on public.project_milestones (project_id);

-- ---------------------------------------------------------------------
-- project_files
-- ---------------------------------------------------------------------
create table if not exists public.project_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  name         text not null,
  category     file_category not null default 'document',
  size_kb      int  not null default 0,
  version      text not null default 'v1',
  uploaded_by  uuid references public.profiles (id) on delete set null,
  storage_path text not null,
  created_at   timestamptz not null default now()
);

create index if not exists files_project_idx on public.project_files (project_id);

-- ---------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  category   feedback_category not null default 'design',
  body       text not null check (length(body) between 1 and 5000),
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists feedback_project_idx on public.feedback (project_id);

-- ---------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (length(body) between 1 and 5000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_project_idx on public.messages (project_id, created_at);

-- ---------------------------------------------------------------------
-- quote_requests (public lead capture from the estimator)
-- ---------------------------------------------------------------------
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  company       text,
  project_type  text not null,
  features      text[] not null default '{}',
  speed         text not null default 'standard',
  estimate_low  numeric(12, 2),
  estimate_high numeric(12, 2),
  notes         text,
  locale        text not null default 'en',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Auto-create a profile + default client role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.projects           enable row level security;
alter table public.project_members    enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_files      enable row level security;
alter table public.feedback           enable row level security;
alter table public.messages           enable row level security;
alter table public.quote_requests     enable row level security;

-- ----- profiles -------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

drop policy if exists "profiles_super_admin_delete" on public.profiles;
create policy "profiles_super_admin_delete" on public.profiles
  for delete using (public.has_role('super_admin'));

-- ----- user_roles -----------------------------------------------------
drop policy if exists "roles_select" on public.user_roles;
create policy "roles_select" on public.user_roles
  for select using (user_id = auth.uid() or public.is_manager());

drop policy if exists "roles_admin_write" on public.user_roles;
create policy "roles_admin_write" on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());

-- ----- projects -------------------------------------------------------
-- Clients only ever see their own projects; staff see assigned ones;
-- managers see everything. Public/marketing rows are exposed through a
-- separate anonymous read policy limited to visibility = 'public'.
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon using (visibility = 'public');

drop policy if exists "projects_scoped_read" on public.projects;
create policy "projects_scoped_read" on public.projects
  for select to authenticated using (
    visibility = 'public'
    or client_id = auth.uid()
    or pm_id = auth.uid()
    or public.is_manager()
    or exists (
      select 1 from public.project_members m
      where m.project_id = projects.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "projects_manager_write" on public.projects;
create policy "projects_manager_write" on public.projects
  for insert to authenticated with check (public.is_manager());

drop policy if exists "projects_manager_update" on public.projects;
create policy "projects_manager_update" on public.projects
  for update to authenticated using (public.is_manager() or pm_id = auth.uid())
  with check (public.is_manager() or pm_id = auth.uid());

drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete" on public.projects
  for delete to authenticated using (public.is_admin());

-- ----- project_members ------------------------------------------------
drop policy if exists "members_read" on public.project_members;
create policy "members_read" on public.project_members
  for select to authenticated using (user_id = auth.uid() or public.is_manager());

drop policy if exists "members_manage" on public.project_members;
create policy "members_manage" on public.project_members
  for all to authenticated using (public.is_manager()) with check (public.is_manager());

-- ----- project_milestones --------------------------------------------
drop policy if exists "milestones_read" on public.project_milestones;
create policy "milestones_read" on public.project_milestones
  for select to authenticated using (public.can_view_project(project_id));

drop policy if exists "milestones_write" on public.project_milestones;
create policy "milestones_write" on public.project_milestones
  for all to authenticated
  using (public.is_manager() or assignee_id = auth.uid())
  with check (public.is_manager() or assignee_id = auth.uid());

-- ----- project_files --------------------------------------------------
drop policy if exists "files_read" on public.project_files;
create policy "files_read" on public.project_files
  for select to authenticated using (public.can_view_project(project_id));

drop policy if exists "files_insert" on public.project_files;
create policy "files_insert" on public.project_files
  for insert to authenticated
  with check (public.can_view_project(project_id) and uploaded_by = auth.uid());

drop policy if exists "files_delete" on public.project_files;
create policy "files_delete" on public.project_files
  for delete to authenticated using (public.is_manager());

-- ----- feedback -------------------------------------------------------
drop policy if exists "feedback_read" on public.feedback;
create policy "feedback_read" on public.feedback
  for select to authenticated using (public.can_view_project(project_id));

drop policy if exists "feedback_insert" on public.feedback;
create policy "feedback_insert" on public.feedback
  for insert to authenticated
  with check (public.can_view_project(project_id) and author_id = auth.uid());

drop policy if exists "feedback_update" on public.feedback;
create policy "feedback_update" on public.feedback
  for update to authenticated
  using (author_id = auth.uid() or public.is_manager())
  with check (author_id = auth.uid() or public.is_manager());

-- ----- messages -------------------------------------------------------
drop policy if exists "messages_read" on public.messages;
create policy "messages_read" on public.messages
  for select to authenticated using (public.can_view_project(project_id));

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert to authenticated
  with check (public.can_view_project(project_id) and sender_id = auth.uid());

drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete" on public.messages
  for delete to authenticated using (sender_id = auth.uid() or public.is_admin());

-- ----- quote_requests -------------------------------------------------
drop policy if exists "quotes_public_insert" on public.quote_requests;
create policy "quotes_public_insert" on public.quote_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "quotes_staff_read" on public.quote_requests;
create policy "quotes_staff_read" on public.quote_requests
  for select to authenticated using (public.is_manager());

-- =====================================================================
-- STORAGE — private bucket for client deliverables
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

drop policy if exists "project_files_read" on storage.objects;
create policy "project_files_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-files'
    and public.can_view_project((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "project_files_upload" on storage.objects;
create policy "project_files_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and public.can_view_project((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "project_files_manage" on storage.objects;
create policy "project_files_manage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-files' and public.is_manager());
