-- Add game_mode column to lobbies table
ALTER TABLE public.lobbies ADD COLUMN game_mode text NOT NULL DEFAULT 'flags';

-- Update existing lobbies to use flags mode
UPDATE public.lobbies SET game_mode = 'flags' WHERE game_mode IS NULL;