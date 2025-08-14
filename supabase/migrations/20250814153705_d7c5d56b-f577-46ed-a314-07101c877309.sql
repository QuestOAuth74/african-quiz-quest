-- Add 'quiz' to the allowed game modes in user_games table
ALTER TABLE public.user_games 
DROP CONSTRAINT IF EXISTS user_games_game_mode_check;

ALTER TABLE public.user_games 
ADD CONSTRAINT user_games_game_mode_check 
CHECK (game_mode = ANY (ARRAY['single'::text, 'multiplayer'::text, 'quiz'::text]));