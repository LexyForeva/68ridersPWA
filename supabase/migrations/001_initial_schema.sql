-- 68 Riders production-ready Supabase baseline.
-- Run this in Supabase SQL Editor, then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  member_no text unique,
  full_name text not null,
  email text,
  phone text,
  city text default 'Aksaray',
  bike text,
  blood text,
  emergency_name text,
  emergency_phone text,
  avatar_url text,
  role text not null default 'member' check (role in ('founder', 'admin', 'moderator', 'member')),
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'banned', 'removed')),
  warnings int not null default 0,
  muted_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date text not null,
  event_time text not null,
  location text not null,
  distance text,
  pace text,
  meeting_point text,
  details text,
  status_text text not null default 'Katılım açık',
  image_type text not null default 'ride',
  attendees_count int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid references public.events(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'event',
  time text not null default 'az önce',
  pinned boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null default 'photo' check (media_type in ('photo', 'video')),
  image_type text not null default 'ride',
  bucket text,
  file_path text,
  public_url text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  views int not null default 0,
  uploaded_by uuid references public.profiles(id),
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_type text not null default 'group',
  pinned_message_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text,
  body text,
  message_type text not null default 'text' check (message_type in ('text', 'image', 'video', 'audio', 'document', 'event', 'poll')),
  bucket text,
  file_path text,
  public_url text,
  reply_to uuid references public.chat_messages(id),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, profile_id, emoji)
);

create table if not exists public.message_receipts (
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.chat_messages(id) on delete cascade,
  question text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null
);

create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, profile_id)
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_profile_id uuid references public.profiles(id) on delete cascade,
  action_type text not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

insert into public.chat_rooms (id, name, room_type)
values ('00000000-0000-0000-0000-000000000068', '68 Riders Ekip Sohbeti', 'group')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('gallery', 'gallery', true),
  ('chat-media', 'chat-media', true),
  ('chat-voice', 'chat-voice', true),
  ('chat-documents', 'chat-documents', true)
on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.is_active_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role in ('founder', 'admin', 'moderator')
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  next_member_no text;
begin
  select coalesce((max(member_no::int) + 1)::text, '68123') into next_member_no
  from public.profiles
  where member_no ~ '^[0-9]+$';

  insert into public.profiles (
    id,
    member_no,
    full_name,
    email,
    phone,
    bike,
    role,
    status
  )
  values (
    new.id,
    next_member_no,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'bike',
    'member',
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.announcements enable row level security;
alter table public.gallery_items enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.message_receipts enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "profiles read active or own" on public.profiles;
create policy "profiles read active or own" on public.profiles
for select using (id = auth.uid() or public.is_active_member());

drop policy if exists "profiles update own basic fields" on public.profiles;
create policy "profiles update own basic fields" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events active read" on public.events;
create policy "events active read" on public.events
for select using (public.is_active_member());

drop policy if exists "events admin write" on public.events;
create policy "events admin write" on public.events
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "attendees active manage own" on public.event_attendees;
create policy "attendees active manage own" on public.event_attendees
for all using (public.is_active_member() and profile_id = auth.uid())
with check (public.is_active_member() and profile_id = auth.uid());

drop policy if exists "announcements active read" on public.announcements;
create policy "announcements active read" on public.announcements
for select using (public.is_active_member());

drop policy if exists "announcements admin write" on public.announcements;
create policy "announcements admin write" on public.announcements
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery active read" on public.gallery_items;
create policy "gallery active read" on public.gallery_items
for select using (public.is_active_member());

drop policy if exists "gallery active insert" on public.gallery_items;
create policy "gallery active insert" on public.gallery_items
for insert with check (public.is_active_member());

drop policy if exists "gallery admin update" on public.gallery_items;
create policy "gallery admin update" on public.gallery_items
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "chat active read rooms" on public.chat_rooms;
create policy "chat active read rooms" on public.chat_rooms
for select using (public.is_active_member());

drop policy if exists "chat admin rooms" on public.chat_rooms;
create policy "chat admin rooms" on public.chat_rooms
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "messages active read" on public.chat_messages;
create policy "messages active read" on public.chat_messages
for select using (public.is_active_member());

drop policy if exists "messages active insert" on public.chat_messages;
create policy "messages active insert" on public.chat_messages
for insert with check (public.is_active_member() and sender_id = auth.uid());

drop policy if exists "messages sender edit" on public.chat_messages;
create policy "messages sender edit" on public.chat_messages
for update using (sender_id = auth.uid() or public.is_admin())
with check (sender_id = auth.uid() or public.is_admin());

drop policy if exists "reactions active manage" on public.message_reactions;
create policy "reactions active manage" on public.message_reactions
for all using (public.is_active_member() and profile_id = auth.uid())
with check (public.is_active_member() and profile_id = auth.uid());

drop policy if exists "receipts active manage" on public.message_receipts;
create policy "receipts active manage" on public.message_receipts
for all using (public.is_active_member() and profile_id = auth.uid())
with check (public.is_active_member() and profile_id = auth.uid());

drop policy if exists "polls active read" on public.polls;
create policy "polls active read" on public.polls for select using (public.is_active_member());

drop policy if exists "polls active insert" on public.polls;
create policy "polls active insert" on public.polls for insert with check (public.is_active_member());

drop policy if exists "poll options active read" on public.poll_options;
create policy "poll options active read" on public.poll_options for select using (public.is_active_member());

drop policy if exists "poll votes active manage" on public.poll_votes;
create policy "poll votes active manage" on public.poll_votes
for all using (public.is_active_member() and profile_id = auth.uid())
with check (public.is_active_member() and profile_id = auth.uid());

drop policy if exists "moderation admin read" on public.moderation_actions;
create policy "moderation admin read" on public.moderation_actions for select using (public.is_admin());

drop policy if exists "moderation admin insert" on public.moderation_actions;
create policy "moderation admin insert" on public.moderation_actions for insert with check (public.is_admin());

drop policy if exists "push own manage" on public.push_subscriptions;
create policy "push own manage" on public.push_subscriptions
for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "avatars active upload" on storage.objects;
create policy "avatars active upload" on storage.objects
for insert with check (bucket_id = 'avatars' and public.is_active_member());

drop policy if exists "public media read" on storage.objects;
create policy "public media read" on storage.objects
for select using (bucket_id in ('avatars', 'gallery', 'chat-media', 'chat-voice', 'chat-documents'));

drop policy if exists "gallery active upload" on storage.objects;
create policy "gallery active upload" on storage.objects
for insert with check (bucket_id = 'gallery' and public.is_active_member());

drop policy if exists "chat active upload" on storage.objects;
create policy "chat active upload" on storage.objects
for insert with check (bucket_id in ('chat-media', 'chat-voice', 'chat-documents') and public.is_active_member());
