-- Add answer submission tracking for race mode
ALTER TABLE public.match_participants 
ADD COLUMN IF NOT EXISTS current_answer TEXT,
ADD COLUMN IF NOT EXISTS answer_submitted_at TIMESTAMP WITH TIME ZONE;