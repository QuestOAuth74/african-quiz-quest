-- Create database functions for Oware multiplayer functionality

-- Function to create a new Oware game
CREATE OR REPLACE FUNCTION create_oware_game(
  p_host_user_id UUID,
  p_game_state JSONB
) RETURNS TABLE (
  id UUID,
  host_user_id UUID,
  guest_user_id UUID,
  game_state JSONB,
  status TEXT,
  winner_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  new_game_id UUID;
BEGIN
  INSERT INTO oware_games (host_user_id, game_state, status)
  VALUES (p_host_user_id, p_game_state, 'waiting')
  RETURNING oware_games.id INTO new_game_id;
  
  RETURN QUERY
  SELECT 
    og.id,
    og.host_user_id,
    og.guest_user_id,
    og.game_state,
    og.status,
    og.winner_user_id,
    og.created_at,
    og.updated_at
  FROM oware_games og
  WHERE og.id = new_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join an Oware game
CREATE OR REPLACE FUNCTION join_oware_game(
  p_game_id UUID,
  p_user_id UUID
) RETURNS TABLE (
  id UUID,
  host_user_id UUID,
  guest_user_id UUID,
  game_state JSONB,
  status TEXT,
  winner_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  UPDATE oware_games 
  SET 
    guest_user_id = p_user_id,
    status = 'active',
    game_state = jsonb_set(game_state, '{gameStatus}', '"playing"'::jsonb)
  WHERE oware_games.id = p_game_id 
    AND oware_games.status = 'waiting' 
    AND oware_games.guest_user_id IS NULL;
  
  RETURN QUERY
  SELECT 
    og.id,
    og.host_user_id,
    og.guest_user_id,
    og.game_state,
    og.status,
    og.winner_user_id,
    og.created_at,
    og.updated_at
  FROM oware_games og
  WHERE og.id = p_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to make a move in an Oware game
CREATE OR REPLACE FUNCTION make_oware_move(
  p_game_id UUID,
  p_game_state JSONB,
  p_winner_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE oware_games 
  SET 
    game_state = p_game_state,
    updated_at = now(),
    status = CASE 
      WHEN p_winner_user_id IS NOT NULL THEN 'finished'
      ELSE status
    END,
    winner_user_id = p_winner_user_id
  WHERE id = p_game_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;