-- Fix remaining functions with missing search_path settings

CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, user_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_id UUID;
BEGIN
  -- Note: In production, users should sign up through the normal auth flow
  -- This is for initial admin setup only
  
  -- Check if user already exists in profiles
  SELECT profiles.user_id INTO user_id 
  FROM public.profiles 
  WHERE profiles.email = user_email;
  
  IF user_id IS NOT NULL THEN
    -- User exists, just make them admin
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE email = user_email;
    
    RETURN 'User ' || user_email || ' has been made an admin';
  ELSE
    -- User doesn't exist in profiles, they need to sign up first
    RETURN 'User ' || user_email || ' needs to sign up first through the normal auth flow';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.make_user_admin_by_email(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User with email ' || user_email || ' not found. Please sign up first.';
  END IF;
  
  -- Add admin role (user role should already exist from trigger)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
    
  RETURN 'User ' || user_email || ' has been made an admin successfully.';
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT public.has_role(auth.uid(), 'admin')
$function$;

CREATE OR REPLACE FUNCTION public.update_user_correct_streak(p_user_id uuid, p_is_correct boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF p_is_correct THEN
        -- Increment current streak
        UPDATE public.user_stats 
        SET 
            current_correct_streak = current_correct_streak + 1,
            longest_correct_streak = GREATEST(longest_correct_streak, current_correct_streak + 1),
            updated_at = now()
        WHERE user_id = p_user_id;
        
        -- Create stats record if it doesn't exist
        INSERT INTO public.user_stats (user_id, current_correct_streak, longest_correct_streak)
        VALUES (p_user_id, 1, 1)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        -- Reset current streak
        UPDATE public.user_stats 
        SET 
            current_correct_streak = 0,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_single_player_stats()
RETURNS TABLE(user_id uuid, email text, total_points_vs_computer integer, best_category_name text, best_category_points integer, total_games_vs_computer integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    COALESCE(SUM(ug.final_score), 0)::integer as total_points_vs_computer,
    best_cat.category_name as best_category_name,
    COALESCE(best_cat.max_points, 0)::integer as best_category_points,
    COUNT(ug.id)::integer as total_games_vs_computer
  FROM profiles p
  LEFT JOIN user_games ug ON p.user_id = ug.user_id AND ug.game_mode = 'single'
  LEFT JOIN LATERAL (
    SELECT 
      unnest(ug2.categories_played) as category_name,
      MAX(ug2.final_score) as max_points
    FROM user_games ug2 
    WHERE ug2.user_id = p.user_id AND ug2.game_mode = 'single'
    GROUP BY unnest(ug2.categories_played)
    ORDER BY max_points DESC
    LIMIT 1
  ) best_cat ON true
  WHERE p.is_admin = false
  GROUP BY p.user_id, p.email, best_cat.category_name, best_cat.max_points
  ORDER BY total_points_vs_computer DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_upvote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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