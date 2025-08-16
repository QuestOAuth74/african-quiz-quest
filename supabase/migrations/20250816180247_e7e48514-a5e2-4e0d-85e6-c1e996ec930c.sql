-- Create table for storing crossword game states
CREATE TABLE public.crossword_game_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES public.crossword_puzzles(id) ON DELETE CASCADE,
  game_state jsonb NOT NULL,
  time_elapsed integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  hints_used integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, puzzle_id)
);

-- Enable RLS
ALTER TABLE public.crossword_game_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own game states"
  ON public.crossword_game_states
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_crossword_game_states_updated_at
  BEFORE UPDATE ON public.crossword_game_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries
CREATE INDEX idx_crossword_game_states_user_puzzle 
  ON public.crossword_game_states(user_id, puzzle_id);

CREATE INDEX idx_crossword_game_states_user_updated 
  ON public.crossword_game_states(user_id, updated_at DESC);