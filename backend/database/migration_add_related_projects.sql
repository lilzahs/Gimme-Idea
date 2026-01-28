-- Migration: Add Related Projects Detection Feature
-- This table stores AI-detected related projects from the internet for each idea

BEGIN;

-- =============================================
-- RELATED PROJECTS TABLE
-- Stores search results from Tavily API for idea submissions
-- =============================================
CREATE TABLE IF NOT EXISTS related_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Search result data from Tavily
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  source TEXT,  -- Domain/source name
  score DECIMAL(5, 4),  -- Relevance score from Tavily (0-1)
  
  -- User interaction
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  pinned_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  search_query TEXT,  -- The query used for this search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_related_projects_idea ON related_projects(idea_id);
CREATE INDEX idx_related_projects_pinned ON related_projects(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_related_projects_created ON related_projects(created_at DESC);

-- =============================================
-- IDEA SEARCH QUOTA TABLE
-- Tracks daily search usage per user (5 ideas per day limit)
-- =============================================
CREATE TABLE IF NOT EXISTS idea_search_quota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_date DATE NOT NULL DEFAULT CURRENT_DATE,
  searches_used INTEGER DEFAULT 0,
  max_searches INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, search_date)
);

CREATE INDEX idx_idea_search_quota_user_date ON idea_search_quota(user_id, search_date);

-- =============================================
-- USER-PINNED PROJECTS TABLE
-- Allows users to pin their own projects to an idea
-- =============================================
CREATE TABLE IF NOT EXISTS user_pinned_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- User's own project info
  project_title TEXT NOT NULL,
  project_url TEXT NOT NULL,
  project_description TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user can only pin one project per idea
  UNIQUE(idea_id, pinned_by)
);

CREATE INDEX idx_user_pinned_projects_idea ON user_pinned_projects(idea_id);
CREATE INDEX idx_user_pinned_projects_user ON user_pinned_projects(pinned_by);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user can search (within daily quota)
CREATE OR REPLACE FUNCTION can_user_search_projects(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_quota RECORD;
  v_can_search BOOLEAN;
  v_remaining INTEGER;
BEGIN
  -- Get or create today's quota record
  INSERT INTO idea_search_quota (user_id, search_date, searches_used)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, search_date) DO NOTHING;
  
  -- Fetch the quota
  SELECT * INTO v_quota
  FROM idea_search_quota
  WHERE user_id = p_user_id AND search_date = CURRENT_DATE;
  
  v_remaining := v_quota.max_searches - v_quota.searches_used;
  v_can_search := v_remaining > 0;
  
  RETURN json_build_object(
    'canSearch', v_can_search,
    'remaining', v_remaining,
    'used', v_quota.searches_used,
    'max', v_quota.max_searches
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment search usage
CREATE OR REPLACE FUNCTION increment_search_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE idea_search_quota
  SET 
    searches_used = searches_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND search_date = CURRENT_DATE
    AND searches_used < max_searches;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related projects for an idea
CREATE OR REPLACE FUNCTION get_related_projects(p_idea_id UUID)
RETURNS JSON AS $$
DECLARE
  v_ai_results JSON;
  v_user_pinned JSON;
BEGIN
  -- Get AI-detected related projects
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', rp.id,
      'title', rp.title,
      'url', rp.url,
      'snippet', rp.snippet,
      'source', rp.source,
      'score', rp.score,
      'isPinned', rp.is_pinned,
      'pinnedBy', rp.pinned_by,
      'createdAt', rp.created_at
    ) ORDER BY rp.score DESC NULLS LAST
  ), '[]'::json) INTO v_ai_results
  FROM related_projects rp
  WHERE rp.idea_id = p_idea_id;
  
  -- Get user-pinned projects
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', upp.id,
      'title', upp.project_title,
      'url', upp.project_url,
      'description', upp.project_description,
      'pinnedBy', upp.pinned_by,
      'createdAt', upp.created_at,
      'user', json_build_object(
        'username', u.username,
        'avatar', u.avatar
      )
    ) ORDER BY upp.created_at DESC
  ), '[]'::json) INTO v_user_pinned
  FROM user_pinned_projects upp
  JOIN users u ON u.id = upp.pinned_by
  WHERE upp.idea_id = p_idea_id;
  
  RETURN json_build_object(
    'aiDetected', v_ai_results,
    'userPinned', v_user_pinned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE related_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_search_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pinned_projects ENABLE ROW LEVEL SECURITY;

-- Related Projects: Anyone can read, only system can insert/update
CREATE POLICY "Related projects are viewable by everyone" 
  ON related_projects FOR SELECT USING (true);

-- Idea Search Quota: Users can only see their own quota
CREATE POLICY "Users can view their own quota" 
  ON idea_search_quota FOR SELECT USING (auth.uid() = user_id);

-- User Pinned Projects: Anyone can read, users can manage their own
CREATE POLICY "User pinned projects are viewable by everyone" 
  ON user_pinned_projects FOR SELECT USING (true);
CREATE POLICY "Users can pin their own projects" 
  ON user_pinned_projects FOR INSERT WITH CHECK (auth.uid() = pinned_by);
CREATE POLICY "Users can remove their own pins" 
  ON user_pinned_projects FOR DELETE USING (auth.uid() = pinned_by);

COMMIT;

-- =============================================
-- NOTES:
-- - Run this migration in Supabase SQL Editor
-- - The TAVILY_API_KEY must be set in backend .env
-- - Default quota is 5 searches per day per user
-- =============================================
