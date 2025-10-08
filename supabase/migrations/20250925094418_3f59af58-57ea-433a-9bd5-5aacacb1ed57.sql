-- Fix RLS policies to allow participants to see each other
DROP POLICY IF EXISTS "participants_view_own" ON public.match_participants;

-- Allow participants to view all participants in the same match
CREATE POLICY "Participants can view all in same match"
ON public.match_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_participants mp 
    WHERE mp.match_id = match_participants.match_id 
    AND mp.user_id = auth.uid()
  )
);

-- Allow participants to view matches they're in
CREATE POLICY "Participants can view their matches"
ON public.matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.match_participants mp 
    WHERE mp.match_id = matches.id 
    AND mp.user_id = auth.uid()
  )
);

-- Enable realtime for better synchronization
ALTER TABLE public.match_participants REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;