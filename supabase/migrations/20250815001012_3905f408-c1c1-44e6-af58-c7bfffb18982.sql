-- Phase 1: Enable realtime on game tables for live multiplayer synchronization
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_room_players REPLICA IDENTITY FULL; 
ALTER TABLE public.game_room_questions REPLICA IDENTITY FULL;

-- Add tables to realtime publication so clients can subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_room_questions;