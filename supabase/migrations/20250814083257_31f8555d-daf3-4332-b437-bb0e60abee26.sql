-- Create table for post upvotes
CREATE TABLE public.forum_post_upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create table for post replies
CREATE TABLE public.forum_post_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add upvote_count column to forum_posts
ALTER TABLE public.forum_posts 
ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.forum_post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for upvotes
CREATE POLICY "Anyone can view upvotes" 
ON public.forum_post_upvotes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upvote" 
ON public.forum_post_upvotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvotes" 
ON public.forum_post_upvotes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for replies
CREATE POLICY "Anyone can view replies" 
ON public.forum_post_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create replies" 
ON public.forum_post_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.forum_post_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.forum_post_replies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on replies
CREATE TRIGGER update_forum_post_replies_updated_at
  BEFORE UPDATE ON public.forum_post_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update upvote count
CREATE OR REPLACE FUNCTION public.update_post_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update upvote count for the post
  UPDATE public.forum_posts 
  SET upvote_count = (
    SELECT COUNT(*) 
    FROM public.forum_post_upvotes 
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Triggers to automatically update upvote count
CREATE TRIGGER forum_post_upvote_insert_trigger
  AFTER INSERT ON public.forum_post_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_upvote_count();

CREATE TRIGGER forum_post_upvote_delete_trigger
  AFTER DELETE ON public.forum_post_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_upvote_count();