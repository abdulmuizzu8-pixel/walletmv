-- WalletMV document box (applied 17 Oct 2026 to the WalletMV Supabase project).
-- A private storage bucket. Each person can only see, add, change and remove files inside their own
-- folder (<their user id>/...). Nothing is public. Max 5 MB a file, pictures and PDFs only, 150 files each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('walletmv-docs', 'walletmv-docs', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Counts only the signed-in person's own files.
create or replace function public.walletmv_my_doc_file_count()
returns integer language sql stable security definer set search_path = '' as $$
  select count(*)::integer from storage.objects o
  where o.bucket_id = 'walletmv-docs' and (storage.foldername(o.name))[1] = (select auth.uid())::text;
$$;
revoke all on function public.walletmv_my_doc_file_count() from public, anon;
grant execute on function public.walletmv_my_doc_file_count() to authenticated;

create policy "walletmv docs: owner can read" on storage.objects for select to authenticated
using (bucket_id = 'walletmv-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "walletmv docs: owner can add" on storage.objects for insert to authenticated
with check (bucket_id = 'walletmv-docs' and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.walletmv_my_doc_file_count() < 150);
create policy "walletmv docs: owner can change" on storage.objects for update to authenticated
using (bucket_id = 'walletmv-docs' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'walletmv-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "walletmv docs: owner can remove" on storage.objects for delete to authenticated
using (bucket_id = 'walletmv-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Note: an earlier helper public.walletmv_doc_file_count(uuid) is left in place with no one allowed to run it.
-- It can be dropped any time: drop function public.walletmv_doc_file_count(uuid);
