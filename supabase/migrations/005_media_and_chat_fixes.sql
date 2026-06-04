-- 68 Riders media/chat follow-up.
-- Run after 001_initial_schema.sql, 002_membership_applications.sql,
-- 003_feedback_reports.sql and 004_security_hardening.sql.

alter table public.events add column if not exists bucket text;
alter table public.events add column if not exists file_path text;
alter table public.events add column if not exists public_url text;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

drop policy if exists "public media read" on storage.objects;
create policy "public media read" on storage.objects
for select using (
  bucket_id in ('avatars', 'gallery', 'chat-media', 'chat-voice', 'chat-documents', 'event-images')
);

drop policy if exists "event images admin upload" on storage.objects;
create policy "event images admin upload" on storage.objects
for insert with check (bucket_id = 'event-images' and public.is_admin());

drop policy if exists "event images admin delete" on storage.objects;
create policy "event images admin delete" on storage.objects
for delete using (bucket_id = 'event-images' and public.is_admin());

drop policy if exists "reactions active manage" on public.message_reactions;

drop policy if exists "reactions active read" on public.message_reactions;
create policy "reactions active read" on public.message_reactions
for select using (public.is_active_member());

drop policy if exists "reactions active insert own" on public.message_reactions;
create policy "reactions active insert own" on public.message_reactions
for insert with check (public.is_active_member() and profile_id = auth.uid());

drop policy if exists "reactions active delete own" on public.message_reactions;
create policy "reactions active delete own" on public.message_reactions
for delete using (public.is_active_member() and profile_id = auth.uid());
