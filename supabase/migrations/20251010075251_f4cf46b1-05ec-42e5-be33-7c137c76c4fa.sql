-- Create clans table for custom user-created clans
CREATE TABLE public.clans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

-- Everyone can view clans
CREATE POLICY "Clans are viewable by everyone"
ON public.clans
FOR SELECT
USING (true);

-- Authenticated users can create clans
CREATE POLICY "Authenticated users can create clans"
ON public.clans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clans;