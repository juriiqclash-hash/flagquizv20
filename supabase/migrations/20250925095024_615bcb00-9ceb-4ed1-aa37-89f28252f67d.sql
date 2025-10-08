-- Remove recursive policies
DROP POLICY IF EXISTS "Participants can view match participants" ON public.match_participants;
DROP POLICY IF EXISTS "Users can view matches they joined" ON public.matches;

-- Use SECURITY DEFINER helper functions to avoid recursion
CREATE POLICY "Participants can view all in same match"
ON public.match_participants
FOR SELECT
USING (public.user_is_in_match(match_id));

CREATE POLICY "Participants can view their matches"
ON public.matches
FOR SELECT
USING (public.user_is_match_participant(id));
