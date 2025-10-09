/*
  # Friends and Clans System

  ## Overview
  Creates comprehensive social features including friend requests, friendships, and clan management.

  ## 1. New Tables
  
  ### `friend_requests`
  - `id` (uuid, primary key) - Unique identifier for each friend request
  - `sender_id` (uuid) - User who sent the friend request
  - `receiver_id` (uuid) - User who received the friend request
  - `status` (text) - Request status: 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz) - When the request was sent
  - `updated_at` (timestamptz) - When the request status was last updated
  
  ### `friends`
  - `id` (uuid, primary key) - Unique identifier for the friendship
  - `user_id_1` (uuid) - First user in the friendship
  - `user_id_2` (uuid) - Second user in the friendship
  - `created_at` (timestamptz) - When the friendship was established
  
  ### `clans`
  - `id` (uuid, primary key) - Unique identifier for the clan
  - `name` (text) - Clan name
  - `description` (text) - Clan description
  - `profile_image_url` (text) - URL to clan profile image
  - `owner_id` (uuid) - User who created and owns the clan
  - `created_at` (timestamptz) - When the clan was created
  - `updated_at` (timestamptz) - When the clan was last updated
  
  ### `clan_members`
  - `id` (uuid, primary key) - Unique identifier for clan membership
  - `clan_id` (uuid) - Reference to the clan
  - `user_id` (uuid) - Reference to the user
  - `joined_at` (timestamptz) - When the user joined the clan
  - `role` (text) - Member role: 'owner', 'admin', 'member'

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their friend requests
  - Add policies for authenticated users to view their friends
  - Add policies for clan creation and management
  - Add policies for clan members to view clan information

  ## 3. Important Notes
  - Friend requests can only be sent once between two users
  - Maximum 30 members per clan
  - Clan owners have special privileges
  - All tables have proper foreign key constraints
*/

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CHECK (user_id_1 < user_id_2),
  UNIQUE(user_id_1, user_id_2)
);

-- Create clans table
CREATE TABLE IF NOT EXISTS clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  profile_image_url text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clan_members table
CREATE TABLE IF NOT EXISTS clan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  UNIQUE(clan_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friends_user1 ON friends(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friends_user2 ON friends(user_id_2);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user ON clan_members(user_id);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;

-- Friend Requests Policies
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own sent requests"
  ON friend_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Friends Policies
CREATE POLICY "Users can view their friendships"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "System can create friendships"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete their friendships"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Clans Policies
CREATE POLICY "Anyone can view clans"
  ON clans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create clans"
  ON clans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clan owners can update their clans"
  ON clans FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clan owners can delete their clans"
  ON clans FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Clan Members Policies
CREATE POLICY "Anyone can view clan members"
  ON clan_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join clans"
  ON clan_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clans or owners can remove members"
  ON clan_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM clans
      WHERE clans.id = clan_id AND clans.owner_id = auth.uid()
    )
  );

-- Function to automatically create friendship when request is accepted
CREATE OR REPLACE FUNCTION handle_friend_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO friends (user_id_1, user_id_2)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER friend_request_accepted_trigger
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request_accepted();

-- Function to automatically add owner as clan member
CREATE OR REPLACE FUNCTION add_owner_to_clan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO clan_members (clan_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_owner_to_clan_trigger
  AFTER INSERT ON clans
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_clan();

-- Function to check clan member limit
CREATE OR REPLACE FUNCTION check_clan_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM clan_members
  WHERE clan_id = NEW.clan_id;
  
  IF member_count >= 30 THEN
    RAISE EXCEPTION 'Clan has reached maximum member limit of 30';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_clan_member_limit_trigger
  BEFORE INSERT ON clan_members
  FOR EACH ROW
  EXECUTE FUNCTION check_clan_member_limit();