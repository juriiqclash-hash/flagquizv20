-- Create clan_messages table for clan chat
CREATE TABLE IF NOT EXISTS public.clan_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clan_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clan members can view clan messages"
  ON public.clan_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clan_members
      WHERE clan_members.clan_id = clan_messages.clan_id
      AND clan_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Clan members can send messages"
  ON public.clan_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.clan_members
      WHERE clan_members.clan_id = clan_messages.clan_id
      AND clan_members.user_id = auth.uid()
    )
  );

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_messages;

-- Create friend_messages table for friend chat
CREATE TABLE IF NOT EXISTS public.friend_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  friendship_id UUID NOT NULL,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friend_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for friend messages
CREATE POLICY "Friends can view messages"
  ON public.friend_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.friend_requests
      WHERE friend_requests.id::text = friend_messages.friendship_id::text
      AND friend_requests.status = 'accepted'
      AND (friend_requests.sender_id = auth.uid() OR friend_requests.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Friends can send messages"
  ON public.friend_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.friend_requests
      WHERE friend_requests.id::text = friend_messages.friendship_id::text
      AND friend_requests.status = 'accepted'
      AND (friend_requests.sender_id = auth.uid() OR friend_requests.receiver_id = auth.uid())
    )
  );

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_messages;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clan_messages_clan_id ON public.clan_messages(clan_id, created_at);
CREATE INDEX IF NOT EXISTS idx_friend_messages_friendship_id ON public.friend_messages(friendship_id, created_at);