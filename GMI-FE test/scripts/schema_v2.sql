-- Add users profile table for user management
CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_address TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "profiles_select_all" ON user_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Add image_url column to posts if not exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_created ON user_profiles(created_at DESC);
