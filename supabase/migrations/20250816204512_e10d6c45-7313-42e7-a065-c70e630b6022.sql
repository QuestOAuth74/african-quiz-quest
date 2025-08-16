-- Add support for single-player and different game modes
ALTER TABLE public.wheel_game_sessions 
  ALTER COLUMN player2_id DROP NOT NULL,
  ADD COLUMN game_mode text NOT NULL DEFAULT 'challenge',
  ADD COLUMN computer_difficulty text DEFAULT NULL,
  ADD COLUMN computer_player_data jsonb DEFAULT NULL;

-- Add check constraint for valid game modes
ALTER TABLE public.wheel_game_sessions 
  ADD CONSTRAINT valid_game_mode CHECK (game_mode IN ('single', 'challenge', 'live-multiplayer'));

-- Add check constraint for computer difficulty
ALTER TABLE public.wheel_game_sessions 
  ADD CONSTRAINT valid_difficulty CHECK (computer_difficulty IS NULL OR computer_difficulty IN ('easy', 'medium', 'hard'));

-- Create wheel_puzzles table for the game
CREATE TABLE public.wheel_puzzles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  phrase text NOT NULL,
  difficulty integer NOT NULL DEFAULT 1,
  hint text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wheel_puzzles ENABLE ROW LEVEL SECURITY;

-- Create policies for wheel_puzzles
CREATE POLICY "Users can view active puzzles" 
ON public.wheel_puzzles 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage puzzles" 
ON public.wheel_puzzles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert some sample African-themed puzzles
INSERT INTO public.wheel_puzzles (category, phrase, difficulty, hint) VALUES
('African Countries', 'SOUTH AFRICA', 1, 'Rainbow nation at the southern tip'),
('African Culture', 'UBUNTU PHILOSOPHY', 2, 'I am because we are'),
('African Wildlife', 'BIG FIVE SAFARI', 2, 'Most sought-after animals'),
('African History', 'GREAT ZIMBABWE', 3, 'Ancient stone city'),
('African Geography', 'KILIMANJARO PEAK', 2, 'Highest mountain in Africa'),
('African Music', 'AFROBEAT RHYTHM', 2, 'Genre pioneered by Fela Kuti'),
('African Literature', 'CHINUA ACHEBE', 3, 'Things Fall Apart author'),
('African Cuisine', 'JOLLOF RICE', 1, 'Popular West African dish'),
('African Languages', 'SWAHILI LANGUAGE', 2, 'Widely spoken in East Africa'),
('African Landmarks', 'VICTORIA FALLS', 2, 'The smoke that thunders');

-- Enable real-time for wheel_puzzles
ALTER TABLE public.wheel_puzzles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wheel_puzzles;