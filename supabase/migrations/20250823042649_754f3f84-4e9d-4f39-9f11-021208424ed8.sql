-- Create enum for game types
CREATE TYPE public.senet_game_type AS ENUM ('single_player', 'online_multiplayer');

-- Create enum for game status
CREATE TYPE public.senet_game_status AS ENUM ('waiting', 'active', 'finished', 'abandoned');

-- Create table for online Senet games
CREATE TABLE public.senet_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.senet_game_type NOT NULL DEFAULT 'single_player',
  status public.senet_game_status NOT NULL DEFAULT 'waiting',
  host_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guest_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_state JSONB NOT NULL DEFAULT '{}',
  winner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.senet_games ENABLE ROW LEVEL SECURITY;

-- Create policies for senet_games
CREATE POLICY "Users can view games they participate in"
ON public.senet_games
FOR SELECT
USING (
  auth.uid() = host_user_id OR 
  auth.uid() = guest_user_id
);

CREATE POLICY "Users can create their own games"
ON public.senet_games
FOR INSERT
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Participants can update game state"
ON public.senet_games
FOR UPDATE
USING (
  auth.uid() = host_user_id OR 
  auth.uid() = guest_user_id
);

-- Create table for real-time game moves
CREATE TABLE public.senet_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.senet_games(id) ON DELETE CASCADE NOT NULL,
  player_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  move_data JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.senet_moves ENABLE ROW LEVEL SECURITY;

-- Create policies for senet_moves
CREATE POLICY "Users can view moves for their games"
ON public.senet_moves
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.senet_games 
    WHERE id = game_id 
    AND (host_user_id = auth.uid() OR guest_user_id = auth.uid())
  )
);

CREATE POLICY "Users can create moves for their games"
ON public.senet_moves
FOR INSERT
WITH CHECK (
  auth.uid() = player_user_id AND
  EXISTS (
    SELECT 1 FROM public.senet_games 
    WHERE id = game_id 
    AND (host_user_id = auth.uid() OR guest_user_id = auth.uid())
    AND status = 'active'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_senet_game_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_senet_games_updated_at
  BEFORE UPDATE ON public.senet_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_senet_game_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_senet_games_status ON public.senet_games(status);
CREATE INDEX idx_senet_games_host_user ON public.senet_games(host_user_id);
CREATE INDEX idx_senet_games_guest_user ON public.senet_games(guest_user_id);
CREATE INDEX idx_senet_games_type ON public.senet_games(type);
CREATE INDEX idx_senet_moves_game_id ON public.senet_moves(game_id);
CREATE INDEX idx_senet_moves_created_at ON public.senet_moves(created_at);

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.senet_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.senet_moves;

-- Set replica identity for realtime updates
ALTER TABLE public.senet_games REPLICA IDENTITY FULL;
ALTER TABLE public.senet_moves REPLICA IDENTITY FULL;