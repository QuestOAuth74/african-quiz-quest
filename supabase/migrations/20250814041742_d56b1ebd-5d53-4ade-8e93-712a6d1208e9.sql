-- Clean up existing invalid user entries
DELETE FROM public.profiles WHERE email = 'quemile@gmail.com';

-- The user needs to be created through Supabase's auth signup process
-- This can be done by calling the make_user_admin_by_email function after signup
-- OR by using Supabase dashboard to create the user manually

-- For now, let's ensure the function works correctly
CREATE OR REPLACE FUNCTION public.make_user_admin_by_email(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User with email ' || user_email || ' not found. Please sign up first.';
  END IF;
  
  -- Make sure they have a profile entry and make them admin
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (target_user_id, user_email, true)
  ON CONFLICT (user_id) DO UPDATE SET 
    is_admin = true,
    email = user_email;
    
  RETURN 'User ' || user_email || ' has been made an admin successfully.';
END;
$$;