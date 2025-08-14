-- Create missing triggers for user stats and badge checking
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON public.user_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_after_game();

CREATE TRIGGER check_badges_trigger
  AFTER INSERT OR UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_badges();

-- Manually calculate and insert user stats for the admin user who has already played games
DO $$
DECLARE
  admin_user_id UUID := 'dc92cd2e-d24c-4a5a-a124-707eb8a81a24';
  total_attempts INTEGER;
  total_correct INTEGER;
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
  temp_streak INTEGER := 0;
  attempt_record RECORD;
BEGIN
  -- Get total attempts and correct answers
  SELECT 
    COUNT(*) as attempts,
    COUNT(*) FILTER (WHERE answered_correctly = true) as correct
  INTO total_attempts, total_correct
  FROM public.user_question_attempts 
  WHERE user_id = admin_user_id;

  -- Calculate streaks by going through attempts chronologically
  FOR attempt_record IN 
    SELECT answered_correctly 
    FROM public.user_question_attempts 
    WHERE user_id = admin_user_id 
    ORDER BY attempted_at ASC
  LOOP
    IF attempt_record.answered_correctly THEN
      temp_streak := temp_streak + 1;
      longest_streak := GREATEST(longest_streak, temp_streak);
    ELSE
      temp_streak := 0;
    END IF;
  END LOOP;

  -- Set current streak (check last few answers)
  SELECT COUNT(*) INTO current_streak
  FROM (
    SELECT answered_correctly 
    FROM public.user_question_attempts 
    WHERE user_id = admin_user_id 
    ORDER BY attempted_at DESC 
    LIMIT 20
  ) recent_attempts
  WHERE answered_correctly = true;

  -- Insert or update user stats
  INSERT INTO public.user_stats (
    user_id,
    total_games_played,
    total_questions_answered,
    total_questions_correct,
    total_points_earned,
    best_game_score,
    current_correct_streak,
    longest_correct_streak,
    created_at,
    updated_at
  )
  VALUES (
    admin_user_id,
    COALESCE((SELECT COUNT(*) FROM public.user_games WHERE user_id = admin_user_id), 0),
    total_attempts,
    total_correct,
    total_correct * 10, -- Assuming 10 points per correct answer
    total_correct * 10,
    current_streak,
    longest_streak,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_questions_answered = EXCLUDED.total_questions_answered,
    total_questions_correct = EXCLUDED.total_questions_correct,
    total_points_earned = EXCLUDED.total_points_earned,
    best_game_score = EXCLUDED.best_game_score,
    current_correct_streak = EXCLUDED.current_correct_streak,
    longest_correct_streak = EXCLUDED.longest_correct_streak,
    updated_at = now();

  -- Check and award badges for this user
  PERFORM public.check_and_award_badges(admin_user_id);
END $$;