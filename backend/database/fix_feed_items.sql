-- =============================================
-- FIX FEEDS: Ensure triggers exist for items_count
-- =============================================

-- Create trigger functions if not exist
CREATE OR REPLACE FUNCTION increment_feed_items_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET items_count = items_count + 1, updated_at = NOW() WHERE id = NEW.feed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_feed_items_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feeds SET items_count = GREATEST(0, items_count - 1), updated_at = NOW() WHERE id = OLD.feed_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Re-create triggers
DROP TRIGGER IF EXISTS trigger_increment_feed_items ON feed_items;
CREATE TRIGGER trigger_increment_feed_items
  AFTER INSERT ON feed_items
  FOR EACH ROW EXECUTE FUNCTION increment_feed_items_count();

DROP TRIGGER IF EXISTS trigger_decrement_feed_items ON feed_items;
CREATE TRIGGER trigger_decrement_feed_items
  AFTER DELETE ON feed_items
  FOR EACH ROW EXECUTE FUNCTION decrement_feed_items_count();

-- Recalculate items_count for all feeds
UPDATE feeds f SET items_count = (
  SELECT COUNT(*) FROM feed_items fi WHERE fi.feed_id = f.id
);

-- Show all feed_items to verify
SELECT 
  fi.id,
  fi.feed_id,
  fi.project_id,
  f.name as feed_name,
  p.title as project_title
FROM feed_items fi
LEFT JOIN feeds f ON fi.feed_id = f.id
LEFT JOIN projects p ON fi.project_id = p.id;
