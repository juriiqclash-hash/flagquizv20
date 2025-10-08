-- Create lobbies table for better multiplayer synchronization
CREATE TABLE public.lobbies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  room_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'started', 'finished')),
  round_start_timestamp bigint,
  time_limit integer NOT NULL DEFAULT 10,
  current_question_index integer NOT NULL DEFAULT 0,
  current_country_code text,
  winner_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;

-- Create policies for lobbies
CREATE POLICY "Lobbies are viewable by participants" 
ON public.lobbies 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM public.match_participants 
      WHERE match_id = id AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Owners can create lobbies" 
ON public.lobbies 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their lobbies" 
ON public.lobbies 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Enable realtime
ALTER TABLE public.lobbies REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;

-- Update match_participants to reference lobbies instead of matches
-- We'll keep the same table but change the foreign key logic
-- Add lobby_id column to match_participants
ALTER TABLE public.match_participants ADD COLUMN lobby_id uuid;

-- Create trigger for automatic timestamp updates on lobbies
CREATE TRIGGER update_lobbies_updated_at
BEFORE UPDATE ON public.lobbies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();