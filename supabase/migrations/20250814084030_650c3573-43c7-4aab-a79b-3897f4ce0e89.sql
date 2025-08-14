-- Add foreign key constraints to link forum tables with profiles table

-- Add foreign key constraint for forum_posts
ALTER TABLE public.forum_posts 
ADD CONSTRAINT fk_forum_posts_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint for forum_post_replies  
ALTER TABLE public.forum_post_replies
ADD CONSTRAINT fk_forum_post_replies_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint for forum_post_upvotes
ALTER TABLE public.forum_post_upvotes
ADD CONSTRAINT fk_forum_post_upvotes_user_id  
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint for forum_posts to forum_categories
ALTER TABLE public.forum_posts
ADD CONSTRAINT fk_forum_posts_category_id
FOREIGN KEY (category_id) REFERENCES public.forum_categories(id) ON DELETE CASCADE;

-- Add foreign key constraint for forum_post_replies to forum_posts
ALTER TABLE public.forum_post_replies
ADD CONSTRAINT fk_forum_post_replies_post_id
FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE;

-- Add foreign key constraint for forum_post_upvotes to forum_posts  
ALTER TABLE public.forum_post_upvotes
ADD CONSTRAINT fk_forum_post_upvotes_post_id
FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE;