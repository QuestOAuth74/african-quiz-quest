-- Fix the function search path mutable warning by setting immutable search_path
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_stats_record RECORD;
  badge_record RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats_record 
  FROM public.user_stats 
  WHERE user_id = p_user_id;
  
  -- If no stats record exists, exit
  IF user_stats_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Check each badge criteria and award if met
  FOR badge_record IN 
    SELECT * FROM public.badges
  LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = p_user_id AND badge_id = badge_record.id
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check criteria and award badge
    CASE badge_record.criteria_type
      WHEN 'games_played' THEN
        IF user_stats_record.total_games_played >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) 
          VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'points_earned' THEN
        IF user_stats_record.total_points_earned >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) 
          VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'correct_streak' THEN
        IF user_stats_record.longest_correct_streak >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) 
          VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'questions_correct' THEN
        IF user_stats_record.total_questions_correct >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) 
          VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'best_score' THEN
        IF user_stats_record.best_game_score >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) 
          VALUES (p_user_id, badge_record.id);
        END IF;
    END CASE;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_check_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;