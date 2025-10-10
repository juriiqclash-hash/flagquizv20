/*
  # Komplettes Clans System

  ## Neue Tabellen
  1. `clans` Tabelle:
    - `id` - UUID primary key
    - `name` - Name des Clans (unique)
    - `emoji` - Emoji für den Clan
    - `description` - Beschreibung (optional)
    - `image_url` - Bild-URL (optional)
    - `created_by` - Ersteller des Clans
    - `created_at` - Erstellungsdatum
    
  2. `clan_members` Tabelle:
    - `id` - UUID primary key
    - `clan_id` - Referenz zu clans
    - `user_id` - Referenz zu profiles
    - `role` - Rolle (member, admin, owner)
    - `joined_at` - Beitrittsdatum
    
  ## Security
    - RLS aktiviert für beide Tabellen
    - Jeder kann Clans und Mitgliedschaften sehen
    - Authentifizierte Nutzer können Clans erstellen
    - Automatisches Hinzufügen des Erstellers als Owner
*/

-- Erstelle clans Tabelle
CREATE TABLE IF NOT EXISTS public.clans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name)
);

-- Enable RLS auf clans
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

-- Policies für clans
CREATE POLICY "Clans are viewable by everyone"
ON public.clans
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create clans"
ON public.clans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Clan creators can update their clans"
ON public.clans
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Clan creators can delete their clans"
ON public.clans
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Erstelle clan_members Tabelle
CREATE TABLE IF NOT EXISTS public.clan_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clan_id, user_id)
);

-- Enable RLS auf clan_members
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

-- Policies für clan_members
CREATE POLICY "Clan members are viewable by everyone"
ON public.clan_members
FOR SELECT
USING (true);

CREATE POLICY "Users can join clans"
ON public.clan_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clan owners can remove members"
ON public.clan_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clan_members cm
    WHERE cm.clan_id = clan_members.clan_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'owner'
  )
);

CREATE POLICY "Users can leave clans"
ON public.clan_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Funktion zum Zählen von Clan-Mitgliedern
CREATE OR REPLACE FUNCTION public.get_clan_member_count(clan_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.clan_members
  WHERE clan_id = clan_uuid;
$$;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON public.clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON public.clan_members(user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_members;

-- Trigger um Clan-Ersteller automatisch als Owner hinzuzufügen
CREATE OR REPLACE FUNCTION public.add_clan_creator_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.clan_members (clan_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_clan_created ON public.clans;
CREATE TRIGGER on_clan_created
  AFTER INSERT ON public.clans
  FOR EACH ROW
  EXECUTE FUNCTION public.add_clan_creator_as_owner();
