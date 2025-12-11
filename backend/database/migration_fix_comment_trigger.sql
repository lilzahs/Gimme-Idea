-- Migration: Fix comment trigger to use correct column names
-- comments table uses: user_id (not author_id), parent_comment_id (not parent_id)

-- Drop and recreate the notify_on_comment function with correct column names
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_commenter_username TEXT;
  v_project_title TEXT;
  v_project_author_id UUID;
  v_parent_comment_user_id UUID;
BEGIN
  -- Get commenter username (using user_id, not author_id)
  SELECT username INTO v_commenter_username FROM users WHERE id = NEW.user_id;
  
  -- Get project info
  SELECT title, author_id INTO v_project_title, v_project_author_id 
  FROM projects WHERE id = NEW.project_id;
  
  -- 1. Notify project author (if not the commenter)
  IF v_project_author_id IS NOT NULL AND v_project_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_project_author_id,                              -- user to notify
      NEW.user_id,                                      -- actor (changed from author_id)
      'comment',                                        -- type
      'New Comment',                                    -- title
      v_commenter_username || ' commented on your idea: "' || LEFT(v_project_title, 30) || CASE WHEN LENGTH(v_project_title) > 30 THEN '..."' ELSE '"' END,
      'project',                                        -- target_type
      NEW.project_id                                    -- target_id
    );
  END IF;
  
  -- 2. If this is a reply, notify the parent comment author
  -- Using parent_comment_id instead of parent_id
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_comment_user_id FROM comments WHERE id = NEW.parent_comment_id;
    
    IF v_parent_comment_user_id IS NOT NULL AND v_parent_comment_user_id != NEW.user_id THEN
      PERFORM create_notification(
        v_parent_comment_user_id,                       -- user to notify
        NEW.user_id,                                    -- actor
        'comment_reply',                                -- type
        'Reply to Your Comment',                        -- title
        v_commenter_username || ' replied to your comment',
        'project',                                      -- target_type
        NEW.project_id                                  -- target_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- =====================
-- DONE!
-- =====================
-- Fixed: 
-- 1. NEW.author_id -> NEW.user_id
-- 2. NEW.parent_id -> NEW.parent_comment_id
-- 3. SELECT author_id FROM comments -> SELECT user_id FROM comments
