-- Make quemile@gmail.com an admin if they exist in auth.users
SELECT public.make_user_admin_by_email('quemile@gmail.com');