-- Migration: Add Hackathon Teams System
-- Description: Creates tables for team management in hackathons

-- =============================================
-- DROP EXISTING OBJECTS (if any)
-- =============================================
DROP TABLE IF EXISTS hackathon_team_invites CASCADE;
DROP TABLE IF EXISTS hackathon_team_members CASCADE;
DROP TABLE IF EXISTS hackathon_teams CASCADE;

-- =============================================
-- HACKATHON TEAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  
  -- Team Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Leader
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Settings
  max_members INTEGER DEFAULT 5,
  is_open BOOLEAN DEFAULT false, -- Open for join requests
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique team name per hackathon
  UNIQUE(hackathon_id, name)
);

-- Indexes
CREATE INDEX idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX idx_hackathon_teams_leader ON hackathon_teams(leader_id);

-- Trigger for updated_at
CREATE TRIGGER update_hackathon_teams_updated_at BEFORE UPDATE ON hackathon_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HACKATHON TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  
  -- Metadata
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only be in one team per hackathon (handled by trigger)
  UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX idx_hackathon_team_members_team ON hackathon_team_members(team_id);
CREATE INDEX idx_hackathon_team_members_user ON hackathon_team_members(user_id);

-- =============================================
-- HACKATHON TEAM INVITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  
  -- Inviter & Invitee
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  message TEXT, -- Optional invite message
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Ensure no duplicate pending invites
  UNIQUE(team_id, invitee_id, status)
);

-- Indexes
CREATE INDEX idx_hackathon_team_invites_team ON hackathon_team_invites(team_id);
CREATE INDEX idx_hackathon_team_invites_invitee ON hackathon_team_invites(invitee_id);
CREATE INDEX idx_hackathon_team_invites_status ON hackathon_team_invites(status) WHERE status = 'pending';

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_team_invites ENABLE ROW LEVEL SECURITY;

-- Teams: Everyone can read, leader can manage
CREATE POLICY "Teams are viewable by everyone" 
  ON hackathon_teams FOR SELECT USING (true);

CREATE POLICY "Users can create teams" 
  ON hackathon_teams FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their teams" 
  ON hackathon_teams FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Leaders can delete their teams" 
  ON hackathon_teams FOR DELETE USING (auth.uid() = leader_id);

-- Team Members: Everyone can read, managed by system
CREATE POLICY "Team members are viewable by everyone" 
  ON hackathon_team_members FOR SELECT USING (true);

CREATE POLICY "Team leaders can add members" 
  ON hackathon_team_members FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_teams 
      WHERE id = team_id AND leader_id = auth.uid()
    )
    OR auth.uid() = user_id -- User can add themselves (when accepting invite)
  );

CREATE POLICY "Team leaders can remove members" 
  ON hackathon_team_members FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hackathon_teams 
      WHERE id = team_id AND leader_id = auth.uid()
    )
    OR auth.uid() = user_id -- User can remove themselves (leave)
  );

-- Team Invites: Invitee and team members can see
CREATE POLICY "Users can see their invites" 
  ON hackathon_team_invites FOR SELECT USING (
    auth.uid() = invitee_id 
    OR auth.uid() = inviter_id
    OR EXISTS (
      SELECT 1 FROM hackathon_team_members 
      WHERE team_id = hackathon_team_invites.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create invites" 
  ON hackathon_team_invites FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hackathon_team_members 
      WHERE team_id = hackathon_team_invites.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invites" 
  ON hackathon_team_invites FOR UPDATE USING (auth.uid() = invitee_id);

CREATE POLICY "Inviters can delete their invites" 
  ON hackathon_team_invites FOR DELETE USING (auth.uid() = inviter_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to check if user is already in a team for this hackathon
CREATE OR REPLACE FUNCTION check_user_team_membership()
RETURNS TRIGGER AS $$
DECLARE
  hackathon_uuid UUID;
BEGIN
  -- Get hackathon_id from team
  SELECT hackathon_id INTO hackathon_uuid 
  FROM hackathon_teams WHERE id = NEW.team_id;
  
  -- Check if user is already in another team for this hackathon
  IF EXISTS (
    SELECT 1 FROM hackathon_team_members tm
    JOIN hackathon_teams t ON t.id = tm.team_id
    WHERE tm.user_id = NEW.user_id 
    AND t.hackathon_id = hackathon_uuid
    AND tm.team_id != NEW.team_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of another team in this hackathon';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_team_membership_before_insert
  BEFORE INSERT ON hackathon_team_members
  FOR EACH ROW EXECUTE FUNCTION check_user_team_membership();

-- Function to auto-add leader as team member when team is created
CREATE OR REPLACE FUNCTION auto_add_leader_to_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hackathon_team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.leader_id, 'leader');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_leader_after_team_create
  AFTER INSERT ON hackathon_teams
  FOR EACH ROW EXECUTE FUNCTION auto_add_leader_to_team();

-- Function to get team member count
CREATE OR REPLACE FUNCTION get_team_member_count(team_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM hackathon_team_members WHERE team_id = team_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if team is full
CREATE OR REPLACE FUNCTION is_team_full(team_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT get_team_member_count(team_uuid) >= (
    SELECT max_members FROM hackathon_teams WHERE id = team_uuid
  );
$$ LANGUAGE SQL STABLE;

-- Function to get user's team in a hackathon
CREATE OR REPLACE FUNCTION get_user_team_in_hackathon(user_uuid UUID, hackathon_uuid UUID)
RETURNS UUID AS $$
  SELECT t.id FROM hackathon_teams t
  JOIN hackathon_team_members tm ON tm.team_id = t.id
  WHERE tm.user_id = user_uuid AND t.hackathon_id = hackathon_uuid
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
