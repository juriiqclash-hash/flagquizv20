/*
  # Account Deactivation Feature

  1. Änderungen an profiles Tabelle
    - Neue Spalten für Konto-Deaktivierung:
      - `is_deactivated` (boolean) - Ob das Konto deaktiviert ist
      - `deactivated_at` (timestamptz) - Zeitpunkt der Deaktivierung

  2. Indexes
    - Index für schnelle Abfragen nach deaktivierten Konten

  3. Wichtige Hinweise
    - Standardwert für is_deactivated ist false
    - deactivated_at ist nullable und wird nur bei Deaktivierung gesetzt
    - Bestehende RLS-Policies bleiben unverändert
*/

-- Add deactivation columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_deactivated'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_deactivated boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'deactivated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deactivated_at timestamptz;
  END IF;
END $$;

-- Create index for deactivated accounts for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_deactivated ON profiles(is_deactivated) WHERE is_deactivated = true;

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.is_deactivated IS 'Indicates whether the user account has been deactivated';
COMMENT ON COLUMN profiles.deactivated_at IS 'Timestamp when the account was deactivated';
