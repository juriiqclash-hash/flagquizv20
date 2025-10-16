-- Create clan_invitations table for inviting friends to clans
CREATE TABLE IF NOT EXISTS public.clan_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lobby_invitations table for inviting friends to multiplayer lobbies
CREATE TABLE IF NOT EXISTS public.lobby_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clan_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for clan_invitations
CREATE POLICY "Users can view invitations they sent or received"
ON public.clan_invitations FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send clan invitations"
ON public.clan_invitations FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update invitations"
ON public.clan_invitations FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Senders can delete pending invitations"
ON public.clan_invitations FOR DELETE
USING (auth.uid() = sender_id AND status = 'pending');

-- RLS policies for lobby_invitations
CREATE POLICY "Users can view lobby invitations they sent or received"
ON public.lobby_invitations FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send lobby invitations"
ON public.lobby_invitations FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update lobby invitations"
ON public.lobby_invitations FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Senders can delete pending invitations"
ON public.lobby_invitations FOR DELETE
USING (auth.uid() = sender_id AND status = 'pending');

-- Enable realtime for invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_invitations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_invitations;

-- Add replica identity for realtime updates
ALTER TABLE public.clan_invitations REPLICA IDENTITY FULL;
ALTER TABLE public.lobby_invitations REPLICA IDENTITY FULL;