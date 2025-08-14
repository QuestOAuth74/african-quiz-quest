-- Fix security warnings from the linter

-- 1. Fix the search_path issue in our functions
CREATE OR REPLACE FUNCTION public.get_user_email_for_moderation(target_user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN (SELECT email FROM public.profiles WHERE user_id = target_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_forum_author_info(author_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    -- Admins can see email addresses for moderation
    RETURN QUERY
    SELECT p.user_id, p.display_name, p.email
    FROM public.profiles p
    WHERE p.user_id = author_user_id;
  ELSE
    -- Regular users cannot see email addresses
    RETURN QUERY
    SELECT p.user_id, p.display_name, NULL::text as email
    FROM public.profiles p
    WHERE p.user_id = author_user_id;
  END IF;
END;
$$;

-- 2. Replace the view with a function to avoid SECURITY DEFINER view issues
DROP VIEW IF EXISTS public.online_players_secure;

CREATE OR REPLACE FUNCTION public.get_online_players()
RETURNS TABLE(
  user_id uuid,
  display_name text,
  player_status text,
  last_seen timestamp with time zone,
  is_online boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return basic info, no email addresses
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.player_status,
    p.last_seen,
    CASE WHEN p.player_status <> 'offline' THEN true ELSE false END as is_online
  FROM public.profiles p
  WHERE p.player_status <> 'offline'
    AND auth.uid() IS NOT NULL;
END;
$$;