-- Migration: Add Notification System
-- This creates the notifications table and triggers for follow, new posts, and comments

-- Create notification types enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'follow',           -- Someone followed you
      'new_post',         -- Someone you follow posted a new idea
      'comment',          -- Someone commented on your post
      'comment_reply',    -- Someone replied to your comment
      'like',             -- Someone liked/voted your post
      'comment_like',     -- Someone liked your comment
      'donation',         -- Someone donated to your project
      'mention'           -- Someone mentioned you (future use)
    );
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Who receives the notification
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,        -- Who triggered the notification
  type TEXT NOT NULL,                                            -- Type of notification
  title TEXT NOT NULL,                                           -- Short title
  message TEXT NOT NULL,                                         -- Detailed message
  target_type TEXT,                                              -- 'project', 'comment', 'user'
  target_id UUID,                                                -- ID of the target
  metadata JSONB DEFAULT '{}',                                   -- Extra data (e.g., donation amount)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT valid_notification_type CHECK (type IN ('follow', 'new_post', 'comment', 'comment_reply', 'like', 'comment_like', 'donation', 'mention'))
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
DROP POLICY IF EXISTS notifications_select_policy ON notifications;
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS notifications_update_policy ON notifications;
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS notifications_delete_policy ON notifications;
CREATE POLICY notifications_delete_policy ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can insert notifications
DROP POLICY IF EXISTS notifications_insert_policy ON notifications;
CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT WITH CHECK (TRUE);

-- =====================
-- NOTIFICATION FUNCTIONS
-- =====================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't notify yourself
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO notifications (user_id, actor_id, type, title, message, target_type, target_id)
  VALUES (p_user_id, p_actor_id, p_type, p_title, p_message, p_target_type, p_target_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications with pagination
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_unread_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  actor_id UUID,
  actor_username TEXT,
  actor_avatar TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  target_type TEXT,
  target_id UUID,
  read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.actor_id,
    u.username AS actor_username,
    u.avatar AS actor_avatar,
    n.type,
    n.title,
    n.message,
    n.target_type,
    n.target_id,
    n.read,
    n.created_at
  FROM notifications n
  LEFT JOIN users u ON n.actor_id = u.id
  WHERE n.user_id = p_user_id
    AND (NOT p_unread_only OR n.read = FALSE)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE 
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications 
  SET read = TRUE 
  WHERE user_id = p_user_id AND read = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete old notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
    AND read = TRUE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- TRIGGERS FOR AUTO-NOTIFICATIONS
-- =====================

-- Trigger function: Create notification when someone follows you
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_username TEXT;
BEGIN
  -- Get follower username
  SELECT username INTO v_follower_username FROM users WHERE id = NEW.follower_id;
  
  -- Create notification for the followed user
  PERFORM create_notification(
    NEW.following_id,                                    -- user to notify
    NEW.follower_id,                                     -- actor
    'follow',                                            -- type
    'New Follower',                                      -- title
    v_follower_username || ' started following you',    -- message
    'user',                                              -- target_type
    NEW.follower_id                                      -- target_id (follower's profile)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follows
DROP TRIGGER IF EXISTS trigger_notify_on_follow ON follows;
CREATE TRIGGER trigger_notify_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Trigger function: Create notification when someone you follow posts a new idea
CREATE OR REPLACE FUNCTION notify_followers_on_new_post()
RETURNS TRIGGER AS $$
DECLARE
  v_author_username TEXT;
  v_follower RECORD;
BEGIN
  -- Get author username
  SELECT username INTO v_author_username FROM users WHERE id = NEW.author_id;
  
  -- Notify all followers of the author
  FOR v_follower IN 
    SELECT follower_id FROM follows WHERE following_id = NEW.author_id
  LOOP
    PERFORM create_notification(
      v_follower.follower_id,                           -- user to notify
      NEW.author_id,                                    -- actor
      'new_post',                                       -- type
      'New Idea',                                       -- title
      v_author_username || ' posted: "' || LEFT(NEW.title, 50) || CASE WHEN LENGTH(NEW.title) > 50 THEN '..."' ELSE '"' END,
      'project',                                        -- target_type
      NEW.id                                            -- target_id (project id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS trigger_notify_followers_on_new_post ON projects;
CREATE TRIGGER trigger_notify_followers_on_new_post
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_on_new_post();

-- Trigger function: Create notification when someone you follow comments
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_commenter_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
  v_follower RECORD;
  v_parent_comment_author_id UUID;
BEGIN
  -- Get commenter username
  SELECT username INTO v_commenter_username FROM users WHERE id = NEW.author_id;
  
  -- Get project info
  SELECT title, author_id INTO v_project_title, v_project_author_id 
  FROM projects WHERE id = NEW.project_id;
  
  -- 1. Notify project author (if not the commenter)
  IF v_project_author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_project_author_id,                              -- user to notify
      NEW.author_id,                                    -- actor
      'comment',                                        -- type
      'New Comment',                                    -- title
      v_commenter_username || ' commented on your idea: "' || LEFT(v_project_title, 30) || CASE WHEN LENGTH(v_project_title) > 30 THEN '..."' ELSE '"' END,
      'project',                                        -- target_type
      NEW.project_id                                    -- target_id
    );
  END IF;
  
  -- 2. If this is a reply, notify the parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_author_id FROM comments WHERE id = NEW.parent_id;
    
    IF v_parent_comment_author_id IS NOT NULL AND v_parent_comment_author_id != NEW.author_id THEN
      PERFORM create_notification(
        v_parent_comment_author_id,                     -- user to notify
        NEW.author_id,                                  -- actor
        'comment_reply',                                -- type
        'Reply to Your Comment',                        -- title
        v_commenter_username || ' replied to your comment',
        'project',                                      -- target_type
        NEW.project_id                                  -- target_id
      );
    END IF;
  END IF;
  
  -- 3. Notify followers of the commenter (optional - can be heavy)
  -- Uncomment if you want followers to know when someone comments
  /*
  FOR v_follower IN 
    SELECT follower_id FROM follows 
    WHERE following_id = NEW.author_id
    AND follower_id != v_project_author_id  -- Don't double-notify project author
  LOOP
    PERFORM create_notification(
      v_follower.follower_id,
      NEW.author_id,
      'comment',
      'New Comment',
      v_commenter_username || ' commented on: "' || LEFT(v_project_title, 30) || '"',
      'project',
      NEW.project_id
    );
  END LOOP;
  */
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comments
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- =====================
-- TRIGGER: PROJECT VOTE/LIKE
-- =====================

-- Trigger function: Create notification when someone votes/likes your project
CREATE OR REPLACE FUNCTION notify_on_project_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_voter_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
BEGIN
  -- Get voter username
  SELECT username INTO v_voter_username FROM users WHERE id = NEW.user_id;
  
  -- Get project info
  SELECT title, author_id INTO v_project_title, v_project_author_id 
  FROM projects WHERE id = NEW.project_id;
  
  -- Don't notify if voting on own project
  IF v_project_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for project author
  PERFORM create_notification(
    v_project_author_id,                                -- user to notify
    NEW.user_id,                                        -- actor
    'like',                                             -- type
    'New Vote',                                         -- title
    v_voter_username || ' voted for your idea: "' || LEFT(v_project_title, 40) || CASE WHEN LENGTH(v_project_title) > 40 THEN '..."' ELSE '"' END,
    'project',                                          -- target_type
    NEW.project_id                                      -- target_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project votes
DROP TRIGGER IF EXISTS trigger_notify_on_project_vote ON project_votes;
CREATE TRIGGER trigger_notify_on_project_vote
  AFTER INSERT ON project_votes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_project_vote();

-- =====================
-- TRIGGER: COMMENT LIKE
-- =====================

-- Trigger function: Create notification when someone likes your comment
CREATE OR REPLACE FUNCTION notify_on_comment_like()
RETURNS TRIGGER AS $$
DECLARE
  v_liker_username TEXT;
  v_comment_content TEXT;
  v_comment_author_id UUID;
  v_project_id UUID;
BEGIN
  -- Get liker username
  SELECT username INTO v_liker_username FROM users WHERE id = NEW.user_id;
  
  -- Get comment info
  SELECT content, user_id, project_id INTO v_comment_content, v_comment_author_id, v_project_id
  FROM comments WHERE id = NEW.comment_id;
  
  -- Don't notify if liking own comment
  IF v_comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for comment author
  PERFORM create_notification(
    v_comment_author_id,                                -- user to notify
    NEW.user_id,                                        -- actor
    'comment_like',                                     -- type
    'Comment Liked',                                    -- title
    v_liker_username || ' liked your comment: "' || LEFT(v_comment_content, 30) || CASE WHEN LENGTH(v_comment_content) > 30 THEN '..."' ELSE '"' END,
    'project',                                          -- target_type (navigate to the project)
    v_project_id                                        -- target_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment likes
DROP TRIGGER IF EXISTS trigger_notify_on_comment_like ON comment_likes;
CREATE TRIGGER trigger_notify_on_comment_like
  AFTER INSERT ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_like();

-- =====================
-- TRIGGER: DONATION (Transaction with type='tip')
-- =====================

-- Trigger function: Create notification when someone donates to your project
CREATE OR REPLACE FUNCTION notify_on_donation()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
  v_amount_display TEXT;
BEGIN
  -- Only notify for 'tip' type transactions (donations)
  IF NEW.type != 'tip' THEN
    RETURN NEW;
  END IF;
  
  -- Only notify for confirmed transactions
  IF NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;
  
  -- Get donor username
  SELECT username INTO v_donor_username FROM users WHERE id = NEW.user_id;
  
  -- Get project info
  IF NEW.project_id IS NOT NULL THEN
    SELECT title, author_id INTO v_project_title, v_project_author_id 
    FROM projects WHERE id = NEW.project_id;
  ELSE
    -- If no project, this might be a direct tip - skip for now
    RETURN NEW;
  END IF;
  
  -- Don't notify if donating to own project
  IF v_project_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Format amount for display
  v_amount_display := ROUND(NEW.amount::NUMERIC, 4)::TEXT || ' SOL';
  
  -- Create notification for project author
  INSERT INTO notifications (user_id, actor_id, type, title, message, target_type, target_id, metadata)
  VALUES (
    v_project_author_id,
    NEW.user_id,
    'donation',
    'New Donation! 🎉',
    v_donor_username || ' donated ' || v_amount_display || ' to your idea: "' || LEFT(v_project_title, 30) || CASE WHEN LENGTH(v_project_title) > 30 THEN '..."' ELSE '"' END,
    'project',
    NEW.project_id,
    jsonb_build_object('amount', NEW.amount, 'tx_hash', NEW.tx_hash)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for donations
DROP TRIGGER IF EXISTS trigger_notify_on_donation ON transactions;
CREATE TRIGGER trigger_notify_on_donation
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_donation();

-- Also trigger on UPDATE (when status changes to 'confirmed')
CREATE OR REPLACE FUNCTION notify_on_donation_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_donor_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
  v_amount_display TEXT;
BEGIN
  -- Only trigger when status changes to 'confirmed'
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' AND NEW.type = 'tip' THEN
    -- Get donor username
    SELECT username INTO v_donor_username FROM users WHERE id = NEW.user_id;
    
    -- Get project info
    IF NEW.project_id IS NOT NULL THEN
      SELECT title, author_id INTO v_project_title, v_project_author_id 
      FROM projects WHERE id = NEW.project_id;
    ELSE
      RETURN NEW;
    END IF;
    
    -- Don't notify if donating to own project
    IF v_project_author_id = NEW.user_id THEN
      RETURN NEW;
    END IF;
    
    -- Format amount for display
    v_amount_display := ROUND(NEW.amount::NUMERIC, 4)::TEXT || ' SOL';
    
    -- Create notification for project author
    INSERT INTO notifications (user_id, actor_id, type, title, message, target_type, target_id, metadata)
    VALUES (
      v_project_author_id,
      NEW.user_id,
      'donation',
      'New Donation! 🎉',
      v_donor_username || ' donated ' || v_amount_display || ' to your idea: "' || LEFT(v_project_title, 30) || CASE WHEN LENGTH(v_project_title) > 30 THEN '..."' ELSE '"' END,
      'project',
      NEW.project_id,
      jsonb_build_object('amount', NEW.amount, 'tx_hash', NEW.tx_hash)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for donation confirmation
DROP TRIGGER IF EXISTS trigger_notify_on_donation_confirmed ON transactions;
CREATE TRIGGER trigger_notify_on_donation_confirmed
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_donation_confirmed();

-- =====================
-- ENABLE REALTIME
-- =====================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO service_role;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO service_role;
GRANT EXECUTE ON FUNCTION get_user_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO service_role;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO service_role;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO service_role;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO service_role;

COMMIT;
