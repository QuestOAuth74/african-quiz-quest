-- Update forum posts to be immediately visible when created
-- Change default moderation status to 'approved' so posts appear immediately
ALTER TABLE public.forum_posts 
ALTER COLUMN moderation_status SET DEFAULT 'approved';

-- Update forum replies to be immediately visible when created  
ALTER TABLE public.forum_post_replies 
ALTER COLUMN moderation_status SET DEFAULT 'approved';

-- Add policy for admins to delete any forum post
CREATE POLICY "Admins can delete any post" 
ON public.forum_posts 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete any forum reply
CREATE POLICY "Admins can delete any reply" 
ON public.forum_post_replies 
FOR DELETE 
TO authenticated  
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update the view policy to show all posts (approved, pending, rejected) to make it more permissive
-- This ensures that even if moderation_status somehow gets set to something else, posts are still visible
DROP POLICY IF EXISTS "Anyone can view approved forum posts" ON public.forum_posts;
CREATE POLICY "Anyone can view forum posts" 
ON public.forum_posts 
FOR SELECT 
TO authenticated
USING (true);

-- Update the view policy for replies as well
DROP POLICY IF EXISTS "Anyone can view approved replies" ON public.forum_post_replies;
CREATE POLICY "Anyone can view forum replies" 
ON public.forum_post_replies 
FOR SELECT 
TO authenticated
USING (true);