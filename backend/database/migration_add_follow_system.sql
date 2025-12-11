-- Migration: Add Follow/Follower System
-- Created: 2024-12-11
-- Description: Adds tables and functions for user follow system

-- ============================================
-- 1. FOLLOWS TABLE
-- ============================================
-- Stores follow relationships between users
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate follows
    UNIQUE(follower_id, following_id),
    
    -- Prevent self-follow
    CHECK (follower_id != following_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- ============================================
-- 2. ADD FOLLOWER/FOLLOWING COUNTS TO USERS
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to follow a user
CREATE OR REPLACE FUNCTION follow_user(
    p_follower_id UUID,
    p_following_id UUID
) RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_already_following BOOLEAN;
BEGIN
    -- Check if already following
    SELECT EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = p_follower_id AND following_id = p_following_id
    ) INTO v_already_following;
    
    IF v_already_following THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Already following this user'
        );
    END IF;
    
    -- Cannot follow yourself
    IF p_follower_id = p_following_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot follow yourself'
        );
    END IF;
    
    -- Insert follow relationship
    INSERT INTO follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id);
    
    -- Update follower count for the followed user
    UPDATE users 
    SET followers_count = followers_count + 1
    WHERE id = p_following_id;
    
    -- Update following count for the follower
    UPDATE users 
    SET following_count = following_count + 1
    WHERE id = p_follower_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Successfully followed user'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to unfollow a user
CREATE OR REPLACE FUNCTION unfollow_user(
    p_follower_id UUID,
    p_following_id UUID
) RETURNS JSON AS $$
DECLARE
    v_was_following BOOLEAN;
BEGIN
    -- Check if was following
    SELECT EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = p_follower_id AND following_id = p_following_id
    ) INTO v_was_following;
    
    IF NOT v_was_following THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Not following this user'
        );
    END IF;
    
    -- Delete follow relationship
    DELETE FROM follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    
    -- Update follower count for the unfollowed user
    UPDATE users 
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = p_following_id;
    
    -- Update following count for the unfollower
    UPDATE users 
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = p_follower_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Successfully unfollowed user'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(
    p_follower_id UUID,
    p_following_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM follows 
        WHERE follower_id = p_follower_id AND following_id = p_following_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get followers of a user with pagination
CREATE OR REPLACE FUNCTION get_followers(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar TEXT,
    bio TEXT,
    wallet TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    followed_at TIMESTAMP WITH TIME ZONE,
    is_following_back BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.avatar,
        u.bio,
        u.wallet,
        u.followers_count,
        u.following_count,
        f.created_at as followed_at,
        EXISTS(
            SELECT 1 FROM follows f2 
            WHERE f2.follower_id = p_user_id AND f2.following_id = u.id
        ) as is_following_back
    FROM follows f
    JOIN users u ON u.id = f.follower_id
    WHERE f.following_id = p_user_id
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get users that a user is following with pagination
CREATE OR REPLACE FUNCTION get_following(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar TEXT,
    bio TEXT,
    wallet TEXT,
    followers_count INTEGER,
    following_count INTEGER,
    followed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.avatar,
        u.bio,
        u.wallet,
        u.followers_count,
        u.following_count,
        f.created_at as followed_at
    FROM follows f
    JOIN users u ON u.id = f.following_id
    WHERE f.follower_id = p_user_id
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get mutual followers (users who follow each other)
CREATE OR REPLACE FUNCTION get_mutual_followers(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar TEXT,
    wallet TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.avatar,
        u.wallet
    FROM follows f1
    JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    JOIN users u ON u.id = f1.follower_id
    WHERE f1.following_id = p_user_id
    ORDER BY f1.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. RLS POLICIES
-- ============================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

-- Only authenticated users can follow/unfollow
CREATE POLICY "Authenticated users can follow" ON follows
    FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid()::text = follower_id::text);

-- ============================================
-- 5. REALTIME SUBSCRIPTION
-- ============================================
-- Enable realtime for follows table
ALTER PUBLICATION supabase_realtime ADD TABLE follows;

-- ============================================
-- 6. SYNC EXISTING COUNTS (run once)
-- ============================================
-- Update followers_count for all users
UPDATE users u SET followers_count = (
    SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id
);

-- Update following_count for all users
UPDATE users u SET following_count = (
    SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id
);

-- ============================================
-- DONE!
-- ============================================
