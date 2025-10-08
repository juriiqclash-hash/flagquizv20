-- Enable realtime for lobbies table if not already enabled
ALTER TABLE lobbies REPLICA IDENTITY FULL;

-- Ensure lobbies are in realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'lobbies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE lobbies;
  END IF;
END $$;