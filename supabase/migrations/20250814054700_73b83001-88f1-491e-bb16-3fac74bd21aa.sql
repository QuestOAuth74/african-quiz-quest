-- Create table to track user question attempts
CREATE TABLE public.user_question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answered_correctly BOOLEAN NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_question_attempts
CREATE POLICY "Users can view their own attempts"
ON public.user_question_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON public.user_question_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all attempts for analytics
CREATE POLICY "Admins can view all attempts"
ON public.user_question_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for better performance on common queries
CREATE INDEX idx_user_question_attempts_user_id ON public.user_question_attempts(user_id);
CREATE INDEX idx_user_question_attempts_question_id ON public.user_question_attempts(question_id);
CREATE INDEX idx_user_question_attempts_user_question ON public.user_question_attempts(user_id, question_id);