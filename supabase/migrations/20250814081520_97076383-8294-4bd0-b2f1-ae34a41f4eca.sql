-- Add display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT;

-- Update RLS policies to allow users to update their display_name
-- The existing policies should already cover this, but let's make sure

-- Update the handle_new_user function to set display_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_admin, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$function$;