-- Fix search path for critical functions to enhance security
-- Only update functions that are missing SET search_path

-- Check and fix find_waiting_players function
CREATE OR REPLACE FUNCTION public.find_waiting_players(exclude_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(user_id uuid, display_name text, email text, last_seen timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.email,
    p.last_seen
  FROM public.profiles p
  WHERE p.player_status = 'waiting'
    AND p.user_id != exclude_user_id
    AND p.last_seen > now() - interval '2 minutes'
  ORDER BY p.last_seen ASC
  LIMIT 10;
END;
$function$;

-- Check and fix cleanup_expired_requests function
CREATE OR REPLACE FUNCTION public.cleanup_expired_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.matchmaking_requests 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$function$;

-- Check and fix generate_room_code function
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character code with letters and numbers
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.game_rooms WHERE room_code = code AND status != 'finished') INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$function$;