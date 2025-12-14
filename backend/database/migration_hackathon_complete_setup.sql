-- COMPLETE HACKATHON SYSTEM SETUP
-- Run this in Supabase SQL Editor to set up all necessary tables.

-- 1. Create Hackathons Table (Basic + Advanced Fields)
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_pool VARCHAR(100), 
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'voting', 'completed')),
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Advanced JSONB Fields for UI
  timeline JSONB DEFAULT '[]'::jsonb,  -- Array of phases {id, title, start, end}
  tracks JSONB DEFAULT '[]'::jsonb,    -- Array of tracks {title, icon, description}
  resources JSONB DEFAULT '[]'::jsonb, -- Array of links
  config JSONB DEFAULT '{}'::jsonb,    -- UI configs (tabs, theme, etc.)
  
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Hackathon Participants
CREATE TABLE IF NOT EXISTS hackathon_participants (
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'qualified', 'disqualified')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (hackathon_id, user_id)
);

-- 3. Hackathon Teams
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  looking_for TEXT[] DEFAULT '{}', 
  tags TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_open BOOLEAN DEFAULT true,
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
  role VARCHAR(50) DEFAULT 'Member',
  is_leader BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- 5. Announcements (Terminal Logs)
CREATE TABLE IF NOT EXISTS hackathon_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effect VARCHAR(50), 
  widget JSONB,      
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Link Projects to Hackathon
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='hackathon_id') THEN
      ALTER TABLE projects ADD COLUMN hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL;
      ALTER TABLE projects ADD COLUMN hackathon_track VARCHAR(100);
  END IF;
END $$;

-- 7. Indexes & Triggers
CREATE INDEX IF NOT EXISTS idx_hackathons_slug ON hackathons(slug);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_user ON hackathon_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_teams_hackathon ON hackathon_teams(hackathon_id);
CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON hackathons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable RLS
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_announcements ENABLE ROW LEVEL SECURITY;

-- 9. Policies (Simplified for development)
-- Allow public read access
CREATE POLICY "Public Read Hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public Read Participants" ON hackathon_participants FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON hackathon_teams FOR SELECT USING (true);
CREATE POLICY "Public Read Members" ON hackathon_team_members FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON hackathon_announcements FOR SELECT USING (true);

-- Allow authenticated modifications (Create/Join)
CREATE POLICY "Auth Register" ON hackathon_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth Create Team" ON hackathon_teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Join Team" ON hackathon_team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sample Data (Optional: Creates the 'Solana Education' Hackathon)
INSERT INTO hackathons (slug, title, description, start_date, end_date, status, prize_pool, image_url, timeline, tracks, config)
VALUES (
  'solana-edu-2026',
  'DSUC HACKATHON : Education Ecosystem',
  'Build innovative solutions for the education sector leveraging the power of Solana blockchain.',
  NOW(),
  NOW() + INTERVAL '30 days',
  'active',
  '17,000,000 VND',
  'https://images.unsplash.com/photo-1596495578051-24750d42171f?q=80&w=2940&auto=format&fit=crop',
  '[
    {"id": "1", "title": "Registration Phase", "startDate": "2025-12-14T00:00:00Z", "endDate": "2026-02-01T17:00:00Z"},
    {"id": "2", "title": "Idea Submission", "startDate": "2026-02-05T09:00:00Z", "endDate": "2026-02-12T17:00:00Z"}
  ]'::jsonb,
  '[
    {"title": "Decentralized Learning", "icon": "Book", "color": "text-blue-400", "description": "LMS on Chain"},
    {"title": "Credentialing", "icon": "ShieldCheck", "color": "text-green-400", "description": "Verifiable Certificates"}
  ]'::jsonb,
  '{"tabs": [{"id": "announcement", "label": "Announcements"}, {"id": "tracks", "label": "Tracks"}, {"id": "team", "label": "Team"}, {"id": "submission", "label": "Submission"}]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
