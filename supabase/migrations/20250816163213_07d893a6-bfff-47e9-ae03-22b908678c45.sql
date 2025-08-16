
-- 1) Backfill missing 'admin' roles for users marked as admin in profiles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::public.app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur
  ON ur.user_id = p.user_id AND ur.role = 'admin'::public.app_role
WHERE p.is_admin = true
  AND ur.user_id IS NULL;

-- 2) Keep user_roles in sync with profiles.is_admin going forward

-- Create or replace the sync function
CREATE OR REPLACE FUNCTION public.sync_user_roles_with_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If a user becomes admin, ensure they have the 'admin' role
  IF NEW.is_admin = true AND (OLD.is_admin IS DISTINCT FROM true) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- If a user is no longer admin, remove the 'admin' role
  IF NEW.is_admin = false AND (OLD.is_admin IS DISTINCT FROM false) THEN
    DELETE FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'admin'::public.app_role;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger (covers both insert and update of is_admin)
DROP TRIGGER IF EXISTS trg_sync_user_roles_with_profiles ON public.profiles;

CREATE TRIGGER trg_sync_user_roles_with_profiles
AFTER INSERT OR UPDATE OF is_admin ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.sync_user_roles_with_profiles();
