-- First, let's clean up duplicates by keeping only the best score for each user-gamemode combination
WITH ranked_scores AS (
  SELECT id,
         user_id, 
         game_mode, 
         score,
         created_at,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, game_mode 
           ORDER BY 
             CASE 
               WHEN game_mode = 'timed' THEN score -- For timed, we want lowest (best time)
               ELSE -score -- For others, we want highest
             END,
             created_at DESC
         ) as rn
  FROM public.leaderboards
)
DELETE FROM public.leaderboards 
WHERE id IN (
  SELECT id FROM ranked_scores WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE public.leaderboards 
ADD CONSTRAINT unique_user_game_mode UNIQUE (user_id, game_mode);

-- Create function to handle upsert scores (update if better, insert if new)
CREATE OR REPLACE FUNCTION public.upsert_leaderboard_score(
  p_user_id UUID,
  p_game_mode TEXT,
  p_score INTEGER,
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
  existing_score INTEGER;
  should_update BOOLEAN := FALSE;
BEGIN
  -- Get existing score for this user and game mode
  SELECT score INTO existing_score 
  FROM public.leaderboards 
  WHERE user_id = p_user_id AND game_mode = p_game_mode;
  
  -- Determine if we should update based on game mode
  IF existing_score IS NULL THEN
    -- No existing score, insert new
    should_update := TRUE;
  ELSIF p_game_mode = 'timed' THEN
    -- For timed mode, lower score is better (time in seconds)
    should_update := p_score < existing_score;
  ELSE
    -- For other modes, higher score is better
    should_update := p_score > existing_score;
  END IF;
  
  IF should_update THEN
    -- Use INSERT ... ON CONFLICT to upsert
    INSERT INTO public.leaderboards (user_id, game_mode, score, details)
    VALUES (p_user_id, p_game_mode, p_score, p_details)
    ON CONFLICT (user_id, game_mode) 
    DO UPDATE SET 
      score = EXCLUDED.score,
      details = EXCLUDED.details,
      created_at = now();
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;