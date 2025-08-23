-- Fix security warning for function search path
DROP FUNCTION IF EXISTS public.update_senet_game_updated_at();

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_senet_game_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';