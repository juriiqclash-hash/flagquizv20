-- Add daily_streak and last_played_date to user_stats for tracking daily streaks
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS daily_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_played_date date;

-- Update RLS policies to allow public viewing of user stats (but not editing)
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;

CREATE POLICY "Anyone can view user stats"
ON public.user_stats
FOR SELECT
USING (true);

-- Add function to update daily streak
CREATE OR REPLACE FUNCTION public.update_daily_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_streak INTEGER;
  last_date DATE;
BEGIN
  -- Get current streak and last played date
  SELECT daily_streak, last_played_date INTO current_streak, last_date
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- If no record exists, initialize
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, daily_streak, last_played_date)
    VALUES (p_user_id, 1, CURRENT_DATE);
    RETURN;
  END IF;

  -- Check if user played today already
  IF last_date = CURRENT_DATE THEN
    -- Already played today, do nothing
    RETURN;
  END IF;

  -- Check if user played yesterday (continuing streak)
  IF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE public.user_stats
    SET daily_streak = current_streak + 1,
        last_played_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, restart
    UPDATE public.user_stats
    SET daily_streak = 1,
        last_played_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;