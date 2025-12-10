-- Migration: Add Admin Role and System Settings
-- Description: Adds RBAC (Role-Based Access Control) and a dynamic settings table for administrative events.

-- 1. Add 'role' column to 'users' table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN 
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
    END IF; 
END $$;

-- 2. Create 'system_settings' table for dynamic configuration (e.g., Event Buttons, Global Alerts)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY, 
  value JSONB NOT NULL,        
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Policy: Public can view active settings (needed for Navbar to show event buttons)
DROP POLICY IF EXISTS "Public can view settings" ON system_settings;
CREATE POLICY "Public can view settings" ON system_settings FOR SELECT USING (true);

-- Policy: Only Admins can insert/update/delete settings
-- NOTE: This relies on the 'role' column added in step 1.
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;
CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Insert Default Settings (Example: An inactive Event Button)
INSERT INTO system_settings (key, value, description, is_active)
VALUES (
  'event_button_config', 
  '{"label": "Hackathon 2025", "url": "/hackathon", "style": "gradient-purple"}'::jsonb, 
  'Configuration for the special event button in the Navbar',
  false
) ON CONFLICT (key) DO NOTHING;

-- =================================================================
-- INSTRUCTION FOR DBA:
-- To promote a user to Admin, execute the following manually:
-- UPDATE users SET role = 'admin' WHERE wallet = 'TARGET_WALLET_ADDRESS';
-- =================================================================
