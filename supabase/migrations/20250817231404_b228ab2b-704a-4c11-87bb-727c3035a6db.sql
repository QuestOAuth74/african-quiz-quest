-- Add references field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN references text;