-- Fix the remaining security issue by dropping the problematic view

-- Drop the existing online_players view that exposes email addresses
DROP VIEW IF EXISTS public.online_players;

-- Create a secure replacement view that doesn't expose email addresses
CREATE VIEW public.online_players AS
SELECT 
    user_id,
    display_name,
    player_status,
    last_seen,
    CASE
        WHEN ((last_seen > (now() - '00:05:00'::interval)) AND (player_status <> 'offline'::text)) THEN true
        ELSE false
    END AS is_online
FROM public.profiles p
WHERE ((player_status <> 'offline'::text) AND (last_seen > (now() - '00:05:00'::interval)));

-- Grant access to authenticated users
GRANT SELECT ON public.online_players TO authenticated;