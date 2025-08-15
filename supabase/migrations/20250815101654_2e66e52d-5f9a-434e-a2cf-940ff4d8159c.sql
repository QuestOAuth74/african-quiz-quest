-- Update get_single_player_stats function to include both 'single' and 'quiz' game modes
CREATE OR REPLACE FUNCTION public.get_single_player_stats()
RETURNS TABLE(user_id uuid, display_name text, total_points_vs_computer integer, best_category_name text, best_category_points integer, total_games_vs_computer integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN p.display_name IS NOT NULL AND p.display_name != '' THEN p.display_name
      ELSE 'Player' || LPAD((ABS(('x' || SUBSTR(MD5(p.user_id::text), 1, 8))::bit(32)::int) % 10000)::text, 4, '0')
    END as display_name,
    COALESCE(SUM(ug.final_score), 0)::integer as total_points_vs_computer,
    best_cat.category_name as best_category_name,
    COALESCE(best_cat.max_points, 0)::integer as best_category_points,
    COUNT(ug.id)::integer as total_games_vs_computer
  FROM profiles p
  LEFT JOIN user_games ug ON p.user_id = ug.user_id AND ug.game_mode IN ('single', 'quiz')
  LEFT JOIN LATERAL (
    SELECT 
      unnest(ug2.categories_played) as category_name,
      MAX(ug2.final_score) as max_points
    FROM user_games ug2 
    WHERE ug2.user_id = p.user_id AND ug2.game_mode IN ('single', 'quiz')
    GROUP BY unnest(ug2.categories_played)
    ORDER BY max_points DESC
    LIMIT 1
  ) best_cat ON true
  WHERE p.is_admin = false
  GROUP BY p.user_id, p.display_name, best_cat.category_name, best_cat.max_points
  ORDER BY total_points_vs_computer DESC;
END;
$function$;