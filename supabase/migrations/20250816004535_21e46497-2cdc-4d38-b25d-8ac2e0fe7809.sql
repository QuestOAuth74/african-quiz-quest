-- Enable real-time for matchmaking_requests and profiles tables
ALTER TABLE public.matchmaking_requests REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;