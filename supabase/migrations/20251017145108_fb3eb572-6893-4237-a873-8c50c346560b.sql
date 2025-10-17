-- Add clan role enum
DO $$ BEGIN
  CREATE TYPE clan_role AS ENUM ('leader', 'vice_leader', 'elite_member', 'moderator', 'member', 'newbie');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Alter clan_members table to use enum instead of text
ALTER TABLE clan_members 
  DROP COLUMN IF EXISTS role CASCADE;

ALTER TABLE clan_members 
  ADD COLUMN role clan_role NOT NULL DEFAULT 'newbie'::clan_role;

-- Update existing owner roles
UPDATE clan_members cm
SET role = 'leader'::clan_role
FROM clans c
WHERE cm.clan_id = c.id 
  AND cm.user_id = c.created_by;