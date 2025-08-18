-- Make blog-pdfs bucket private and add storage policies
-- 1) Ensure bucket exists and set to private
update storage.buckets set public = false where id = 'blog-pdfs';

-- 2) Storage RLS policies on storage.objects for blog-pdfs
-- Allow authenticated users to view (SELECT) objects metadata so they can create signed URLs
create policy if not exists "Authenticated users can view blog PDFs"
  on storage.objects for select
  using (bucket_id = 'blog-pdfs' and auth.role() = 'authenticated');

-- Allow admins to upload files
create policy if not exists "Admins can upload blog PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-pdfs' and public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Allow admins to update files (e.g., replace)
create policy if not exists "Admins can update blog PDFs"
  on storage.objects for update
  using (
    bucket_id = 'blog-pdfs' and public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Allow admins to delete files
create policy if not exists "Admins can delete blog PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'blog-pdfs' and public.has_role(auth.uid(), 'admin'::public.app_role)
  );