create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.id = auth.uid() then
    new.member_no := old.member_no;
    new.role := old.role;
    new.status := old.status;
    new.warnings := old.warnings;
    new.muted_until := old.muted_until;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_admin_fields on public.profiles;
create trigger protect_profile_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

drop policy if exists "gallery admin delete" on public.gallery_items;
create policy "gallery admin delete" on public.gallery_items
for delete using (public.is_admin());
