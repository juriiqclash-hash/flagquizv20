-- Add banned column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;

-- Add banned_at column to track when user was banned
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Add banned_by column to track who banned the user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Add ban_reason column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban_reason TEXT;