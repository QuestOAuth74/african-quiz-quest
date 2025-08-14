-- Create badges table for different achievements
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- lucide icon name
  color TEXT NOT NULL, -- color theme for badge
  criteria_type TEXT NOT NULL, -- 'games_played', 'points_earned', 'correct_streak', 'questions_correct', 'best_score'
  criteria_value INTEGER NOT NULL, -- threshold value to earn badge
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges (everyone can view, only admins can manage)
CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage badges" 
ON public.badges 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_badges
CREATE POLICY "Anyone can view user badges" 
ON public.user_badges 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Trigger to check badges after stats update
CREATE OR REPLACE FUNCTION public.trigger_check_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_badges_after_stats_change
  AFTER INSERT OR UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_badges();

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, color, criteria_type, criteria_value) VALUES
('First Steps', 'Played your first game', 'Play', 'green', 'games_played', 1),
('Getting Started', 'Played 5 games', 'Target', 'blue', 'games_played', 5),
('Dedicated Player', 'Played 25 games', 'Trophy', 'purple', 'games_played', 25),
('Game Master', 'Played 100 games', 'Crown', 'gold', 'games_played', 100),

('Point Collector', 'Earned 1,000 total points', 'Coins', 'yellow', 'points_earned', 1000),
('Point Master', 'Earned 10,000 total points', 'Gem', 'orange', 'points_earned', 10000),
('Point Legend', 'Earned 50,000 total points', 'Diamond', 'purple', 'points_earned', 50000),

('Quick Learner', 'Got 5 questions correct in a row', 'Zap', 'blue', 'correct_streak', 5),
('Streak Master', 'Got 10 questions correct in a row', 'Flame', 'orange', 'correct_streak', 10),
('Unstoppable', 'Got 20 questions correct in a row', 'Star', 'gold', 'correct_streak', 20),

('Knowledge Seeker', 'Answered 100 questions correctly', 'Book', 'green', 'questions_correct', 100),
('Scholar', 'Answered 500 questions correctly', 'GraduationCap', 'blue', 'questions_correct', 500),
('Historian', 'Answered 1,000 questions correctly', 'Scroll', 'purple', 'questions_correct', 1000),

('High Scorer', 'Scored 500+ points in a single game', 'Award', 'orange', 'best_score', 500),
('Champion', 'Scored 1,000+ points in a single game', 'Medal', 'gold', 'best_score', 1000),
('Legend', 'Scored 1,500+ points in a single game', 'Crown', 'rainbow', 'best_score', 1500);