-- Add player status and presence tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  player_status TEXT DEFAULT 'offline' CHECK (player_status IN ('offline', 'online', 'waiting', 'in_game'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create a view for online players
CREATE OR REPLACE VIEW public.online_players AS
SELECT 
  p.user_id,
  p.email,
  p.display_name,
  p.player_status,
  p.last_seen,
  CASE 
    WHEN p.last_seen > now() - interval '5 minutes' THEN true
    ELSE false
  END as is_online
FROM public.profiles p
WHERE p.player_status != 'offline' 
  AND p.last_seen > now() - interval '5 minutes'
ORDER BY p.last_seen DESC;

-- Function to update player status
CREATE OR REPLACE FUNCTION public.update_player_status(new_status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    player_status = new_status,
    last_seen = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Function to find available players for matchmaking
CREATE OR REPLACE FUNCTION public.find_waiting_players(exclude_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  email TEXT,
  last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.display_name,
    p.email,
    p.last_seen
  FROM public.profiles p
  WHERE p.player_status = 'waiting'
    AND p.user_id != exclude_user_id
    AND p.last_seen > now() - interval '2 minutes'
  ORDER BY p.last_seen ASC
  LIMIT 10;
END;
$$;

-- Create a matchmaking requests table
CREATE TABLE IF NOT EXISTS public.matchmaking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  target_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  game_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 minutes'),
  UNIQUE(requester_id, target_id)
);

-- Enable RLS on matchmaking_requests
ALTER TABLE public.matchmaking_requests ENABLE ROW LEVEL SECURITY;

-- Policies for matchmaking requests
CREATE POLICY "Users can view their matchmaking requests" 
ON public.matchmaking_requests 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can create matchmaking requests" 
ON public.matchmaking_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their matchmaking requests" 
ON public.matchmaking_requests 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = target_id);

-- Policies for online_players view
CREATE POLICY "Anyone can view online players" 
ON public.profiles 
FOR SELECT 
USING (player_status != 'offline');

-- Function to automatically expire old matchmaking requests
CREATE OR REPLACE FUNCTION public.cleanup_expired_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.matchmaking_requests 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < now();
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_player_status ON public.profiles(player_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);
CREATE INDEX IF NOT EXISTS idx_matchmaking_status ON public.matchmaking_requests(status);
CREATE INDEX IF NOT EXISTS idx_matchmaking_expires ON public.matchmaking_requests(expires_at);