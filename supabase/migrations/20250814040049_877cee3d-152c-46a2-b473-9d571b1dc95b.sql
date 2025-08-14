-- Create admin user using Supabase's built-in functions
-- This approach works better than directly inserting into auth.users

-- First, let's ensure we have the is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set up the admin user after signup
CREATE OR REPLACE FUNCTION setup_admin_user()
RETURNS void AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'quemile@gmail.com';
  
  -- If user exists, make sure they're admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, email, is_admin)
    VALUES (admin_user_id, 'quemile@gmail.com', true)
    ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;