/*
  # Freundschaftssystem

  1. Neue Tabellen
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, Referenz zu auth.users)
      - `receiver_id` (uuid, Referenz zu auth.users)
      - `status` (text, 'pending', 'accepted', 'declined')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `friendships`
      - `id` (uuid, primary key)
      - `user_id_1` (uuid, Referenz zu auth.users)
      - `user_id_2` (uuid, Referenz zu auth.users)
      - `created_at` (timestamptz)

  2. Sicherheit
    - Enable RLS auf allen Tabellen
    - Policies für Lesen und Schreiben von Freundschaftsanfragen
    - Policies für Freundeslisten
*/

-- Freundschaftsanfragen Tabelle
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined')),
  CONSTRAINT different_users CHECK (sender_id != receiver_id),
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Freundschaften Tabelle
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (user_id_1 != user_id_2),
  CONSTRAINT ordered_users CHECK (user_id_1 < user_id_2),
  CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2)
);

-- Indices für bessere Performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user_id_2);

-- RLS aktivieren
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policies für friend_requests
CREATE POLICY "Benutzer können ihre eigenen Anfragen sehen"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Benutzer können Freundschaftsanfragen senden"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Empfänger können Anfragen aktualisieren"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Sender können eigene Anfragen löschen"
  ON friend_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Policies für friendships
CREATE POLICY "Benutzer können ihre Freundschaften sehen"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "System kann Freundschaften erstellen"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Benutzer können Freundschaften beenden"
  ON friendships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Funktion zum automatischen Erstellen von Freundschaften bei akzeptierten Anfragen
CREATE OR REPLACE FUNCTION create_friendship_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO friendships (user_id_1, user_id_2)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user_id_1, user_id_2) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für automatische Freundschaftserstellung
DROP TRIGGER IF EXISTS on_friend_request_accepted ON friend_requests;
CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_friendship_on_accept();

-- Funktion zum Löschen von Freundschaftsanfragen bei Freundschaftsbeendigung
CREATE OR REPLACE FUNCTION cleanup_friend_requests_on_unfriend()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM friend_requests
  WHERE (sender_id = OLD.user_id_1 AND receiver_id = OLD.user_id_2)
     OR (sender_id = OLD.user_id_2 AND receiver_id = OLD.user_id_1);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger für Aufräumen von Anfragen
DROP TRIGGER IF EXISTS on_friendship_deleted ON friendships;
CREATE TRIGGER on_friendship_deleted
  BEFORE DELETE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_friend_requests_on_unfriend();
