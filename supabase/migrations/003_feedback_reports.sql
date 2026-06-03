create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text not null,
  title text not null,
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  page_path text not null default '/',
  device_info text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists feedback_reports_status_idx on public.feedback_reports (status);
create index if not exists feedback_reports_created_at_idx on public.feedback_reports (created_at desc);

alter table public.feedback_reports enable row level security;

drop policy if exists "feedback active member insert" on public.feedback_reports;
create policy "feedback active member insert" on public.feedback_reports
for insert with check (public.is_active_member());

drop policy if exists "feedback own or admin read" on public.feedback_reports;
create policy "feedback own or admin read" on public.feedback_reports
for select using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "feedback admin update" on public.feedback_reports;
create policy "feedback admin update" on public.feedback_reports
for update using (public.is_admin()) with check (public.is_admin());
