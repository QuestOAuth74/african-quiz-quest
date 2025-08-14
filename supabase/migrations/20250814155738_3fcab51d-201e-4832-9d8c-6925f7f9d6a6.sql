-- Enable realtime for questions table
ALTER TABLE public.questions REPLICA IDENTITY FULL;

-- Add questions table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;

-- Enable realtime for question_options table
ALTER TABLE public.question_options REPLICA IDENTITY FULL;

-- Add question_options table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_options;