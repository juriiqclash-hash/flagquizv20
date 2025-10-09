-- Add profile customization columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_flag TEXT,
ADD COLUMN IF NOT EXISTS selected_continent TEXT,
ADD COLUMN IF NOT EXISTS selected_clan TEXT;

-- Policy already exists for profile updates, no need to recreate