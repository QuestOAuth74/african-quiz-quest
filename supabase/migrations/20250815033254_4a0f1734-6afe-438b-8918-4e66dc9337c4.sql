-- Fix RLS policies to allow regular users to play games

-- Drop the restrictive admin-only SELECT policy for categories
DROP POLICY IF EXISTS "Admin can view categories" ON public.categories;

-- Create new policy allowing all authenticated users to view categories
CREATE POLICY "All authenticated users can view categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ensure the existing "All authenticated users can view questions" policy exists and works
-- (This should already exist but let's make sure it's correct)
DROP POLICY IF EXISTS "All authenticated users can view questions" ON public.questions;
CREATE POLICY "All authenticated users can view questions" 
ON public.questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update question_options to allow all authenticated users to view them
-- This is needed for quiz functionality
DROP POLICY IF EXISTS "All authenticated users can view question options" ON public.question_options;
CREATE POLICY "All authenticated users can view question options" 
ON public.question_options 
FOR SELECT 
USING (auth.uid() IS NOT NULL);