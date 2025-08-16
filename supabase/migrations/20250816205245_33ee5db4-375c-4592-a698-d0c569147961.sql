-- Add support for single-player and different game modes to wheel_game_sessions
ALTER TABLE public.wheel_game_sessions 
  ALTER COLUMN player2_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS game_mode text NOT NULL DEFAULT 'challenge',
  ADD COLUMN IF NOT EXISTS computer_difficulty text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS computer_player_data jsonb DEFAULT NULL;

-- Add check constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_game_mode') THEN
    ALTER TABLE public.wheel_game_sessions 
      ADD CONSTRAINT valid_game_mode CHECK (game_mode IN ('single', 'challenge', 'live-multiplayer'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_difficulty') THEN
    ALTER TABLE public.wheel_game_sessions 
      ADD CONSTRAINT valid_difficulty CHECK (computer_difficulty IS NULL OR computer_difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;