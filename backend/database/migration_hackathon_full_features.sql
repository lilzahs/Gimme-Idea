-- Migration: Full Hackathon System Support
-- Description: Adds detailed support for Hackathon Timeline, Teams, Participants, and Announcements

-- 1. Upgrade 'hackathons' table with rich data columns
ALTER TABLE hackathons 
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb,  -- Array of phases {id, title, start, end}
ADD COLUMN IF NOT EXISTS tracks JSONB DEFAULT '[]'::jsonb,    -- Array of tracks {title, icon, description}
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb, -- Array of links
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;    -- UI configs (tabs, theme, etc.)

-- 2. Hackathon Participants (User Registration)
CREATE TABLE IF NOT EXISTS hackathon_participants (
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'qualified', 'disqualified')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb, -- Extra registration info (role, skills specific to this event)
  PRIMARY KEY (hackathon_id, user_id)
);

-- 3. Hackathon Teams
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  looking_for TEXT[] DEFAULT '{}', -- Roles they are recruiting
  tags TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  
  -- Team Status
  is_open BOOLEAN DEFAULT true, -- Open for join requests
  max_members INTEGER DEFAULT 5,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(hackathon_id, name)
);

-- 4. Team Members
CREATE TABLE IF NOT EXISTS hackathon_team_members (
  team_id UUID REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'Member', -- Leader, Developer, Designer...
  is_leader BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- 5. Hackathon Announcements (The "Terminal" logs)
CREATE TABLE IF NOT EXISTS hackathon_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- UI Effects config
  effect VARCHAR(50), -- 'typewriter', 'glitch', 'pulse'
  widget JSONB,       -- e.g., {"type": "countdown", "target": "..."}
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Update Projects table to link Submissions
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hackathon_track VARCHAR(100);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_announcements_hackathon ON hackathon_announcements(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_projects_hackathon ON projects(hackathon_id);

-- RLS Policies (Update existing policies or add new ones)
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_announcements ENABLE ROW LEVEL SECURITY;

-- Policies for Participants
CREATE POLICY "Participants viewable by everyone" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Users can register themselves" ON hackathon_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Teams
CREATE POLICY "Teams viewable by everyone" ON hackathon_teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON hackathon_teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Leaders can update their team" ON hackathon_teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM hackathon_team_members WHERE team_id = id AND user_id = auth.uid() AND is_leader = true)
);

-- Policies for Announcements
CREATE POLICY "Announcements viewable by everyone" ON hackathon_announcements FOR SELECT USING (true);
