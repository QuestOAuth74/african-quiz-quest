-- Set REPLICA IDENTITY FULL for wheel_game_challenges to enable complete real-time updates
ALTER TABLE public.wheel_game_challenges REPLICA IDENTITY FULL;