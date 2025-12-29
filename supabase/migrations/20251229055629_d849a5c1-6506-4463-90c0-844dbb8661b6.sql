-- Add mission and resistance columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS resistance TEXT;

-- Create the unified briefing function (1 DB call for all user context)
CREATE OR REPLACE FUNCTION public.get_user_full_briefing(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'name', COALESCE(p.display_name, 'User'),
        'mission', p.mission,
        'resistance', p.resistance,
        'daily_step_goal', p.daily_step_goal,
        'daily_calorie_goal', p.daily_calorie_goal,
        'weight_kg', p.weight_kg,
        'height_cm', p.height_cm
      )
      FROM profiles p WHERE p.user_id = p_user_id
    ),
    'recent_workouts', (
      SELECT COALESCE(jsonb_agg(workout_data), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'date', hs.started_at,
          'duration_minutes', ROUND(hs.duration_seconds / 60.0),
          'steps', hs.steps,
          'distance_km', hs.distance_km,
          'avg_pace', hs.avg_pace
        ) as workout_data
        FROM hotstepper_sessions hs 
        WHERE hs.user_id = p_user_id AND hs.ended_at IS NOT NULL
        ORDER BY hs.started_at DESC 
        LIMIT 3
      ) sub
    ),
    'today_nutrition', (
      SELECT jsonb_build_object(
        'total_calories', COALESCE(SUM(ml.calories), 0),
        'total_protein', COALESCE(SUM(ml.protein), 0),
        'total_carbs', COALESCE(SUM(ml.carbs), 0),
        'total_fats', COALESCE(SUM(ml.fats), 0),
        'meals_logged', COUNT(*)
      )
      FROM meal_logs ml 
      WHERE ml.user_id = p_user_id AND DATE(ml.created_at) = CURRENT_DATE
    ),
    'recent_journal', (
      SELECT COALESCE(jsonb_agg(journal_data), '[]'::jsonb)
      FROM (
        SELECT jsonb_build_object(
          'date', je.created_at,
          'mood', je.mood,
          'title', je.title,
          'reflection', LEFT(je.content, 200)
        ) as journal_data
        FROM journal_entries je 
        WHERE je.user_id = p_user_id
        ORDER BY je.created_at DESC 
        LIMIT 2
      ) sub
    ),
    'today_steps', (
      SELECT jsonb_build_object(
        'steps', COALESCE(ds.steps, 0),
        'goal', (SELECT daily_step_goal FROM profiles WHERE user_id = p_user_id),
        'active_minutes', COALESCE(ds.active_minutes, 0),
        'calories_burned', COALESCE(ds.calories, 0),
        'distance_km', COALESCE(ds.distance_km, 0)
      )
      FROM hotstepper_daily_steps ds 
      WHERE ds.user_id = p_user_id AND ds.date = CURRENT_DATE
    ),
    'streak', (
      SELECT jsonb_build_object(
        'current_streak', COALESCE(hs.current_streak, 0),
        'longest_streak', COALESCE(hs.longest_streak, 0),
        'total_days_completed', COALESCE(hs.total_days_completed, 0)
      )
      FROM hotstepper_streaks hs
      WHERE hs.user_id = p_user_id
    ),
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;