-- Create the admin user directly in the auth.users table and profiles table
-- First, create the user in auth.users (this is a special case for initial admin setup)

-- Insert user into auth.users table (this is normally handled by Supabase auth, but for initial admin we'll do it manually)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'quemile@gmail.com',
  crypt('144245', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Now get the user ID and create the profile with admin privileges
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'quemile@gmail.com'
)
INSERT INTO public.profiles (user_id, email, is_admin)
SELECT id, 'quemile@gmail.com', true
FROM user_data
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;