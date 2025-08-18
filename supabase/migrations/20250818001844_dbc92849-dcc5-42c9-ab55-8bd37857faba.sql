-- Make blog-pdfs bucket private and add storage policies
-- 1) Ensure bucket exists and set to private
UPDATE storage.buckets SET public = false WHERE id = 'blog-pdfs';

-- 2) Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Authenticated users can view blog PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload blog PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog PDFs" ON storage.objects;

-- 3) Create new storage policies
-- Allow authenticated users to view (SELECT) objects metadata so they can create signed URLs
CREATE POLICY "Authenticated users can view blog PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-pdfs' AND auth.role() = 'authenticated');

-- Allow admins to upload files
CREATE POLICY "Admins can upload blog PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-pdfs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Allow admins to update files (e.g., replace)
CREATE POLICY "Admins can update blog PDFs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'blog-pdfs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Allow admins to delete files
CREATE POLICY "Admins can delete blog PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-pdfs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );