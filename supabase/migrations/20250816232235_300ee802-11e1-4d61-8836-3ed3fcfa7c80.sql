-- Add player name columns to wheel_game_sessions table
ALTER TABLE public.wheel_game_sessions 
ADD COLUMN player1_name text,
ADD COLUMN player2_name text;