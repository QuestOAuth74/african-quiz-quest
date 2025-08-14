-- Drop and recreate the is_admin function without default parameter to fix the conflict
DROP FUNCTION IF EXISTS is_admin(uuid);

CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the admin user by first inserting into auth.users manually (for initial setup only)
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users (this is an exception for initial admin setup)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'quemile@gmail.com',
    crypt('144245', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('144245', gen_salt('bf')),
    email_confirmed_at = NOW();

  -- Get the user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'quemile@gmail.com';

  -- Insert into profiles with admin privileges
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (admin_user_id, 'quemile@gmail.com', true)
  ON CONFLICT (user_id) DO UPDATE SET 
    is_admin = true,
    email = 'quemile@gmail.com';
END $$;