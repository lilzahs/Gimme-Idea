-- Migration: Add Email Authentication Support
-- Run this SQL in Supabase SQL Editor
-- Purpose: Allow users to login via Google OAuth while preserving wallet-based data

-- =============================================
-- ADD EMAIL AUTH COLUMNS TO USERS TABLE
-- =============================================

-- Add email column (nullable to support existing wallet-only users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Add auth provider column (wallet or google)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'wallet' CHECK (auth_provider IN ('wallet', 'google'));

-- Add Supabase auth ID for linking with Supabase Auth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_id TEXT UNIQUE;

-- Add flag to track if user needs to connect wallet
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS needs_wallet_connect BOOLEAN DEFAULT false;

-- =============================================
-- CREATE INDEXES FOR FAST LOOKUPS
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- =============================================
-- UPDATE RLS POLICIES
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Recreate policies with support for both wallet and email auth
CREATE POLICY "Users are viewable by everyone" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (
    -- Allow update if user matches auth_id from Supabase Auth
    auth.uid()::text = auth_id 
    OR 
    -- Or if no auth_id set yet (legacy wallet users)
    auth_id IS NULL
  );

CREATE POLICY "Users can insert their own profile" ON users 
  FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCTION: Find or Create User by Email
-- Used when user logs in with Google OAuth
-- =============================================

CREATE OR REPLACE FUNCTION find_or_create_user_by_email(
  p_email TEXT,
  p_auth_id TEXT,
  p_username TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  is_new_user BOOLEAN,
  needs_wallet BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_is_new BOOLEAN := false;
  v_needs_wallet BOOLEAN := false;
  v_username TEXT;
BEGIN
  -- First, check if user exists by auth_id
  SELECT id, needs_wallet_connect INTO v_user_id, v_needs_wallet
  FROM users 
  WHERE auth_id = p_auth_id;
  
  IF v_user_id IS NOT NULL THEN
    -- User already exists with this auth_id
    RETURN QUERY SELECT v_user_id, false, v_needs_wallet;
    RETURN;
  END IF;
  
  -- Check if user exists by email
  SELECT id, needs_wallet_connect INTO v_user_id, v_needs_wallet
  FROM users 
  WHERE email = p_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Link auth_id to existing email user
    UPDATE users 
    SET auth_id = p_auth_id, 
        auth_provider = 'google',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN QUERY SELECT v_user_id, false, v_needs_wallet;
    RETURN;
  END IF;
  
  -- New user - create account
  v_is_new := true;
  v_needs_wallet := true;
  
  -- Generate username from email or use provided
  v_username := COALESCE(p_username, split_part(p_email, '@', 1) || '_' || substr(md5(random()::text), 1, 4));
  
  INSERT INTO users (
    wallet,
    username,
    email,
    auth_id,
    auth_provider,
    needs_wallet_connect,
    avatar,
    created_at,
    updated_at
  ) VALUES (
    '', -- Empty wallet, will be set when user connects
    v_username,
    p_email,
    p_auth_id,
    'google',
    true,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || v_username,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  RETURN QUERY SELECT v_user_id, v_is_new, v_needs_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Link Wallet to User
-- Called when user connects wallet after email login
-- =============================================

CREATE OR REPLACE FUNCTION link_wallet_to_user(
  p_user_id UUID,
  p_wallet_address TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  merged_from_wallet BOOLEAN
) AS $$
DECLARE
  v_existing_wallet_user_id UUID;
  v_current_wallet TEXT;
BEGIN
  -- Get current user's wallet
  SELECT wallet INTO v_current_wallet FROM users WHERE id = p_user_id;
  
  -- If user already has a wallet, just update it
  IF v_current_wallet IS NOT NULL AND v_current_wallet != '' THEN
    UPDATE users 
    SET wallet = p_wallet_address,
        needs_wallet_connect = false,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT true, 'Wallet updated successfully', false;
    RETURN;
  END IF;
  
  -- Check if this wallet belongs to another user (migration case)
  SELECT id INTO v_existing_wallet_user_id 
  FROM users 
  WHERE wallet = p_wallet_address AND id != p_user_id;
  
  IF v_existing_wallet_user_id IS NOT NULL THEN
    -- Wallet already exists - merge data from old wallet user to new email user
    
    -- Transfer projects
    UPDATE projects 
    SET author_id = p_user_id 
    WHERE author_id = v_existing_wallet_user_id;
    
    -- Transfer comments (non-anonymous ones)
    UPDATE comments 
    SET user_id = p_user_id 
    WHERE user_id = v_existing_wallet_user_id AND is_anonymous = false;
    
    -- Transfer transactions
    UPDATE transactions 
    SET user_id = p_user_id 
    WHERE user_id = v_existing_wallet_user_id;
    
    -- Transfer votes (skip if already exists to avoid duplicate)
    UPDATE project_votes 
    SET user_id = p_user_id 
    WHERE user_id = v_existing_wallet_user_id
      AND NOT EXISTS (
        SELECT 1 FROM project_votes pv2 
        WHERE pv2.project_id = project_votes.project_id 
          AND pv2.user_id = p_user_id
      );
    
    -- Delete remaining duplicate votes from old user
    DELETE FROM project_votes WHERE user_id = v_existing_wallet_user_id;
    
    -- Transfer comment likes (skip if already exists)
    UPDATE comment_likes 
    SET user_id = p_user_id 
    WHERE user_id = v_existing_wallet_user_id
      AND NOT EXISTS (
        SELECT 1 FROM comment_likes cl2 
        WHERE cl2.comment_id = comment_likes.comment_id 
          AND cl2.user_id = p_user_id
      );
    
    -- Delete remaining duplicate likes from old user
    DELETE FROM comment_likes WHERE user_id = v_existing_wallet_user_id;
    
    -- Copy reputation and balance
    UPDATE users u
    SET 
      reputation_score = u.reputation_score + COALESCE(old.reputation_score, 0),
      balance = u.balance + COALESCE(old.balance, 0)
    FROM users old
    WHERE u.id = p_user_id AND old.id = v_existing_wallet_user_id;
    
    -- Delete old wallet-only user
    DELETE FROM users WHERE id = v_existing_wallet_user_id;
    
    -- Now link wallet to current user
    UPDATE users 
    SET wallet = p_wallet_address,
        needs_wallet_connect = false,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT true, 'Wallet linked and data merged from existing wallet account', true;
    RETURN;
  END IF;
  
  -- No existing wallet user, just link the wallet
  UPDATE users 
  SET wallet = p_wallet_address,
      needs_wallet_connect = false,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT true, 'Wallet linked successfully', false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================
-- This migration adds email authentication support while preserving all existing
-- wallet-based data. The key features are:
-- 
-- 1. Users can now login with Google OAuth
-- 2. First-time email users are prompted to connect a wallet
-- 3. If the wallet they connect already has data, that data is merged to their email account
-- 4. Users can change their wallet at any time in their profile
-- 5. The latest wallet is always used for receiving tips
