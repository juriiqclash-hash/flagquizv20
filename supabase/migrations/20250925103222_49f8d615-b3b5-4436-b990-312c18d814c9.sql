-- Simplify matches table for new game mode
ALTER TABLE public.matches 
DROP COLUMN IF EXISTS game_mode,
DROP COLUMN IF EXISTS target_score,
DROP COLUMN IF EXISTS player1_score,
DROP COLUMN IF EXISTS player2_score;

-- Add lives system to match_participants
ALTER TABLE public.match_participants 
ADD COLUMN IF NOT EXISTS lives integer NOT NULL DEFAULT 3;

-- Update existing participants to have 3 lives
UPDATE public.match_participants SET lives = 3 WHERE lives IS NULL;