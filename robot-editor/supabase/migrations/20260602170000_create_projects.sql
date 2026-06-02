create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  prompt text not null,
  spec jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can read their own projects"
  on public.projects
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Users can create their own projects"
  on public.projects
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Users can update their own projects"
  on public.projects
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can delete their own projects"
  on public.projects
  for delete
  to authenticated
  using (owner_id = auth.uid());

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();
