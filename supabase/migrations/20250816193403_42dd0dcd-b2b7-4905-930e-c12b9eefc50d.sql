-- Create wheel game challenges table
CREATE TABLE public.wheel_game_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  game_config JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on challenges table
ALTER TABLE public.wheel_game_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wheel_game_challenges
CREATE POLICY "Users can view challenges involving them" 
ON public.wheel_game_challenges 
FOR SELECT 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges" 
ON public.wheel_game_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update challenges involving them" 
ON public.wheel_game_challenges 
FOR UPDATE 
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Create function to clean up expired challenges
CREATE OR REPLACE FUNCTION public.cleanup_expired_wheel_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.wheel_game_challenges 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_wheel_challenges_updated_at
BEFORE UPDATE ON public.wheel_game_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_wheel_session_updated_at();