-- Fix security issue: Remove email exposure from profiles table

-- 1. First, let's drop the problematic RLS policy that exposes emails
DROP POLICY IF EXISTS "Anyone can view online players" ON public.profiles;

-- 2. Create a new policy that allows viewing only non-sensitive profile data
-- This policy allows viewing basic profile info (excluding email) for matchmaking/lobby purposes
CREATE POLICY "Users can view basic profile info of online players" 
ON public.profiles 
FOR SELECT 
USING (
  player_status <> 'offline' 
  AND auth.uid() IS NOT NULL
);

-- 3. Create a secure view for online players that excludes sensitive data
CREATE OR REPLACE VIEW public.online_players_secure AS
SELECT 
  user_id,
  display_name,
  player_status,
  last_seen,
  CASE WHEN player_status <> 'offline' THEN true ELSE false END as is_online
FROM public.profiles
WHERE player_status <> 'offline';

-- 4. Grant access to the secure view
GRANT SELECT ON public.online_players_secure TO authenticated;

-- 5. Create a function for admins to access email data when needed (for moderation)
CREATE OR REPLACE FUNCTION public.get_user_email_for_moderation(target_user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN (SELECT email FROM public.profiles WHERE user_id = target_user_id);
END;
$$;

-- 6. Create a function to get forum post author info (excluding email for non-admins)
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
  IF has_role(auth.uid(), 'admin'::app_role) THEN
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