-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN lower(trim(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'))) 
         || '-' || EXTRACT(epoch FROM now())::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_reading_time(content JSONB)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Extract text content from JSONB and count words
  word_count := array_length(string_to_array(regexp_replace(content::text, '[^a-zA-Z\s]', ' ', 'g'), ' '), 1);
  -- Average reading speed: 200 words per minute
  reading_time := GREATEST(1, CEIL(word_count / 200.0));
  RETURN reading_time;
END;
$$;