-- Create the is_admin function that the login code expects
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = $1
  );
END;
$$;

-- Add the user to admin_users table
INSERT INTO public.admin_users (user_id) 
VALUES ('68ea2ded-d217-4c7f-8b08-27c48f264fdb')
ON CONFLICT (user_id) DO NOTHING;