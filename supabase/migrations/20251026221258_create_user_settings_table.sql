/*
  # Create user_settings table for app preferences

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `server_region` (text) - Preferred server region (europe, north_america, asia, oceania, south_america)
      - `animations_enabled` (boolean) - Global animations toggle
      - `image_quality` (text) - Image quality setting (low, medium, high, ultra)
      - `notifications_enabled` (boolean) - Browser notifications enabled
      - `fullscreen_mode` (boolean) - Fullscreen mode preference
      - `blur_enabled` (boolean) - Background blur enabled
      - `blur_intensity` (integer) - Blur intensity in pixels (0-20)
      - `profile_visibility` (text) - Profile visibility ('public' or 'private')
      - `statistics_public` (boolean) - Whether statistics are publicly visible
      - `analytics_enabled` (boolean) - Whether usage data collection is enabled
      - `fps_display_enabled` (boolean) - Whether FPS display is enabled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policy for users to read their own settings
    - Add policy for users to insert their own settings
    - Add policy for users to update their own settings
    - Add policy for users to delete their own settings

  3. Indexes
    - Create index on user_id for fast lookups
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  server_region text DEFAULT 'auto',
  animations_enabled boolean DEFAULT true,
  image_quality text DEFAULT 'high',
  notifications_enabled boolean DEFAULT false,
  fullscreen_mode boolean DEFAULT false,
  blur_enabled boolean DEFAULT true,
  blur_intensity integer DEFAULT 10,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  statistics_public boolean DEFAULT true,
  analytics_enabled boolean DEFAULT true,
  fps_display_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create unique index on user_id (one settings row per user)
CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- RLS Policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_user_settings_updated_at_trigger ON user_settings;
CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();