-- Script to set ijuriqu's duel wins to 389
-- Run this after the database tables are created and ijuriqu user exists

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find ijuriqu's user_id
  SELECT user_id INTO target_user_id
  FROM profiles
  WHERE username = 'ijuriqu'
  LIMIT 1;

  -- If user exists, update their multiplayer wins
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_stats (user_id, multiplayer_wins)
    VALUES (target_user_id, 389)
    ON CONFLICT (user_id)
    DO UPDATE SET
      multiplayer_wins = 389,
      updated_at = now();

    RAISE NOTICE 'Successfully set multiplayer_wins to 389 for ijuriqu';
  ELSE
    RAISE NOTICE 'User ijuriqu not found';
  END IF;
END $$;
