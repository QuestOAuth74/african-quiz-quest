-- Add bibliography field to blog_posts table for references
ALTER TABLE public.blog_posts 
ADD COLUMN bibliography text;