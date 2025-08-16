
-- 1) Keep game_rooms.current_player_count accurate on player join/leave
DROP TRIGGER IF EXISTS trg_game_room_player_count ON public.game_room_players;

CREATE TRIGGER trg_game_room_player_count
AFTER INSERT OR DELETE ON public.game_room_players
FOR EACH ROW
EXECUTE FUNCTION public.update_room_player_count();

-- 2) Ensure robust realtime UPDATE payloads (safer for sync)
ALTER TABLE public.matchmaking_requests REPLICA IDENTITY FULL;
ALTER TABLE public.game_rooms            REPLICA IDENTITY FULL;
ALTER TABLE public.game_room_players     REPLICA IDENTITY FULL;
ALTER TABLE public.game_room_questions   REPLICA IDENTITY FULL;
ALTER TABLE public.profiles              REPLICA IDENTITY FULL;

-- 3) Relax the uniqueness to only pending requests (prevents permanent blocks)
-- Existing unique constraint observed in logs:
-- "matchmaking_requests_requester_id_target_id_key"
ALTER TABLE public.matchmaking_requests
  DROP CONSTRAINT IF EXISTS matchmaking_requests_requester_id_target_id_key;

-- Enforce uniqueness only while a request is pending
CREATE UNIQUE INDEX IF NOT EXISTS ux_matchmaking_requests_pending_pair
  ON public.matchmaking_requests (requester_id, target_id)
  WHERE status = 'pending';

-- 4) Helpful index to speed up per-user lookups for realtime/joins
CREATE INDEX IF NOT EXISTS idx_game_room_players_user_id
  ON public.game_room_players (user_id);
