-- Fix search path for functions that don't have it set
ALTER FUNCTION public.update_user_stats_after_game() SET search_path TO 'public';
ALTER FUNCTION public.update_post_upvote_count() SET search_path TO 'public';