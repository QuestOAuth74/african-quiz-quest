-- Create storage bucket for blog PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-pdfs', 'blog-pdfs', true);

-- Create storage policies for blog PDFs
CREATE POLICY "Admins can upload blog PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'blog-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view blog PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-pdfs');

CREATE POLICY "Admins can update blog PDFs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'blog-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog PDFs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'blog-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

-- Add PDF attachment field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN pdf_attachment_url TEXT,
ADD COLUMN pdf_attachment_name TEXT;