-- Enable real-time updates for Wheel game tables
-- Challenges
ALTER TABLE public.wheel_game_challenges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_game_challenges;

-- Game sessions
ALTER TABLE public.wheel_game_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_game_sessions;