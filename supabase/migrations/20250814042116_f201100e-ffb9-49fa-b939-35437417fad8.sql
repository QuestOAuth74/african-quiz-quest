-- Create the admin user directly in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  new_email,
  new_email_change_sent_at,
  invited_at,
  action_link,
  email_change,
  email_change_token,
  email_change_token_current,
  email_change_token_new,
  confirmation_token,
  recovery_token,
  phone_change_token,
  phone_change,
  phone_change_sent_at,
  confirmed_at,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change_token_status,
  email_change_token_status,
  confirmation_token_status,
  recovery_token_status,
  phone_change_token_current,
  phone_change_token_new
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'quemile@gmail.com',
  crypt('144245', gen_salt('bf')),
  now(),
  now(),
  NULL,
  NULL,
  '',
  NULL,
  NULL,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  NULL,
  now(),
  0,
  NULL,
  '',
  NULL,
  false,
  NULL,
  false,
  '{}',
  '{}',
  now(),
  now(),
  NULL,
  NULL,
  0,
  0,
  0,
  0,
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Now make them an admin
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'quemile@gmail.com';
  
  -- Create their profile and make them admin
  INSERT INTO public.profiles (user_id, email, is_admin)
  VALUES (target_user_id, 'quemile@gmail.com', true)
  ON CONFLICT (user_id) DO UPDATE SET 
    is_admin = true,
    email = 'quemile@gmail.com';
END $$;