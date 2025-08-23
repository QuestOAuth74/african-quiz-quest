-- Create Oware games table for multiplayer functionality
CREATE TABLE IF NOT EXISTS oware_games (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    game_state JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
    winner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE oware_games ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create games" ON oware_games
    FOR INSERT
    WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Users can view games they participate in" ON oware_games
    FOR SELECT
    USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id OR status = 'waiting');

CREATE POLICY "Participants can update their games" ON oware_games
    FOR UPDATE
    USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id);

CREATE POLICY "Host can delete their games" ON oware_games
    FOR DELETE
    USING (auth.uid() = host_user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oware_games_updated_at
    BEFORE UPDATE ON oware_games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add to realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE oware_games;