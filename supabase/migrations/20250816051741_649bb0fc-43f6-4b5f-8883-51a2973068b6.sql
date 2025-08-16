-- Update blog_posts to reference existing categories table instead of blog_categories
ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_category_id_fkey;

ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- Drop the separate blog_categories table since we'll use existing categories
DROP TABLE IF EXISTS public.blog_categories CASCADE;