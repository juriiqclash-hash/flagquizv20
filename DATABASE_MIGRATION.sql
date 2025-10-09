-- WICHTIG: Führe diese SQL-Befehle in der Supabase SQL Editor aus
-- Gehe zu: Cloud Tab > SQL Editor > New Query

-- 1. Füge die neuen Spalten zur profiles Tabelle hinzu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_flag TEXT,
ADD COLUMN IF NOT EXISTS selected_continent TEXT,
ADD COLUMN IF NOT EXISTS selected_clan TEXT;

-- 2. Erlaube Benutzern, ihre eigenen Profil-Anpassungen zu aktualisieren
DROP POLICY IF EXISTS "Users can update their own profile customizations" ON public.profiles;

CREATE POLICY "Users can update their own profile customizations"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fertig! Die Profilanpassungen werden jetzt in der Datenbank gespeichert.
