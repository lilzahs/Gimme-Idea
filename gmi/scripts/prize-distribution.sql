-- Prize Distribution System for GMI
-- Manages prize pools, rankings, and distributions

-- Extend posts table with prize tracking fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS prize_distributed BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS prize_distribution_tx TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS prize_distributed_at TIMESTAMPTZ;

-- Extend prize_distributions table
ALTER TABLE prize_distributions ADD COLUMN IF NOT EXISTS winner_wallet TEXT;
ALTER TABLE prize_distributions ADD COLUMN IF NOT EXISTS tx_signature TEXT;
ALTER TABLE prize_distributions ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE prize_distributions ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prize_dist_winner ON prize_distributions(winner_wallet);
CREATE INDEX IF NOT EXISTS idx_prize_dist_claimed ON prize_distributions(claimed);

-- Create prize claims table for tracking
CREATE TABLE IF NOT EXISTS prize_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_distribution_id UUID REFERENCES prize_distributions(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  winner_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_signature TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Create indexes for prize claims
CREATE INDEX IF NOT EXISTS idx_prize_claims_wallet ON prize_claims(winner_wallet);
CREATE INDEX IF NOT EXISTS idx_prize_claims_post ON prize_claims(post_id);
CREATE INDEX IF NOT EXISTS idx_prize_claims_status ON prize_claims(status);

-- Enable RLS
ALTER TABLE prize_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "prize_claims_select_own" ON prize_claims
  FOR SELECT USING (winner_wallet = current_user OR TRUE); -- Allow all to see for transparency

CREATE POLICY "prize_claims_insert_system" ON prize_claims
  FOR INSERT WITH CHECK (TRUE);

-- Function to calculate prize distribution based on feedback rankings
CREATE OR REPLACE FUNCTION calculate_prize_winners(
  p_post_id UUID
)
RETURNS TABLE(
  rank INT,
  comment_id UUID,
  wallet_address TEXT,
  amount NUMERIC
) AS $$
DECLARE
  v_prize_pool_amount NUMERIC;
  v_prize_pool_count INT;
  v_escrow_locked BOOLEAN;
BEGIN
  -- Get post prize info
  SELECT prize_pool_amount, prize_pool_count, escrow_locked
  INTO v_prize_pool_amount, v_prize_pool_count, v_escrow_locked
  FROM posts
  WHERE id = p_post_id;

  -- Validate escrow is locked
  IF NOT v_escrow_locked THEN
    RAISE EXCEPTION 'Escrow not locked for this post';
  END IF;

  -- Get existing distribution template
  RETURN QUERY
  SELECT
    pd.rank,
    fr.comment_id,
    c.wallet_address,
    pd.amount
  FROM prize_distributions pd
  LEFT JOIN feedback_rankings fr ON fr.post_id = p_post_id AND fr.rank = pd.rank
  LEFT JOIN comments c ON c.id = fr.comment_id
  WHERE pd.post_id = p_post_id
  ORDER BY pd.rank ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate equal distribution
CREATE OR REPLACE FUNCTION create_equal_prize_distribution(
  p_post_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_prize_pool_amount NUMERIC;
  v_prize_pool_count INT;
  v_amount_per_winner NUMERIC;
  v_rank INT;
BEGIN
  -- Get post prize info
  SELECT prize_pool_amount, prize_pool_count
  INTO v_prize_pool_amount, v_prize_pool_count
  FROM posts
  WHERE id = p_post_id;

  -- Calculate equal distribution
  v_amount_per_winner := v_prize_pool_amount / v_prize_pool_count;

  -- Delete existing distributions for this post
  DELETE FROM prize_distributions WHERE post_id = p_post_id;

  -- Create equal distributions
  FOR v_rank IN 1..v_prize_pool_count LOOP
    INSERT INTO prize_distributions (post_id, rank, amount)
    VALUES (p_post_id, v_rank, v_amount_per_winner);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create custom prize distribution (e.g., 50%, 30%, 20%)
CREATE OR REPLACE FUNCTION create_custom_prize_distribution(
  p_post_id UUID,
  p_percentages NUMERIC[]
)
RETURNS VOID AS $$
DECLARE
  v_prize_pool_amount NUMERIC;
  v_percentage NUMERIC;
  v_rank INT := 1;
BEGIN
  -- Get post prize info
  SELECT prize_pool_amount
  INTO v_prize_pool_amount
  FROM posts
  WHERE id = p_post_id;

  -- Validate percentages sum to 100
  IF (SELECT SUM(unnest) FROM unnest(p_percentages)) != 100 THEN
    RAISE EXCEPTION 'Percentages must sum to 100';
  END IF;

  -- Delete existing distributions
  DELETE FROM prize_distributions WHERE post_id = p_post_id;

  -- Create distributions based on percentages
  FOREACH v_percentage IN ARRAY p_percentages LOOP
    INSERT INTO prize_distributions (post_id, rank, amount)
    VALUES (p_post_id, v_rank, v_prize_pool_amount * v_percentage / 100);
    v_rank := v_rank + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to mark prizes as distributed
CREATE OR REPLACE FUNCTION mark_prizes_distributed(
  p_post_id UUID,
  p_tx_signature TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET
    prize_distributed = TRUE,
    prize_distribution_tx = p_tx_signature,
    prize_distributed_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;
