-- Security Fix 1: Prevent users from updating their own is_admin field
-- Drop existing update policy and recreate with restriction
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policy that prevents users from updating is_admin field
CREATE POLICY "Users can update their own profile (except admin status)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent users from changing their own admin status
  (OLD.is_admin = NEW.is_admin OR has_role(auth.uid(), 'admin'::app_role))
);

-- Security Fix 2: Update database functions to be more secure with search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND is_admin = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE email = user_email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, is_admin, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_stats_after_game()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Insert or update user stats
    INSERT INTO public.user_stats (
        user_id, 
        total_games_played, 
        total_questions_answered, 
        total_questions_correct, 
        total_points_earned,
        best_game_score,
        updated_at
    )
    VALUES (
        NEW.user_id,
        1,
        NEW.questions_answered,
        NEW.questions_correct,
        NEW.final_score,
        NEW.final_score,
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_games_played = user_stats.total_games_played + 1,
        total_questions_answered = user_stats.total_questions_answered + NEW.questions_answered,
        total_questions_correct = user_stats.total_questions_correct + NEW.questions_correct,
        total_points_earned = user_stats.total_points_earned + NEW.final_score,
        best_game_score = GREATEST(user_stats.best_game_score, NEW.final_score),
        updated_at = now();
        
    RETURN NEW;
END;
$function$;

-- Security Fix 3: Add policy to restrict who can make users admin
CREATE POLICY "Only existing admins can make users admin" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Allow admin status changes only by existing admins
  (OLD.is_admin = NEW.is_admin) OR 
  (NEW.is_admin = true AND has_role(auth.uid(), 'admin'::app_role))
);

-- Security Fix 4: Add triggers for user role creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- Create trigger for automatic user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();