-- Add game mode and scoring to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'elimination',
ADD COLUMN IF NOT EXISTS target_score INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS player1_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_score INTEGER DEFAULT 0;