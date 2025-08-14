-- Fix the security definer view issue by removing SECURITY DEFINER and using regular view
DROP VIEW IF EXISTS public.online_players;

-- Create a regular view without SECURITY DEFINER
CREATE OR REPLACE VIEW public.online_players AS
SELECT 
  p.user_id,
  p.email,
  p.display_name,
  p.player_status,
  p.last_seen,
  CASE 
    WHEN p.last_seen > now() - interval '5 minutes' THEN true
    ELSE false
  END as is_online
FROM public.profiles p
WHERE p.player_status != 'offline' 
  AND p.last_seen > now() - interval '5 minutes'
ORDER BY p.last_seen DESC;