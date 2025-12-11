-- Migration: Add Hackathon System
-- Run this in Supabase SQL Editor

-- =============================================
-- HACKATHONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- For URL friendly access (e.g., /hackathon/winter-2025)
  description TEXT,
  banner_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'ongoing', 'judging', 'completed')),
  prize_pool VARCHAR(100), -- Display string e.g., "$50,000"
  rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hackathons_status ON hackathons(status);
CREATE INDEX idx_hackathons_slug ON hackathons(slug);

-- =============================================
-- HACKATHON TIMELINE (Milestones)
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'done')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hackathon_timeline_hackathon ON hackathon_timeline(hackathon_id);
CREATE INDEX idx_hackathon_timeline_order ON hackathon_timeline(display_order);

-- =============================================
-- HACKATHON TEAMS
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  project_link TEXT, -- Link to project submission if available
  captain_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  score NUMERIC(10, 2) DEFAULT 0,
  rank INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hackathon_id, name)
);

CREATE INDEX idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE INDEX idx_hackathon_teams_score ON hackathon_teams(score DESC);

-- =============================================
-- HACKATHON PARTICIPANTS (Link Users to Teams/Hackathons)
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES hackathon_teams(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'captain', 'mentor', 'judge')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hackathon_id, user_id)
);

CREATE INDEX idx_hackathon_participants_hackathon ON hackathon_participants(hackathon_id);
CREATE INDEX idx_hackathon_participants_user ON hackathon_participants(user_id);
CREATE INDEX idx_hackathon_participants_team ON hackathon_participants(team_id);

-- =============================================
-- HACKATHON TASKS (Checklist for participants)
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  content VARCHAR(255) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER TASK COMPLETION
-- =============================================
CREATE TABLE IF NOT EXISTS user_hackathon_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES hackathon_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hackathon_tasks ENABLE ROW LEVEL SECURITY;

-- Read policies (Public)
CREATE POLICY "Hackathons are viewable by everyone" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Timeline is viewable by everyone" ON hackathon_timeline FOR SELECT USING (true);
CREATE POLICY "Teams are viewable by everyone" ON hackathon_teams FOR SELECT USING (true);
CREATE POLICY "Participants are viewable by everyone" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Tasks are viewable by everyone" ON hackathon_tasks FOR SELECT USING (true);
CREATE POLICY "User tasks completion viewable by owner" ON user_hackathon_tasks FOR SELECT USING (auth.uid() = user_id);

-- Write policies (Authenticated)
-- Note: Simplified for demo. Real app needs stricter role checks (e.g. only admins edit hackathons)
CREATE POLICY "Authenticated users can join hackathons" ON hackathon_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Team captains can update team" ON hackathon_teams FOR UPDATE USING (auth.uid() = captain_id);
CREATE POLICY "Users can mark tasks complete" ON user_hackathon_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SEED DATA (Sample Hackathon)
-- =============================================
DO $$
DECLARE
  v_hack_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Create Hackathon
  INSERT INTO hackathons (title, slug, description, start_date, end_date, prize_pool, status)
  VALUES (
    'GIMME HACK 2025',
    'gimme-hack-2025',
    'Build the future of decentralized ideas.',
    NOW(),
    NOW() + INTERVAL '30 days',
    '$50,000',
    'ongoing'
  )
  RETURNING id INTO v_hack_id;

  -- 2. Add Timeline
  INSERT INTO hackathon_timeline (hackathon_id, title, date, status, display_order)
  VALUES
    (v_hack_id, 'Registration', NOW() - INTERVAL '5 days', 'done', 1),
    (v_hack_id, 'Team Formation', NOW() - INTERVAL '2 days', 'done', 2),
    (v_hack_id, 'Submission', NOW() + INTERVAL '10 days', 'active', 3),
    (v_hack_id, 'Voting', NOW() + INTERVAL '15 days', 'pending', 4),
    (v_hack_id, 'Demo Day', NOW() + INTERVAL '20 days', 'pending', 5);

  -- 3. Add Tasks
  INSERT INTO hackathon_tasks (hackathon_id, content, display_order)
  VALUES
    (v_hack_id, 'Join Discord Server', 1),
    (v_hack_id, 'Create Team Profile', 2),
    (v_hack_id, 'Submit Project Proposal', 3),
    (v_hack_id, 'Upload Demo Video', 4);
    
END $$;
