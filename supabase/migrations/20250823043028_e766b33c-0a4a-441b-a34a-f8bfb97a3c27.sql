-- Fix security warning for function search path using ALTER FUNCTION
ALTER FUNCTION public.update_senet_game_updated_at() 
SECURITY DEFINER 
SET search_path = 'public';