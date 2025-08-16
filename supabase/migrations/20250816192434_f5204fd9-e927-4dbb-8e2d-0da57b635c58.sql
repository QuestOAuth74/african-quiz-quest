-- Fix security issues by adding search_path to the function
DROP FUNCTION IF EXISTS public.update_wheel_session_updated_at();

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