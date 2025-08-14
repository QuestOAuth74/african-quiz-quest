-- Drop existing admin-only policies and create new ones for quiz access
DROP POLICY IF EXISTS "Admin can view questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can view question_options" ON public.question_options;

-- Allow all authenticated users to read questions for quiz functionality
CREATE POLICY "All authenticated users can view questions" 
ON public.questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "All authenticated users can view question options" 
ON public.question_options 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep admin policies for modification
CREATE POLICY "Admins can manage questions" 
ON public.questions 
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage question options" 
ON public.question_options 
FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true));