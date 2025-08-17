-- Ensure wheel_game_sessions table is properly configured for real-time updates
ALTER TABLE public.wheel_game_sessions REPLICA IDENTITY FULL;