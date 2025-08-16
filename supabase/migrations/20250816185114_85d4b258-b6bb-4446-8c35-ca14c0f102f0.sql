-- Create table to track words used in crossword puzzles
CREATE TABLE public.crossword_word_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL,
  puzzle_id UUID,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crossword_word_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own word usage" 
ON public.crossword_word_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own word usage" 
ON public.crossword_word_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_crossword_word_usage_user_word ON public.crossword_word_usage(user_id, word_id);
CREATE INDEX idx_crossword_word_usage_user_puzzle ON public.crossword_word_usage(user_id, puzzle_id);