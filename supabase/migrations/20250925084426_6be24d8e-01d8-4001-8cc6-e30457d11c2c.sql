-- Create matches table for multiplayer games
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  creator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  time_limit INTEGER NOT NULL DEFAULT 10,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  current_country_code TEXT,
  question_start_time TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match participants table
CREATE TABLE public.match_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'eliminated')),
  score INTEGER NOT NULL DEFAULT 0,
  last_answer TEXT,
  answer_time TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Policies for matches
CREATE POLICY "Matches are viewable by participants" 
ON public.matches 
FOR SELECT 
USING (
  id IN (
    SELECT match_id FROM public.match_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Match creators can update their matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- Policies for match participants
CREATE POLICY "Participants are viewable by match participants" 
ON public.match_participants 
FOR SELECT 
USING (
  match_id IN (
    SELECT match_id FROM public.match_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join matches" 
ON public.match_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.match_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate room codes
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 4-character alphanumeric code
    code := upper(
      chr(ascii('A') + floor(random() * 26)::integer) ||
      chr(ascii('A') + floor(random() * 26)::integer) ||
      chr(ascii('0') + floor(random() * 10)::integer) ||
      chr(ascii('0') + floor(random() * 10)::integer)
    );
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_count 
    FROM public.matches 
    WHERE room_code = code AND status != 'finished';
    
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Enable realtime
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_participants;