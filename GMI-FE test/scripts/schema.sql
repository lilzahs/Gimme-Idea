-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  image_url TEXT,
  project_link TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  prize_pool_amount NUMERIC DEFAULT 0,
  prize_pool_count INT DEFAULT 0,
  ends_at TIMESTAMPTZ,
  escrow_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prize distribution table
CREATE TABLE IF NOT EXISTS prize_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback rankings table
CREATE TABLE IF NOT EXISTS feedback_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  rank INT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_posts_wallet ON posts(wallet_address);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_wallet ON comments(wallet_address);
CREATE INDEX idx_feedback_rankings_post ON feedback_rankings(post_id);

-- Enable RLS (Row Level Security)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "posts_insert_own" ON posts
  FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);
  
CREATE POLICY "posts_select_all" ON posts
  FOR SELECT USING (TRUE);
  
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- RLS Policies for comments
CREATE POLICY "comments_insert_own" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = wallet_address);
  
CREATE POLICY "comments_select_all" ON comments
  FOR SELECT USING (TRUE);

-- RLS Policies for rankings (only post owner can update)
CREATE POLICY "rankings_insert_own_post" ON feedback_rankings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = post_id AND posts.wallet_address = auth.uid()::text)
  );

-- RLS Policies for prize distributions
CREATE POLICY "prize_dist_select_all" ON prize_distributions
  FOR SELECT USING (TRUE);
