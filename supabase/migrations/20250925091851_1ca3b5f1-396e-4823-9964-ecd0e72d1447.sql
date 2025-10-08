-- Drop existing problematic policies and recreate them correctly

-- Drop all existing policies on match_participants
DROP POLICY IF EXISTS "Users can view participants in their matches" ON public.match_participants;
DROP POLICY IF EXISTS "Participants are viewable by match participants" ON public.match_participants;

-- Drop all existing policies on matches
DROP POLICY IF EXISTS "Creators can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Participants can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can view waiting matches" ON public.matches;
DROP POLICY IF EXISTS "Matches are viewable by participants" ON public.matches;

-- Create a simple security definer function to check match participation
CREATE OR REPLACE FUNCTION public.user_is_match_participant(match_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.match_participants 
    WHERE match_id = match_id_param AND user_id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Simple policies for matches
CREATE POLICY "match_creators_can_view"
ON public.matches
FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "match_waiting_public_view"
ON public.matches
FOR SELECT
USING (status = 'waiting' AND auth.uid() IS NOT NULL);

-- Simple policies for match_participants
CREATE POLICY "participants_view_own"
ON public.match_participants
FOR SELECT
USING (auth.uid() = user_id);

-- Add DELETE policy for leaving matches
CREATE POLICY "participants_delete_own"
ON public.match_participants
FOR DELETE
USING (auth.uid() = user_id);