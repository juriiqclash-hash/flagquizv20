-- Add column for equipped/displayed badges (comma-separated badge IDs)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_badges text[] DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN public.profiles.equipped_badges IS 'Array of badge IDs that are currently equipped/displayed on profile';