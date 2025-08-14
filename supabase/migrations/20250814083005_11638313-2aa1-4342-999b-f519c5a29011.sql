-- Create storage bucket for forum post images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-images', 'forum-images', true);

-- Add image_url column to forum_posts table
ALTER TABLE public.forum_posts 
ADD COLUMN image_url TEXT;

-- Create RLS policies for forum images storage
CREATE POLICY "Anyone can view forum images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'forum-images');

CREATE POLICY "Authenticated users can upload forum images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'forum-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own forum images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'forum-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own forum images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'forum-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);