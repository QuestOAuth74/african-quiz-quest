-- Update the game_room_players INSERT policy to allow room hosts to add other players
DROP POLICY IF EXISTS "Authenticated users can join game rooms" ON public.game_room_players;

-- Create new policy that allows both self-joining and host adding other players
CREATE POLICY "Players can join rooms or be added by host" 
ON public.game_room_players 
FOR INSERT 
WITH CHECK (
  -- Users can add themselves
  auth.uid() = user_id 
  OR 
  -- Room host can add other players to their room
  EXISTS (
    SELECT 1 FROM public.game_rooms 
    WHERE game_rooms.id = game_room_players.room_id 
    AND game_rooms.host_user_id = auth.uid()
  )
);