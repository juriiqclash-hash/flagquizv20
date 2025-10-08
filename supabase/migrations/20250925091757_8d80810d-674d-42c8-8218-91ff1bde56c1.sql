-- Fix infinite recursion in match_participants policy and other RLS issues

-- 1) First drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Participants are viewable by match participants" ON public.match_participants;

-- 2) Create a security definer function to safely check if user is in a match
CREATE OR REPLACE FUNCTION public.user_is_in_match(match_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.match_participants 
    WHERE match_id = match_id_param AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3) Create new policy for match_participants using the function
CREATE POLICY "Users can view participants in their matches"
ON public.match_participants
FOR SELECT
USING (public.user_is_in_match(match_id));

-- 4) Drop old matches SELECT policy and create better ones
DROP POLICY IF EXISTS "Matches are viewable by participants" ON public.matches;

-- Allow creators to view their matches
CREATE POLICY "Creators can view their matches"
ON public.matches
FOR SELECT
USING (auth.uid() = creator_id);

-- Allow participants to view matches they're in
CREATE POLICY "Participants can view their matches"
ON public.matches
FOR SELECT
USING (public.user_is_in_match(id));

-- Allow authenticated users to view waiting matches (for joining)
CREATE POLICY "Authenticated users can view waiting matches"
ON public.matches
FOR SELECT
USING (status = 'waiting' AND auth.uid() IS NOT NULL);

-- 5) Add DELETE policy for match_participants (without IF NOT EXISTS)
CREATE POLICY "Users can delete their own participation"
ON public.match_participants
FOR DELETE
USING (auth.uid() = user_id);