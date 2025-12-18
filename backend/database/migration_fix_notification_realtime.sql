-- Migration: Fix Notification & Announcement Realtime
-- This ensures realtime works properly for notifications and announcements tables

BEGIN;

-- =============================================
-- FIX NOTIFICATIONS TABLE
-- =============================================

-- Set replica identity to FULL for realtime subscriptions with RLS
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Re-add to realtime publication (in case it wasn't added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- Update RLS policy to work with realtime (using user_id filter)
-- Drop and recreate select policy to ensure it works with realtime subscriptions
DROP POLICY IF EXISTS notifications_select_policy ON notifications;
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  TO authenticated, anon
  USING (
    -- Allow users to see their own notifications
    auth.uid() = user_id
    -- OR allow service role to access all
    OR auth.role() = 'service_role'
    -- OR allow when authenticated and user_id matches (for realtime filter)
    OR (auth.role() = 'authenticated' AND user_id = auth.uid())
  );

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Make sure notifications can be selected by authenticated users
GRANT SELECT ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- =============================================
-- FIX USER_ANNOUNCEMENTS TABLE
-- =============================================

-- Set replica identity to FULL for realtime subscriptions with RLS
ALTER TABLE user_announcements REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_announcements;
  END IF;
END $$;

-- Update RLS policy to work with realtime
DROP POLICY IF EXISTS "Users can view their own announcements" ON user_announcements;
CREATE POLICY "Users can view their own announcements" ON user_announcements
  FOR SELECT
  TO authenticated, anon
  USING (
    auth.uid() = user_id
    OR auth.role() = 'service_role'
    OR (auth.role() = 'authenticated' AND user_id = auth.uid())
  );

-- Grant permissions
GRANT SELECT ON user_announcements TO authenticated;
GRANT SELECT ON user_announcements TO anon;

COMMIT;
