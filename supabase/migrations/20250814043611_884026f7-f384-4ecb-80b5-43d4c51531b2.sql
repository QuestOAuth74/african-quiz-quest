-- Create storage bucket for question images
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true);

-- Create RLS policies for question images bucket
CREATE POLICY "Admin can upload question images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'question-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can view question images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'question-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can update question images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'question-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admin can delete question images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'question-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Allow public read access to question images (for the game)
CREATE POLICY "Public can view question images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'question-images');