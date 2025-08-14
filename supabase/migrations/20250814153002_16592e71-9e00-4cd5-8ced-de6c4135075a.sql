-- Allow authenticated users to read questions and options for quiz
CREATE POLICY "Authenticated users can view questions for quiz" 
ON public.questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view question options for quiz" 
ON public.question_options 
FOR SELECT 
USING (auth.uid() IS NOT NULL);