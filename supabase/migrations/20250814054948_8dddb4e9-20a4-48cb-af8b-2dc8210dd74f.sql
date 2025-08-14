-- Create user_stats table to track comprehensive user performance
CREATE TABLE public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    total_games_played INTEGER NOT NULL DEFAULT 0,
    total_questions_answered INTEGER NOT NULL DEFAULT 0,
    total_questions_correct INTEGER NOT NULL DEFAULT 0,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    best_game_score INTEGER NOT NULL DEFAULT 0,
    current_correct_streak INTEGER NOT NULL DEFAULT 0,
    longest_correct_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_games table to track individual game sessions
CREATE TABLE public.user_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    game_mode TEXT NOT NULL CHECK (game_mode IN ('single', 'multiplayer')),
    final_score INTEGER NOT NULL DEFAULT 0,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    categories_played TEXT[] NOT NULL DEFAULT '{}',
    game_duration_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_stats
CREATE POLICY "Users can view all user stats for leaderboard"
ON public.user_stats
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for user_games
CREATE POLICY "Users can view their own games"
ON public.user_games
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
ON public.user_games
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all games for analytics
CREATE POLICY "Admins can view all games"
ON public.user_games
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update user stats after a game
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger to automatically update stats when a game is completed
CREATE TRIGGER update_stats_after_game
    AFTER INSERT ON public.user_games
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_stats_after_game();

-- Create function to update correct answer streak
CREATE OR REPLACE FUNCTION public.update_user_correct_streak(
    p_user_id UUID,
    p_is_correct BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_is_correct THEN
        -- Increment current streak
        UPDATE public.user_stats 
        SET 
            current_correct_streak = current_correct_streak + 1,
            longest_correct_streak = GREATEST(longest_correct_streak, current_correct_streak + 1),
            updated_at = now()
        WHERE user_id = p_user_id;
        
        -- Create stats record if it doesn't exist
        INSERT INTO public.user_stats (user_id, current_correct_streak, longest_correct_streak)
        VALUES (p_user_id, 1, 1)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        -- Reset current streak
        UPDATE public.user_stats 
        SET 
            current_correct_streak = 0,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_stats_total_points ON public.user_stats(total_points_earned DESC);
CREATE INDEX idx_user_stats_best_score ON public.user_stats(best_game_score DESC);
CREATE INDEX idx_user_games_user_id ON public.user_games(user_id);
CREATE INDEX idx_user_games_completed_at ON public.user_games(completed_at DESC);