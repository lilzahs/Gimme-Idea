-- Create users/profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (wallet_address = current_user_id());
  
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (TRUE);
  
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (wallet_address = current_user_id());

-- Add profile_id reference to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
