-- Make match_id nullable since we're transitioning to lobby_id
ALTER TABLE public.match_participants ALTER COLUMN match_id DROP NOT NULL;

-- Set all existing match_id values to null since we're using lobby_id now
UPDATE public.match_participants SET match_id = NULL;