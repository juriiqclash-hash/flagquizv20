-- Create helper function to check if current user is in a given lobby
CREATE OR REPLACE FUNCTION public.user_is_in_lobby(lobby_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.match_participants mp
    WHERE mp.lobby_id = lobby_id_param AND mp.user_id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Replace broken lobbies SELECT policy and add an auth-visible waiting view
DROP POLICY IF EXISTS "Lobbies are viewable by participants" ON public.lobbies;

-- Allow authenticated users to see waiting lobbies to be able to join by room code
CREATE POLICY "Waiting lobbies viewable to authenticated"
ON public.lobbies
FOR SELECT
USING (status = 'waiting' AND auth.uid() IS NOT NULL);

-- Allow owners and participants to view their lobby
CREATE POLICY "Owners or participants can view lobbies"
ON public.lobbies
FOR SELECT
USING ((auth.uid() = owner_id) OR public.user_is_in_lobby(id));

-- Ensure participants can view all participants in the same lobby
CREATE POLICY "Participants can view all in same lobby"
ON public.match_participants
FOR SELECT
USING (public.user_is_in_lobby(lobby_id));