-- Delete all questions and related data in correct order to avoid foreign key constraints

-- 1. Delete question ratings
DELETE FROM public.question_ratings;

-- 2. Delete user question attempts
DELETE FROM public.user_question_attempts;

-- 3. Delete game room questions
DELETE FROM public.game_room_questions;

-- 4. Delete question options
DELETE FROM public.question_options;

-- 5. Delete questions
DELETE FROM public.questions;

-- Reset any auto-increment sequences if needed (though we use UUIDs)
-- This ensures clean slate for new questions