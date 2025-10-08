-- Add columns for continent quiz mode
ALTER TABLE lobbies 
ADD COLUMN IF NOT EXISTS selected_continent TEXT,
ADD COLUMN IF NOT EXISTS selected_game_mode TEXT DEFAULT 'flags';