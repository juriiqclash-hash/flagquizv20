-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Participants can view all in same match" ON public.match_participants;
DROP POLICY IF EXISTS "Participants can view their matches" ON public.matches;

-- Create a simpler policy that allows participants to view all participants in matches they joined
CREATE POLICY "Participants can view match participants"
ON public.match_participants
FOR SELECT
USING (
  match_id IN (
    SELECT DISTINCT mp.match_id 
    FROM public.match_participants mp 
    WHERE mp.user_id = auth.uid()
  )
);

-- Allow participants to view matches they joined
CREATE POLICY "Users can view matches they joined"
ON public.matches
FOR SELECT
USING (
  id IN (
    SELECT DISTINCT mp.match_id 
    FROM public.match_participants mp 
    WHERE mp.user_id = auth.uid()
  )
);