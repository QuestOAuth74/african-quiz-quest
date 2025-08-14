-- Create orb tracking table
CREATE TABLE public.user_orbs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  total_orbs integer NOT NULL DEFAULT 0,
  orbs_from_posts integer NOT NULL DEFAULT 0,
  orbs_from_replies integer NOT NULL DEFAULT 0,
  orbs_from_quiz_points integer NOT NULL DEFAULT 0,
  pdf_claimed boolean NOT NULL DEFAULT false,
  pdf_claimed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_orbs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own orbs"
ON public.user_orbs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orbs"
ON public.user_orbs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orbs"
ON public.user_orbs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to calculate and update user orbs
CREATE OR REPLACE FUNCTION public.calculate_user_orbs(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  forum_posts_count integer := 0;
  forum_replies_count integer := 0;
  total_quiz_points integer := 0;
  orbs_from_posts integer := 0;
  orbs_from_replies integer := 0;
  orbs_from_quiz integer := 0;
  total_orbs integer := 0;
BEGIN
  -- Count approved forum posts
  SELECT COUNT(*) INTO forum_posts_count
  FROM public.forum_posts 
  WHERE user_id = p_user_id AND moderation_status = 'approved';
  
  -- Count approved forum replies
  SELECT COUNT(*) INTO forum_replies_count
  FROM public.forum_post_replies 
  WHERE user_id = p_user_id AND moderation_status = 'approved';
  
  -- Get total quiz points
  SELECT COALESCE(SUM(final_score), 0) INTO total_quiz_points
  FROM public.user_games 
  WHERE user_id = p_user_id;
  
  -- Calculate orbs: 10 posts = 1 orb, 20 replies = 1 orb, 5000 points = 10 orbs
  orbs_from_posts := forum_posts_count / 10;
  orbs_from_replies := forum_replies_count / 20;
  orbs_from_quiz := total_quiz_points / 500; -- 5000 points = 10 orbs, so 500 points = 1 orb
  
  total_orbs := orbs_from_posts + orbs_from_replies + orbs_from_quiz;
  
  -- Insert or update user orbs
  INSERT INTO public.user_orbs (
    user_id,
    total_orbs,
    orbs_from_posts,
    orbs_from_replies,
    orbs_from_quiz_points,
    updated_at
  )
  VALUES (
    p_user_id,
    total_orbs,
    orbs_from_posts,
    orbs_from_replies,
    orbs_from_quiz,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_orbs = EXCLUDED.total_orbs,
    orbs_from_posts = EXCLUDED.orbs_from_posts,
    orbs_from_replies = EXCLUDED.orbs_from_replies,
    orbs_from_quiz_points = EXCLUDED.orbs_from_quiz_points,
    updated_at = now();
END;
$function$;

-- Create trigger function to auto-update orbs
CREATE OR REPLACE FUNCTION public.trigger_update_user_orbs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update orbs for the affected user
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_user_orbs(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM public.calculate_user_orbs(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$function$;

-- Create triggers for automatic orb updates
CREATE TRIGGER update_orbs_on_forum_post
  AFTER INSERT OR UPDATE OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_user_orbs();

CREATE TRIGGER update_orbs_on_forum_reply
  AFTER INSERT OR UPDATE OR DELETE ON public.forum_post_replies
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_user_orbs();

CREATE TRIGGER update_orbs_on_user_game
  AFTER INSERT OR UPDATE OR DELETE ON public.user_games
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_user_orbs();

-- Add updated_at trigger
CREATE TRIGGER update_user_orbs_updated_at
  BEFORE UPDATE ON public.user_orbs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();