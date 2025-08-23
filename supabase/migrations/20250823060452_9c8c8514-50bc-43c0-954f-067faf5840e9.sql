-- Add foreign key constraint linking blog_comments to profiles
ALTER TABLE public.blog_comments 
ADD CONSTRAINT fk_blog_comments_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Also add foreign key to blog_posts for better data integrity
ALTER TABLE public.blog_comments 
ADD CONSTRAINT fk_blog_comments_post_id 
FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;