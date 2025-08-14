-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users if not already enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admins can view admin users'
  ) THEN
    CREATE POLICY "Admins can view admin users" ON admin_users FOR SELECT USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Only existing admins can manage admin users'
  ) THEN
    CREATE POLICY "Only existing admins can manage admin users" ON admin_users FOR ALL USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- Insert the admin user (this will create the user in auth.users and add them to admin_users)
-- Since we can't directly insert into auth.users, we'll create a function to handle this
CREATE OR REPLACE FUNCTION create_admin_user(email TEXT, password TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- This function should be called by the application, not directly in SQL
  -- For now, we'll just return a placeholder UUID
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add user to admin after signup
CREATE OR REPLACE FUNCTION add_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Add them to admin_users table
    INSERT INTO admin_users (user_id) 
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;