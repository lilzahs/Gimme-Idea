-- View Tracking System for GMI
-- Tracks post views with IP-based deduplication

-- Create post_views table
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  viewer_wallet TEXT,
  viewer_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add view_count column to posts table for quick access
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at ON post_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_ip_post ON post_views(viewer_ip, post_id);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);

-- Enable RLS
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies - anyone can view, system can insert
CREATE POLICY "post_views_select_all" ON post_views
  FOR SELECT USING (TRUE);

CREATE POLICY "post_views_insert_system" ON post_views
  FOR INSERT WITH CHECK (TRUE);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS trigger_increment_view_count ON post_views;
CREATE TRIGGER trigger_increment_view_count
  AFTER INSERT ON post_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_view_count();

-- Function to check if view should be counted (24h deduplication)
CREATE OR REPLACE FUNCTION should_count_view(
  p_post_id UUID,
  p_viewer_ip TEXT,
  p_viewer_wallet TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  last_view_time TIMESTAMPTZ;
BEGIN
  -- Check if same IP/wallet viewed in last 24 hours
  SELECT created_at INTO last_view_time
  FROM post_views
  WHERE post_id = p_post_id
    AND (
      (viewer_ip = p_viewer_ip AND p_viewer_ip IS NOT NULL)
      OR (viewer_wallet = p_viewer_wallet AND p_viewer_wallet IS NOT NULL)
    )
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no previous view or last view was more than 24h ago
  IF last_view_time IS NULL OR last_view_time < NOW() - INTERVAL '24 hours' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
