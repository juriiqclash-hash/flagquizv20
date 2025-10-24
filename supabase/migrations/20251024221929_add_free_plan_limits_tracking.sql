/*
  # Free Plan Limitierungen

  1. Neue Spalten in profiles
    - `country_changes_this_month` (integer) - Z\u00e4hlt die Land-\u00c4nderungen im aktuellen Monat
    - `last_country_change` (timestamp) - Zeitpunkt der letzten Land-\u00c4nderung
    - `username_changes_this_month` (integer) - Z\u00e4hlt die Benutzername-\u00c4nderungen im aktuellen Monat
    - `last_username_change` (timestamp) - Zeitpunkt der letzten Benutzername-\u00c4nderung

  2. Sicherheit
    - RLS Policies werden beibehalten
    - Diese Felder werden automatisch verwaltet
*/

-- Erstelle profiles Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  selected_flag TEXT,
  selected_continent TEXT,
  selected_clan TEXT
);

-- F\u00fcge neue Spalten hinzu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country_changes_this_month'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN country_changes_this_month integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_country_change'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_country_change timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username_changes_this_month'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username_changes_this_month integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_username_change'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_username_change timestamptz;
  END IF;
END $$;

-- Aktiviere RLS falls noch nicht aktiv
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;