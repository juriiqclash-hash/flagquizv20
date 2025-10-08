-- Create user_stats table for tracking XP, levels, and statistics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  best_streak INTEGER NOT NULL DEFAULT 0,
  time_mode_best_score INTEGER NOT NULL DEFAULT 0,
  multiplayer_wins INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
CREATE POLICY "Users can view their own stats"
ON public.user_stats
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert their own stats"
ON public.user_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update their own stats"
ON public.user_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to calculate level from XP (100 XP per level, max level 100)
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN LEAST(FLOOR(xp_amount / 100.0) + 1, 100);
END;
$$;

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION public.add_xp(p_user_id UUID, p_xp_gained INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, xp, level, total_correct_answers)
  VALUES (p_user_id, p_xp_gained, calculate_level(p_xp_gained), p_xp_gained)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    xp = user_stats.xp + p_xp_gained,
    total_correct_answers = user_stats.total_correct_answers + p_xp_gained,
    level = calculate_level(user_stats.xp + p_xp_gained),
    updated_at = now();
END;
$$;

-- Function to update best streak
CREATE OR REPLACE FUNCTION public.update_best_streak(p_user_id UUID, p_streak INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, best_streak)
  VALUES (p_user_id, p_streak)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    best_streak = GREATEST(user_stats.best_streak, p_streak),
    updated_at = now();
END;
$$;

-- Function to update time mode score
CREATE OR REPLACE FUNCTION public.update_time_mode_score(p_user_id UUID, p_score INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, time_mode_best_score)
  VALUES (p_user_id, p_score)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    time_mode_best_score = GREATEST(user_stats.time_mode_best_score, p_score),
    updated_at = now();
END;
$$;

-- Function to increment multiplayer wins
CREATE OR REPLACE FUNCTION public.increment_multiplayer_wins(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, multiplayer_wins)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    multiplayer_wins = user_stats.multiplayer_wins + 1,
    updated_at = now();
END;
$$;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();