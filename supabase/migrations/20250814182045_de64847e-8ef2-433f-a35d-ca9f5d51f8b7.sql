-- Fix the user creation process to handle duplicates properly

-- First, let's update the handle_new_user_role function to use ON CONFLICT
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert user role with ON CONFLICT to prevent duplicates
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Also update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert profile with ON CONFLICT to prevent duplicates
  INSERT INTO public.profiles (user_id, email, is_admin, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NEW.raw_user_meta_data ->> 'display_name'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Make sure we have the proper triggers set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Create the triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Clean up any existing duplicate entries
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.id > b.id AND a.user_id = b.user_id AND a.role = b.role;