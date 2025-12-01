-- Add map_enabled column to lobbies table for continent mode map display
ALTER TABLE lobbies ADD COLUMN map_enabled boolean DEFAULT false;