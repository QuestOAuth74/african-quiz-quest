-- Clean up old active game records that are causing issues
-- Mark all old game room players as inactive
UPDATE public.game_room_players 
SET is_active = false 
WHERE joined_at < now() - interval '1 hour';

-- Mark all old waiting/active game rooms as finished
UPDATE public.game_rooms 
SET status = 'finished', finished_at = now()
WHERE status IN ('waiting', 'active') 
  AND created_at < now() - interval '1 hour';

-- Clean up any pending matchmaking requests older than 10 minutes
UPDATE public.matchmaking_requests 
SET status = 'expired'
WHERE status = 'pending' 
  AND created_at < now() - interval '10 minutes';