-- Create game rooms table for real-time multiplayer
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  max_players INTEGER NOT NULL DEFAULT 4,
  current_player_count INTEGER NOT NULL DEFAULT 0,
  game_config JSONB NOT NULL,
  current_turn_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on game_rooms
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for game_rooms
CREATE POLICY "Anyone can view active game rooms" 
ON public.game_rooms 
FOR SELECT 
USING (status != 'finished');

CREATE POLICY "Authenticated users can create game rooms" 
ON public.game_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Host can update their game room" 
ON public.game_rooms 
FOR UPDATE 
USING (auth.uid() = host_user_id);

-- Create game room players table
CREATE TABLE public.game_room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on game_room_players
ALTER TABLE public.game_room_players ENABLE ROW LEVEL SECURITY;

-- Create policies for game_room_players
CREATE POLICY "Anyone can view game room players" 
ON public.game_room_players 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can join game rooms" 
ON public.game_room_players 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update their own data" 
ON public.game_room_players 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Host can update any player in their room" 
ON public.game_room_players 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.game_rooms 
  WHERE id = room_id AND host_user_id = auth.uid()
));

-- Create game room questions table
CREATE TABLE public.game_room_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  answered_by UUID,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on game_room_questions
ALTER TABLE public.game_room_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for game_room_questions
CREATE POLICY "Players can view questions in their room" 
ON public.game_room_questions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.game_room_players 
  WHERE room_id = game_room_questions.room_id AND user_id = auth.uid()
));

CREATE POLICY "Players can insert questions in their room" 
ON public.game_room_questions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.game_room_players 
  WHERE room_id = game_room_questions.room_id AND user_id = auth.uid()
));

CREATE POLICY "Players can update questions in their room" 
ON public.game_room_questions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.game_room_players 
  WHERE room_id = game_room_questions.room_id AND user_id = auth.uid()
));

-- Add indexes for better performance
CREATE INDEX idx_game_rooms_room_code ON public.game_rooms(room_code);
CREATE INDEX idx_game_rooms_status ON public.game_rooms(status);
CREATE INDEX idx_game_room_players_room_id ON public.game_room_players(room_id);
CREATE INDEX idx_game_room_players_user_id ON public.game_room_players(user_id);
CREATE INDEX idx_game_room_questions_room_id ON public.game_room_questions(room_id);

-- Create function to generate room codes
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character code with letters and numbers
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.game_rooms WHERE room_code = code AND status != 'finished') INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update player count
CREATE OR REPLACE FUNCTION public.update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.game_rooms 
    SET current_player_count = current_player_count + 1 
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.game_rooms 
    SET current_player_count = current_player_count - 1 
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for player count updates
CREATE TRIGGER update_room_player_count_trigger
  AFTER INSERT OR DELETE ON public.game_room_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_player_count();