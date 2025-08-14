-- Create question ratings table
CREATE TABLE public.question_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Enable RLS for question_ratings
ALTER TABLE public.question_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for question_ratings
CREATE POLICY "Users can view all ratings" 
ON public.question_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own ratings" 
ON public.question_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.question_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.question_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add average rating and is_flagged columns to questions table
ALTER TABLE public.questions 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN total_ratings INTEGER DEFAULT 0,
ADD COLUMN is_flagged BOOLEAN DEFAULT false,
ADD COLUMN flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN reviewed_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create function to update question rating statistics
CREATE OR REPLACE FUNCTION public.update_question_rating_stats(question_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
  should_flag BOOLEAN := false;
BEGIN
  -- Calculate average rating and count
  SELECT 
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, rating_count
  FROM public.question_ratings 
  WHERE question_id = question_uuid;
  
  -- Determine if question should be flagged (average < 2.0 and at least 3 ratings)
  IF avg_rating IS NOT NULL AND avg_rating < 2.0 AND rating_count >= 3 THEN
    should_flag := true;
  END IF;
  
  -- Update question with new statistics
  UPDATE public.questions 
  SET 
    average_rating = avg_rating,
    total_ratings = rating_count,
    is_flagged = CASE 
      WHEN should_flag AND NOT is_flagged THEN true
      WHEN avg_rating >= 2.0 THEN false
      ELSE is_flagged
    END,
    flagged_at = CASE 
      WHEN should_flag AND NOT is_flagged THEN now()
      WHEN avg_rating >= 2.0 THEN NULL
      ELSE flagged_at
    END
  WHERE id = question_uuid;
END;
$$;

-- Create trigger to update rating stats when ratings change
CREATE OR REPLACE FUNCTION public.trigger_update_question_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update for the affected question
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_question_rating_stats(OLD.question_id);
    RETURN OLD;
  ELSE
    PERFORM public.update_question_rating_stats(NEW.question_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for rating changes
CREATE TRIGGER update_question_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.question_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_question_rating_stats();

-- Create trigger for updated_at on ratings
CREATE TRIGGER update_question_ratings_updated_at
  BEFORE UPDATE ON public.question_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for question_ratings
ALTER TABLE public.question_ratings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_ratings;