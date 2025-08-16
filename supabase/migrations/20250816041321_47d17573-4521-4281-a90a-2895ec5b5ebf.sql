-- Fix current_player_count sync issues and ensure proper trigger

-- First, create a function to fix current data inconsistencies
CREATE OR REPLACE FUNCTION fix_room_player_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update all room player counts to match actual active players
  UPDATE public.game_rooms 
  SET current_player_count = (
    SELECT COUNT(*)
    FROM public.game_room_players grp
    WHERE grp.room_id = game_rooms.id 
    AND grp.is_active = true
  );
END;
$$;

-- Run the fix function
SELECT fix_room_player_counts();

-- Ensure the trigger function exists and is correct
CREATE OR REPLACE FUNCTION public.update_room_player_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.game_rooms 
    SET current_player_count = (
      SELECT COUNT(*)
      FROM public.game_room_players 
      WHERE room_id = NEW.room_id AND is_active = true
    )
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle is_active changes
    UPDATE public.game_rooms 
    SET current_player_count = (
      SELECT COUNT(*)
      FROM public.game_room_players 
      WHERE room_id = NEW.room_id AND is_active = true
    )
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.game_rooms 
    SET current_player_count = (
      SELECT COUNT(*)
      FROM public.game_room_players 
      WHERE room_id = OLD.room_id AND is_active = true
    )
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS trigger_update_room_player_count ON public.game_room_players;

-- Create the trigger for all operations that affect player count
CREATE TRIGGER trigger_update_room_player_count
  AFTER INSERT OR UPDATE OR DELETE ON public.game_room_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_player_count();