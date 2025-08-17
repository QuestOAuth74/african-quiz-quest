-- Add wheel_game_sessions to realtime publication (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_game_sessions;
  EXCEPTION WHEN duplicate_object THEN
    -- already added
    NULL;
  END;
END $$;