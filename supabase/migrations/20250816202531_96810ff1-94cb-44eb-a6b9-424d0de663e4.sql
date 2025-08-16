-- Enable real-time updates for wheel_game_challenges table
ALTER TABLE public.wheel_game_challenges REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.wheel_game_challenges;

-- Enable real-time updates for wheel_game_sessions table  
ALTER TABLE public.wheel_game_sessions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.wheel_game_sessions;