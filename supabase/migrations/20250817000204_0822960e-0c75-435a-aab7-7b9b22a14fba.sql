-- Ensure wheel_game_sessions table is properly configured for real-time updates
ALTER TABLE public.wheel_game_sessions REPLICA IDENTITY FULL;

-- Add both tables to the supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_game_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_game_sessions;