-- Migration: Add NEW notification triggers (like, comment_like, donation)
-- Run this AFTER the initial notification system migration
-- This adds: project vote, comment like, and donation notifications

-- =====================
-- 1. UPDATE TABLE: Add metadata column if not exists
-- =====================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- =====================
-- 2. UPDATE CONSTRAINT: Add new notification types
-- =====================
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS valid_notification_type;
ALTER TABLE notifications ADD CONSTRAINT valid_notification_type 
  CHECK (type IN ('follow', 'new_post', 'comment', 'comment_reply', 'like', 'comment_like', 'donation', 'mention'));

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

-- Trigger function: Create notification when someone donates to your project (INSERT)
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
    -- If no project, skip
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

-- Create trigger for donations (on INSERT)
DROP TRIGGER IF EXISTS trigger_notify_on_donation ON transactions;
CREATE TRIGGER trigger_notify_on_donation
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_donation();

-- Trigger function: Create notification when donation status changes to 'confirmed' (UPDATE)
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

-- Create trigger for donation confirmation (on UPDATE)
DROP TRIGGER IF EXISTS trigger_notify_on_donation_confirmed ON transactions;
CREATE TRIGGER trigger_notify_on_donation_confirmed
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_donation_confirmed();

-- =====================
-- DONE!
-- =====================
-- New notifications added:
-- 1. like - when someone votes for your project
-- 2. comment_like - when someone likes your comment  
-- 3. donation - when someone donates SOL to your project
