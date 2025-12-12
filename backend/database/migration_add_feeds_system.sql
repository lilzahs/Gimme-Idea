-- =============================================
-- GMIFEEDS SYSTEM MIGRATION
-- Features: User-created feeds, bookmarks, followers
-- =============================================

-- =============================================
-- FEEDS TABLE (User-created collections)
-- =============================================
CREATE TABLE IF NOT EXISTS feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- For staff picks
  feed_type VARCHAR(50) DEFAULT 'custom' CHECK (feed_type IN ('custom', 'trending', 'ai_top', 'hidden_gems', 'staff_picks')),
  
  -- Stats (denormalized for performance)
  items_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 0, -- Users who can add items (for collaborative feeds)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feeds_creator ON feeds(creator_id);
CREATE INDEX idx_feeds_public ON feeds(is_public) WHERE is_public = true;
CREATE INDEX idx_feeds_featured ON feeds(is_featured) WHERE is_featured = true;
CREATE INDEX idx_feeds_type ON feeds(feed_type);
CREATE INDEX idx_feeds_followers ON feeds(followers_count DESC);

-- =============================================
-- FEED ITEMS TABLE (Ideas/Projects in a feed)
-- =============================================
CREATE TABLE IF NOT EXISTS feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT, -- Optional note about why this idea was added
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feed_id, project_id) -- Prevent duplicate items in same feed
);

CREATE INDEX idx_feed_items_feed ON feed_items(feed_id);
CREATE INDEX idx_feed_items_project ON feed_items(project_id);
CREATE INDEX idx_feed_items_added_by ON feed_items(added_by);
CREATE INDEX idx_feed_items_created ON feed_items(created_at DESC);

-- =============================================
-- FEED FOLLOWERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feed_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feed_id, user_id)
);

CREATE INDEX idx_feed_followers_feed ON feed_followers(feed_id);
CREATE INDEX idx_feed_followers_user ON feed_followers(user_id);

-- =============================================
-- FEED MEMBERS TABLE (Collaborative feeds)
-- =============================================
CREATE TABLE IF NOT EXISTS feed_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feed_id, user_id)
);

CREATE INDEX idx_feed_members_feed ON feed_members(feed_id);
CREATE INDEX idx_feed_members_user ON feed_members(user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to increment feed items count
CREATE OR REPLACE FUNCTION increment_feed_items_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET items_count = items_count + 1, updated_at = NOW() WHERE id = NEW.feed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement feed items count
CREATE OR REPLACE FUNCTION decrement_feed_items_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET items_count = GREATEST(0, items_count - 1), updated_at = NOW() WHERE id = OLD.feed_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feed followers count
CREATE OR REPLACE FUNCTION increment_feed_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET followers_count = followers_count + 1 WHERE id = NEW.feed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement feed followers count
CREATE OR REPLACE FUNCTION decrement_feed_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.feed_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feed members count
CREATE OR REPLACE FUNCTION increment_feed_members_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET members_count = members_count + 1 WHERE id = NEW.feed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement feed members count
CREATE OR REPLACE FUNCTION decrement_feed_members_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET members_count = GREATEST(0, members_count - 1) WHERE id = OLD.feed_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER trigger_increment_feed_items
  AFTER INSERT ON feed_items
  FOR EACH ROW EXECUTE FUNCTION increment_feed_items_count();

CREATE TRIGGER trigger_decrement_feed_items
  AFTER DELETE ON feed_items
  FOR EACH ROW EXECUTE FUNCTION decrement_feed_items_count();

CREATE TRIGGER trigger_increment_feed_followers
  AFTER INSERT ON feed_followers
  FOR EACH ROW EXECUTE FUNCTION increment_feed_followers_count();

CREATE TRIGGER trigger_decrement_feed_followers
  AFTER DELETE ON feed_followers
  FOR EACH ROW EXECUTE FUNCTION decrement_feed_followers_count();

CREATE TRIGGER trigger_increment_feed_members
  AFTER INSERT ON feed_members
  FOR EACH ROW EXECUTE FUNCTION increment_feed_members_count();

CREATE TRIGGER trigger_decrement_feed_members
  AFTER DELETE ON feed_members
  FOR EACH ROW EXECUTE FUNCTION decrement_feed_members_count();

-- Auto-update timestamp trigger
CREATE TRIGGER update_feeds_updated_at 
  BEFORE UPDATE ON feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_members ENABLE ROW LEVEL SECURITY;

-- Feeds policies
CREATE POLICY "Public feeds are viewable by everyone" ON feeds
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own private feeds" ON feeds
  FOR SELECT USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can create feeds" ON feeds
  FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can update their feeds" ON feeds
  FOR UPDATE USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can delete their feeds" ON feeds
  FOR DELETE USING (auth.uid()::text = creator_id::text);

-- Feed items policies
CREATE POLICY "Feed items are viewable if feed is public" ON feed_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM feeds WHERE id = feed_id AND is_public = true)
  );

CREATE POLICY "Members can add items to feeds" ON feed_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_members 
      WHERE feed_id = feed_items.feed_id 
      AND user_id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM feeds 
      WHERE id = feed_items.feed_id 
      AND creator_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Item adders or feed owners can delete items" ON feed_items
  FOR DELETE USING (
    auth.uid()::text = added_by::text
    OR EXISTS (
      SELECT 1 FROM feeds 
      WHERE id = feed_id 
      AND creator_id::text = auth.uid()::text
    )
  );

-- Feed followers policies
CREATE POLICY "Anyone can see followers of public feeds" ON feed_followers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM feeds WHERE id = feed_id AND is_public = true)
  );

CREATE POLICY "Users can follow feeds" ON feed_followers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can unfollow feeds" ON feed_followers
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Feed members policies
CREATE POLICY "Members are viewable" ON feed_members
  FOR SELECT USING (true);

CREATE POLICY "Feed owners can add members" ON feed_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM feeds 
      WHERE id = feed_members.feed_id 
      AND creator_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Feed owners can remove members" ON feed_members
  FOR DELETE USING (
    auth.uid()::text = user_id::text
    OR EXISTS (
      SELECT 1 FROM feeds 
      WHERE id = feed_id 
      AND creator_id::text = auth.uid()::text
    )
  );

-- Service role bypass
CREATE POLICY "Service role full access feeds" ON feeds FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access feed_items" ON feed_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access feed_followers" ON feed_followers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access feed_members" ON feed_members FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SEED SYSTEM FEEDS (Optional)
-- =============================================

-- Insert system feeds (run after users table has at least one admin user)
-- These will be managed by the system
/*
INSERT INTO feeds (id, creator_id, name, description, is_public, is_featured, feed_type) VALUES
  ('00000000-0000-0000-0000-000000000001', '<admin_user_id>', '🔥 Trending This Week', 'Most popular ideas this week based on votes and engagement', true, true, 'trending'),
  ('00000000-0000-0000-0000-000000000002', '<admin_user_id>', '⭐ Staff Picks', 'Hand-picked ideas by the Gimme Idea team', true, true, 'staff_picks'),
  ('00000000-0000-0000-0000-000000000003', '<admin_user_id>', '🤖 AI Top Rated', 'Ideas with the highest AI scores (80+)', true, true, 'ai_top'),
  ('00000000-0000-0000-0000-000000000004', '<admin_user_id>', '💎 Hidden Gems', 'Low votes but high quality - discover underrated ideas', true, true, 'hidden_gems');
*/
