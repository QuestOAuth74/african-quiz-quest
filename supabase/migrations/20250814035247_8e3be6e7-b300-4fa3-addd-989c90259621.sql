-- Create admin user and set admin privileges
-- First, let's try to insert the user if they don't exist, but this requires auth.users manipulation which isn't recommended
-- Instead, let's create a function to handle this properly

-- Create a function to set a user as admin by email
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email TEXT, user_password TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Note: In production, users should sign up through the normal auth flow
  -- This is for initial admin setup only
  
  -- Check if user already exists in profiles
  SELECT profiles.user_id INTO user_id 
  FROM public.profiles 
  WHERE profiles.email = user_email;
  
  IF user_id IS NOT NULL THEN
    -- User exists, just make them admin
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE email = user_email;
    
    RETURN 'User ' || user_email || ' has been made an admin';
  ELSE
    -- User doesn't exist in profiles, they need to sign up first
    RETURN 'User ' || user_email || ' needs to sign up first through the normal auth flow';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Try to make the user admin if they exist
SELECT public.create_admin_user('quemile@gmail.com', '144245');