-- Migration: Add User Announcements System
-- Description: Creates tables for storing announcements/alerts for users

-- =============================================
-- USER ANNOUNCEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Announcement Info
  type VARCHAR(50) NOT NULL, -- 'team_invite', 'hackathon_reminder', 'system', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Reference to related entity
  reference_type VARCHAR(50), -- 'hackathon', 'team', 'project', etc.
  reference_id UUID,
  
  -- Action URL (optional - where to redirect when clicked)
  action_url TEXT,
  action_label VARCHAR(50), -- 'View Team', 'Join Now', etc.
  
  -- Priority & Status
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Auto-dismiss after this time
  
  -- Extra data (JSON)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_user_announcements_user ON user_announcements(user_id);
CREATE INDEX idx_user_announcements_type ON user_announcements(type);
CREATE INDEX idx_user_announcements_unread ON user_announcements(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_user_announcements_active ON user_announcements(user_id, is_dismissed) WHERE is_dismissed = false;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE user_announcements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own announcements
CREATE POLICY "Users can view their own announcements" 
  ON user_announcements FOR SELECT USING (auth.uid() = user_id);

-- Only system (admin client) can create announcements
CREATE POLICY "System can create announcements" 
  ON user_announcements FOR INSERT WITH CHECK (true);

-- Users can update their own announcements (mark as read/dismissed)
CREATE POLICY "Users can update their own announcements" 
  ON user_announcements FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own announcements
CREATE POLICY "Users can delete their own announcements" 
  ON user_announcements FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create a team invite announcement
CREATE OR REPLACE FUNCTION create_team_invite_announcement()
RETURNS TRIGGER AS $$
DECLARE
  team_record RECORD;
  inviter_record RECORD;
  hackathon_record RECORD;
BEGIN
  -- Get team info
  SELECT t.*, h.title as hackathon_title, h.slug as hackathon_slug
  INTO team_record
  FROM hackathon_teams t
  JOIN hackathons h ON h.id = t.hackathon_id
  WHERE t.id = NEW.team_id;
  
  -- Get inviter info
  SELECT username, avatar INTO inviter_record
  FROM users WHERE id = NEW.inviter_id;
  
  -- Create announcement
  INSERT INTO user_announcements (
    user_id,
    type,
    title,
    message,
    reference_type,
    reference_id,
    action_url,
    action_label,
    priority,
    expires_at,
    metadata
  ) VALUES (
    NEW.invitee_id,
    'team_invite',
    'Team Invitation',
    inviter_record.username || ' invited you to join team "' || team_record.name || '" for ' || team_record.hackathon_title,
    'team_invite',
    NEW.id,
    '/hackathons/' || team_record.hackathon_slug,
    'View Hackathon',
    'high',
    NEW.expires_at,
    jsonb_build_object(
      'teamId', NEW.team_id,
      'teamName', team_record.name,
      'inviterId', NEW.inviter_id,
      'inviterName', inviter_record.username,
      'inviterAvatar', inviter_record.avatar,
      'hackathonId', team_record.hackathon_id,
      'hackathonTitle', team_record.hackathon_title,
      'inviteId', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create announcement when invite is created
CREATE TRIGGER create_announcement_on_team_invite
  AFTER INSERT ON hackathon_team_invites
  FOR EACH ROW EXECUTE FUNCTION create_team_invite_announcement();

-- Function to dismiss announcement when invite is responded
CREATE OR REPLACE FUNCTION dismiss_invite_announcement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'pending' AND OLD.status = 'pending' THEN
    UPDATE user_announcements 
    SET is_dismissed = true
    WHERE reference_type = 'team_invite' 
    AND reference_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to dismiss announcement when invite status changes
CREATE TRIGGER dismiss_announcement_on_invite_response
  AFTER UPDATE ON hackathon_team_invites
  FOR EACH ROW EXECUTE FUNCTION dismiss_invite_announcement();

-- Function to get active announcements count
CREATE OR REPLACE FUNCTION get_user_announcement_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM user_announcements 
  WHERE user_id = user_uuid 
  AND is_dismissed = false
  AND (expires_at IS NULL OR expires_at > NOW());
$$ LANGUAGE SQL STABLE;
