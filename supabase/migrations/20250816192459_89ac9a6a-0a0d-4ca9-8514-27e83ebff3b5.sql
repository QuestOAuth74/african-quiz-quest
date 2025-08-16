-- Drop the trigger and function with cascade to avoid dependency issues
DROP TRIGGER IF EXISTS update_wheel_sessions_updated_at ON public.wheel_game_sessions;
DROP FUNCTION IF EXISTS public.update_wheel_session_updated_at() CASCADE;

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_wheel_session_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_wheel_sessions_updated_at
BEFORE UPDATE ON public.wheel_game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_wheel_session_updated_at();