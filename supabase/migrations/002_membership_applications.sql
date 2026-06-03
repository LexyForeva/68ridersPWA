create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  bike text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists membership_applications_email_idx
on public.membership_applications (email);

alter table public.membership_applications enable row level security;

drop policy if exists "applications public insert" on public.membership_applications;
create policy "applications public insert" on public.membership_applications
for insert with check (true);

drop policy if exists "applications own read" on public.membership_applications;
create policy "applications own read" on public.membership_applications
for select using (email = auth.email() or public.is_admin());

drop policy if exists "applications admin update" on public.membership_applications;
create policy "applications admin update" on public.membership_applications
for update using (public.is_admin()) with check (public.is_admin());
