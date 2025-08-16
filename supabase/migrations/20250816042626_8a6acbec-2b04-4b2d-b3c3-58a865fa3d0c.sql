-- Create a secure function to advance the room turn for any active player in the room
CREATE OR REPLACE FUNCTION public.advance_room_turn(p_room_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller_user_id uuid := auth.uid();
  player_ids uuid[];
  current_idx int;
  next_user uuid;
  room_rec record;
BEGIN
  -- Ensure caller is an active player in this room
  IF NOT EXISTS (
    SELECT 1 FROM public.game_room_players 
    WHERE room_id = p_room_id AND user_id = caller_user_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Not a player in this room';
  END IF;

  SELECT * INTO room_rec FROM public.game_rooms WHERE id = p_room_id;

  -- Build ordered list of active players
  SELECT array_agg(user_id ORDER BY joined_at) INTO player_ids
  FROM public.game_room_players
  WHERE room_id = p_room_id AND is_active = true;

  IF player_ids IS NULL OR array_length(player_ids,1) = 0 THEN
    RAISE EXCEPTION 'No active players';
  END IF;

  IF room_rec.current_turn_user_id IS NULL THEN
    next_user := player_ids[1];
  ELSE
    SELECT COALESCE(array_position(player_ids, room_rec.current_turn_user_id), 0) INTO current_idx;
    IF current_idx = 0 THEN
      next_user := player_ids[1];
    ELSE
      IF current_idx >= array_length(player_ids,1) THEN
        next_user := player_ids[1];
      ELSE
        next_user := player_ids[current_idx + 1];
      END IF;
    END IF;
  END IF;

  UPDATE public.game_rooms
  SET current_turn_user_id = next_user
  WHERE id = p_room_id;

  RETURN next_user;
END;
$$;

-- Allow authenticated users to execute this function
GRANT EXECUTE ON FUNCTION public.advance_room_turn(uuid) TO authenticated;