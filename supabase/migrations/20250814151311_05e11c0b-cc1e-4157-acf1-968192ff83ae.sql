-- Add moderation status to forum posts
ALTER TABLE public.forum_posts 
ADD COLUMN moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN moderated_by uuid REFERENCES auth.users(id),
ADD COLUMN moderated_at timestamp with time zone;

-- Add moderation status to forum post replies
ALTER TABLE public.forum_post_replies 
ADD COLUMN moderation_status text NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN moderated_by uuid REFERENCES auth.users(id),
ADD COLUMN moderated_at timestamp with time zone;

-- Update RLS policies for forum posts to only show approved content to non-admins
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;

CREATE POLICY "Anyone can view approved forum posts" 
ON public.forum_posts 
FOR SELECT 
USING (moderation_status = 'approved' OR has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies for forum replies to only show approved content to non-admins
DROP POLICY IF EXISTS "Anyone can view replies" ON public.forum_post_replies;

CREATE POLICY "Anyone can view approved replies" 
ON public.forum_post_replies 
FOR SELECT 
USING (moderation_status = 'approved' OR has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to moderate posts
CREATE POLICY "Admins can moderate posts" 
ON public.forum_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to moderate replies
CREATE POLICY "Admins can moderate replies" 
ON public.forum_post_replies 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Set new posts to pending by default for new posts
ALTER TABLE public.forum_posts ALTER COLUMN moderation_status SET DEFAULT 'pending';
ALTER TABLE public.forum_post_replies ALTER COLUMN moderation_status SET DEFAULT 'pending';