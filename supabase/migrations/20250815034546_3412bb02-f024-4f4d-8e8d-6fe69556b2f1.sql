-- Fix the calculate_user_orbs function to use correct column names
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
  -- Count approved forum posts (using moderation_status instead of is_approved)
  SELECT COUNT(*) INTO forum_posts_count
  FROM public.forum_posts 
  WHERE user_id = p_user_id AND moderation_status = 'approved';
  
  -- Count approved forum replies (using moderation_status instead of is_approved)
  SELECT COUNT(*) INTO forum_replies_count
  FROM public.forum_post_replies 
  WHERE user_id = p_user_id AND moderation_status = 'approved';
  
  -- Get total quiz points
  SELECT COALESCE(SUM(final_score), 0) INTO total_quiz_points
  FROM public.user_games 
  WHERE user_id = p_user_id;
  
  -- Calculate orbs: 10 posts = 5 orbs, 20 replies = 7 orbs, 5000 points = 5 orbs
  orbs_from_posts := (forum_posts_count / 10) * 5;
  orbs_from_replies := (forum_replies_count / 20) * 7;
  orbs_from_quiz := total_quiz_points / 1000; -- 5000 points = 5 orbs, so 1000 points = 1 orb
  
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