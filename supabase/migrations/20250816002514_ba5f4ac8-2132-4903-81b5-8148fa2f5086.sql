-- Fix the get_online_players function to return online players properly
CREATE OR REPLACE FUNCTION public.get_online_players()
 RETURNS TABLE(user_id uuid, display_name text, player_status text, last_seen timestamp with time zone, is_online boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Return players who are not offline and have been active recently
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.player_status,
    p.last_seen,
    CASE WHEN p.player_status <> 'offline' AND p.last_seen > now() - interval '5 minutes' THEN true ELSE false END as is_online
  FROM public.profiles p
  WHERE p.player_status <> 'offline'
    AND p.last_seen > now() - interval '5 minutes'
  ORDER BY p.last_seen DESC;
END;
$function$