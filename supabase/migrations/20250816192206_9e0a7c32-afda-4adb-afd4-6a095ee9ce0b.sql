-- Create wheel puzzles table
CREATE TABLE public.wheel_puzzles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  phrase TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create wheel game sessions table
CREATE TABLE public.wheel_game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL,
  player2_id UUID NOT NULL,
  current_player INTEGER NOT NULL DEFAULT 1,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  player1_round_score INTEGER NOT NULL DEFAULT 0,
  player2_round_score INTEGER NOT NULL DEFAULT 0,
  current_puzzle_id UUID,
  game_state JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'waiting',
  rounds_won_player1 INTEGER NOT NULL DEFAULT 0,
  rounds_won_player2 INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wheel game moves table
CREATE TABLE public.wheel_game_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  player_id UUID NOT NULL,
  move_type TEXT NOT NULL, -- 'spin', 'guess_letter', 'buy_vowel', 'solve_puzzle'
  move_data JSONB NOT NULL DEFAULT '{}',
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wheel_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_game_moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wheel_puzzles
CREATE POLICY "Admins can manage wheel puzzles" 
ON public.wheel_puzzles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view active wheel puzzles" 
ON public.wheel_puzzles 
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for wheel_game_sessions
CREATE POLICY "Players can view their own game sessions" 
ON public.wheel_game_sessions 
FOR SELECT 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can create game sessions" 
ON public.wheel_game_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Players can update their own game sessions" 
ON public.wheel_game_sessions 
FOR UPDATE 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- RLS Policies for wheel_game_moves
CREATE POLICY "Players can view moves in their sessions" 
ON public.wheel_game_moves 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.wheel_game_sessions 
  WHERE id = wheel_game_moves.session_id 
  AND (player1_id = auth.uid() OR player2_id = auth.uid())
));

CREATE POLICY "Players can create moves in their sessions" 
ON public.wheel_game_moves 
FOR INSERT 
WITH CHECK (
  auth.uid() = player_id 
  AND EXISTS (
    SELECT 1 FROM public.wheel_game_sessions 
    WHERE id = wheel_game_moves.session_id 
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);

-- Create function to update wheel session timestamps
CREATE OR REPLACE FUNCTION public.update_wheel_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for wheel sessions
CREATE TRIGGER update_wheel_sessions_updated_at
BEFORE UPDATE ON public.wheel_game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_wheel_session_updated_at();

-- Insert sample wheel puzzles with African history themes
INSERT INTO public.wheel_puzzles (category, phrase, difficulty, hint) VALUES
('Historical Figures', 'NELSON MANDELA', 2, 'Anti-apartheid revolutionary and South African president'),
('Ancient Kingdoms', 'KINGDOM OF KUSH', 3, 'Ancient African kingdom along the Nile River'),
('Cultural Traditions', 'UBUNTU PHILOSOPHY', 3, 'African philosophy emphasizing interconnectedness'),
('Geographic Features', 'SAHARA DESERT', 2, 'Largest hot desert in the world'),
('Historical Events', 'BATTLE OF ADWA', 3, 'Ethiopian victory over Italian invasion in 1896'),
('Ancient Civilizations', 'GREAT ZIMBABWE', 3, 'Medieval city and trading center'),
('Cultural Heritage', 'DJEMBE DRUMS', 2, 'Traditional West African percussion instruments'),
('Historical Figures', 'QUEEN NZINGA', 3, 'Angolan queen who resisted Portuguese colonization'),
('Geographic Features', 'VICTORIA FALLS', 2, 'Waterfall on the Zambezi River'),
('Ancient Kingdoms', 'MALI EMPIRE', 2, 'Medieval African empire known for wealth and trade');