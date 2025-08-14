-- Make quemile@yahoo.com an admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'quemile@yahoo.com';