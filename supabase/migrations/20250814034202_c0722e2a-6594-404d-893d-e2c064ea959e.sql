-- Update the user's password to ensure it's set correctly
-- First, let's check if we can update the auth.users table directly
UPDATE auth.users 
SET encrypted_password = crypt('144245', gen_salt('bf'))
WHERE email = 'quemile@gmail.com';