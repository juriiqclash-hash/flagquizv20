-- Create lobby_messages table for lobby chat
CREATE TABLE public.lobby_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in lobbies they're in
CREATE POLICY "Users can view messages in their lobby"
  ON public.lobby_messages
  FOR SELECT
  USING (
    user_is_in_lobby(lobby_id)
  );

-- Policy: Users can send messages to lobbies they're in
CREATE POLICY "Users can send messages to their lobby"
  ON public.lobby_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND user_is_in_lobby(lobby_id)
  );

-- Create index for faster queries
CREATE INDEX idx_lobby_messages_lobby_id ON public.lobby_messages(lobby_id);
CREATE INDEX idx_lobby_messages_created_at ON public.lobby_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_messages;