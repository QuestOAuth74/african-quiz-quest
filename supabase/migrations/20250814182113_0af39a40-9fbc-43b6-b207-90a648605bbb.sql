-- Fix the security definer view issue
DROP VIEW IF EXISTS public.online_players;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW public.online_players AS
SELECT 
  p.user_id,
  p.display_name,
  p.email,
  p.player_status,
  p.last_seen,
  CASE 
    WHEN p.last_seen > now() - interval '5 minutes' AND p.player_status != 'offline' 
    THEN true 
    ELSE false 
  END as is_online
FROM public.profiles p
WHERE p.player_status != 'offline' 
  AND p.last_seen > now() - interval '5 minutes';