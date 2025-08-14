-- Simple fix: Just ensure the function works and create a way to make existing users admin
-- The user should be created via normal signup, then made admin

CREATE OR REPLACE FUNCTION public.make_user_admin_by_email(user_email text)
RETURNS text AS $$
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
  
  -- Make sure they have a profile entry
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (target_user_id, user_email, true)
  ON CONFLICT (user_id) DO UPDATE SET 
    is_admin = true,
    email = user_email;
    
  RETURN 'User ' || user_email || ' has been made an admin successfully.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make quemile@gmail.com admin if they exist
SELECT public.make_user_admin_by_email('quemile@gmail.com');